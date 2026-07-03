#!/usr/bin/env bash
#
# dualwan-router.sh
#
# Complete Raspberry Pi Linux dual-WAN failover router setup.
#
# Designed for:
#   RPi 3B/3B+ / 4 running Raspberry Pi OS or Debian with NetworkManager
#
# Physical/VLAN layout:
#   eth0.10  -> WAN1, DHCP
#   eth0.20  -> WAN2, DHCP
#   eth0.30  -> LAN, 192.168.10.1/24
#
# TL-SG105E:
#   P1 = untagged VLAN 10 (ISP1)
#   P2 = untagged VLAN 20 (ISP2)
#   P3 = untagged VLAN 30 (LAN)
#   P5 = tagged VLANs 10/20/30 (RPi trunk)
#
# WAN1 is primary. WAN2 is backup.
# NetworkManager handles VLANs + DHCP.
# The dualwan-failover daemon handles policy routing + health checks + failover.
#
# IMPORTANT:
#   Do NOT run this over the RPi's Wi-Fi if Wi-Fi is using 192.168.1.0/24,
#   because WAN1 in the tested setup also uses 192.168.1.0/24.
#
# Usage:
#   chmod +x dualwan-router.sh
#   sudo ./dualwan-router.sh
#
# Re-running is supported; current daemon/dnsmasq/nftables configs are backed up.

set -euo pipefail

WAN1_DEV="eth0.10"
WAN2_DEV="eth0.20"
LAN_DEV="eth0.30"

WAN1_CONN="router-wan1"
WAN2_CONN="router-wan2"
LAN_CONN="router-lan"

LAN_ADDR="192.168.10.1/24"

WAN1_TABLE=101
WAN2_TABLE=102
WAN1_PREF=10100
WAN2_PREF=10200
WAN1_METRIC=10
WAN2_METRIC=20

DAEMON="/usr/local/sbin/dualwan-failover"
UNIT="/etc/systemd/system/dualwan-failover.service"
SYSCTL_FILE="/etc/sysctl.d/99-dualwan-router.conf"
DNSMASQ_CONF="/etc/dnsmasq.d/dualwan-router.conf"
NFTABLES_CONF="/etc/nftables.conf"
RT_TABLES="/etc/iproute2/rt_tables"

BACKUP_DIR="/root/dualwan-router-backups/$(date +%Y%m%d-%H%M%S)"

log() {
    echo "[dualwan-router] $*"
}

die() {
    echo "[dualwan-router] ERROR: $*" >&2
    exit 1
}

need_root() {
    [[ $EUID -eq 0 ]] || die "Run this script with sudo/root."
}

backup_file() {
    local f="$1"
    if [[ -e "$f" ]]; then
        mkdir -p "$BACKUP_DIR"
        cp -a "$f" "$BACKUP_DIR/"
    fi
}

install_packages() {
    log "Installing required packages..."
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y \
        network-manager \
        dnsmasq \
        nftables \
        iproute2 \
        iputils-ping
}

ensure_vlan_connection() {
    local name="$1"
    local ifname="$2"
    local vlan_id="$3"

    if nmcli -t -f NAME connection show | grep -Fxq "$name"; then
        nmcli connection modify "$name" \
            connection.interface-name "$ifname" \
            connection.autoconnect yes \
            connection.autoconnect-retries 0 \
            ipv6.method disabled
    else
        nmcli connection add \
            type vlan \
            ifname "$ifname" \
            dev eth0 \
            id "$vlan_id" \
            con-name "$name" \
            ipv6.method disabled \
            connection.autoconnect yes \
            connection.autoconnect-retries 0
    fi
}

configure_networkmanager() {
    log "Configuring NetworkManager VLANs..."

    ensure_vlan_connection "$WAN1_CONN" "$WAN1_DEV" 10
    ensure_vlan_connection "$WAN2_CONN" "$WAN2_DEV" 20
    ensure_vlan_connection "$LAN_CONN"  "$LAN_DEV"  30

    # WAN profiles:
    # DHCP supplies the address and router.
    # NetworkManager is intentionally NOT allowed to install a default route.
    # The failover daemon owns the routing tables and main default.
    nmcli connection modify "$WAN1_CONN" \
        connection.autoconnect yes \
        connection.autoconnect-retries 0 \
        ipv4.method auto \
        ipv4.never-default yes \
        ipv4.route-table 0 \
        ipv4.route-metric 40000 \
        ipv4.dhcp-timeout 15 \
        ipv6.method disabled

    nmcli connection modify "$WAN2_CONN" \
        connection.autoconnect yes \
        connection.autoconnect-retries 0 \
        ipv4.method auto \
        ipv4.never-default yes \
        ipv4.route-table 0 \
        ipv4.route-metric 40000 \
        ipv4.dhcp-timeout 15 \
        ipv6.method disabled

    # LAN.
    nmcli connection modify "$LAN_CONN" \
        connection.autoconnect yes \
        ipv4.method manual \
        ipv4.addresses "$LAN_ADDR" \
        ipv4.never-default yes \
        ipv4.route-table 0 \
        ipv4.dns "" \
        ipv6.method disabled

    # Bring LAN up. WAN1/WAN2 activation is deliberately non-fatal:
    # either WAN may be physically disconnected during installation.
    nmcli connection up "$LAN_CONN" --wait 10 >/dev/null 2>&1 || true
    nmcli connection up "$WAN1_CONN" --wait 10 >/dev/null 2>&1 || true
    nmcli connection up "$WAN2_CONN" --wait 5 >/dev/null 2>&1 || true

    log "NetworkManager VLAN profiles configured."
}

configure_sysctl() {
    log "Enabling IPv4 forwarding and disabling strict reverse-path filtering..."

    backup_file "$SYSCTL_FILE"

    cat > "$SYSCTL_FILE" <<'EOF'
# Dual-WAN Linux router
net.ipv4.ip_forward = 1

# Necessary for multi-WAN/policy-routing setups.
net.ipv4.conf.all.rp_filter = 0
net.ipv4.conf.default.rp_filter = 0

# Router should not accept or send ICMP redirects.
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
EOF

    sysctl --system >/dev/null
}

configure_dnsmasq() {
    log "Configuring dnsmasq for LAN DHCP/DNS..."

    mkdir -p "$(dirname "$DNSMASQ_CONF")"
    backup_file "$DNSMASQ_CONF"

    cat > "$DNSMASQ_CONF" <<'EOF'
# Dual-WAN router LAN DHCP/DNS
interface=eth0.30
listen-address=192.168.10.1
bind-dynamic

# LAN DHCP pool
dhcp-range=192.168.10.100,192.168.10.199,255.255.255.0,12h
dhcp-option=3,192.168.10.1
dhcp-option=6,192.168.10.1
dhcp-authoritative

# Upstream DNS. Traffic follows the active WAN route.
no-resolv
server=1.1.1.1
server=8.8.8.8

domain-needed
bogus-priv
EOF

    # Disable any legacy standalone config that might define another DHCP
    # interface/range. Keep the original /etc/dnsmasq.conf backed up.
    backup_file /etc/dnsmasq.conf

    # If dnsmasq.conf exists and was previously customized, do not destroy it.
    # Our drop-in is authoritative for the dual-WAN LAN interface.
    systemctl enable dnsmasq >/dev/null
    systemctl restart dnsmasq
}

configure_nftables() {
    log "Configuring nftables firewall/NAT..."

    backup_file "$NFTABLES_CONF"

    cat > "$NFTABLES_CONF" <<'EOF'
#!/usr/sbin/nft -f

flush ruleset

table inet dualwan {
    chain input {
        type filter hook input priority filter; policy drop;

        # Local traffic.
        iifname "lo" accept

        # Established traffic.
        ct state established,related accept

        # Trust the LAN.
        iifname "eth0.30" accept

        # Allow DHCP replies from either ISP to the local DHCP client.
        iifname { "eth0.10", "eth0.20" } \
            udp sport 67 udp dport 68 accept

        # ICMP is useful for router diagnostics and PMTU.
        ip protocol icmp accept
    }

    chain forward {
        type filter hook forward priority filter; policy drop;

        # Return traffic for LAN connections.
        ct state established,related accept

        # LAN -> either WAN.
        iifname "eth0.30" oifname { "eth0.10", "eth0.20" } accept
    }

    chain output {
        type filter hook output priority filter; policy accept;
    }

    chain postrouting {
        type nat hook postrouting priority srcnat; policy accept;

        # NAT on both WANs; only the active WAN carries the default route.
        oifname { "eth0.10", "eth0.20" } masquerade
    }
}
EOF

    systemctl enable nftables >/dev/null
    systemctl restart nftables
}

configure_routing_tables() {
    log "Registering policy-routing table names..."

    mkdir -p "$(dirname "$RT_TABLES")"
    touch "$RT_TABLES"

    grep -Eq '^[[:space:]]*101[[:space:]]+wan1[[:space:]]*$' "$RT_TABLES" ||
        echo "101 wan1" >> "$RT_TABLES"

    grep -Eq '^[[:space:]]*102[[:space:]]+wan2[[:space:]]*$' "$RT_TABLES" ||
        echo "102 wan2" >> "$RT_TABLES"
}

install_daemon() {
    log "Installing dual-WAN health/failover daemon..."

    backup_file "$DAEMON"

    cat > "$DAEMON" <<'EOF'
#!/usr/bin/env bash
set -u

WAN1_DEV="eth0.10"
WAN2_DEV="eth0.20"

WAN1_TABLE=101
WAN2_TABLE=102

WAN1_PREF=10100
WAN2_PREF=10200

WAN1_METRIC=10
WAN2_METRIC=20

CHECK_IPS=("1.1.1.1" "8.8.8.8" "9.9.9.9")
CHECK_WAIT=2
POLL_INTERVAL=3

log() {
    echo "[dualwan-failover] $*"
    logger -t dualwan-failover -- "$*" 2>/dev/null || true
}

get_ip() {
    nmcli -g IP4.ADDRESS device show "$1" 2>/dev/null |
        awk -F/ 'NF {print $1; exit}'
}

get_gw() {
    local dev="$1"

    # nmcli output is:
    # DHCP4.OPTION[19]: requested_routers = 1
    # DHCP4.OPTION[24]: routers = 192.168.1.1
    #
    # Match EXACTLY "routers", not "requested_routers".
    nmcli -f DHCP4.OPTION device show "$dev" 2>/dev/null |
        awk -F': *' '
            $2 ~ /^[[:space:]]*routers[[:space:]]*=/ {
                sub(/^[[:space:]]*routers[[:space:]]*=[[:space:]]*/, "", $2)
                print $2
                exit
            }
        ' |
        awk '{print $1}'
}

is_connected() {
    local s
    s="$(nmcli -g GENERAL.STATE device show "$1" 2>/dev/null | head -n1 || true)"
    [[ "$s" == 100* ]]
}

clear_table_and_rule() {
    local table="$1"
    local pref="$2"

    ip -4 rule del pref "$pref" >/dev/null 2>&1 || true
    ip -4 route flush table "$table" >/dev/null 2>&1 || true
}

prepare_wan_table() {
    local dev="$1"
    local table="$2"
    local pref="$3"
    local ip="$4"
    local gw="$5"

    [[ -n "$ip" && -n "$gw" ]] || return 1

    ip -4 rule del pref "$pref" >/dev/null 2>&1 || true
    ip -4 route flush table "$table" >/dev/null 2>&1 || true

    # Explicit gateway host route means the dedicated table is self-contained,
    # even if both WANs use the same RFC1918 subnet/gateway.
    ip -4 route replace "$gw/32" \
        dev "$dev" src "$ip" \
        table "$table" || return 1

    ip -4 route replace default \
        via "$gw" dev "$dev" src "$ip" \
        table "$table" || return 1

    ip -4 rule add pref "$pref" \
        from "$ip/32" lookup "$table" || return 1

    return 0
}

route_is_correct() {
    local src="$1"
    local dev="$2"
    local gw="$3"
    local r

    r="$(ip -4 route get 1.1.1.1 from "$src" 2>/dev/null || true)"

    [[ "$r" == *"dev $dev"* ]] || return 1
    [[ "$r" == *"via $gw"* ]] || return 1
}

probe_wan() {
    local dev="$1"
    local src="$2"
    local gw="$3"
    local ok=0
    local target

    # First prove the directly connected ISP gateway responds.
    ping -4 -I "$src" -c 1 -W "$CHECK_WAIT" "$gw" >/dev/null 2>&1 || return 1

    # Prove the source-specific route really selects this WAN.
    route_is_correct "$src" "$dev" "$gw" || return 1

    # Require 2 of 3 independent Internet targets.
    for target in "${CHECK_IPS[@]}"; do
        if ping -4 -I "$src" -c 1 -W "$CHECK_WAIT" "$target" >/dev/null 2>&1; then
            ok=$((ok + 1))
        fi
    done

    [[ "$ok" -ge 2 ]]
}

delete_default() {
    local dev="$1"
    local metric="$2"

    while ip -4 route del default \
        dev "$dev" metric "$metric" >/dev/null 2>&1; do
        :
    done
}

set_active_default() {
    local dev="$1"
    local src="$2"
    local gw="$3"
    local metric="$4"

    delete_default "$WAN1_DEV" "$WAN1_METRIC"
    delete_default "$WAN2_DEV" "$WAN2_METRIC"

    # onlink makes this robust when both WANs use the same private subnet.
    ip -4 route replace default \
        via "$gw" dev "$dev" src "$src" \
        metric "$metric" onlink
}

last_state=""

while :; do
    w1=0
    w2=0

    ip1=""
    ip2=""
    gw1=""
    gw2=""

    if is_connected "$WAN1_DEV"; then
        ip1="$(get_ip "$WAN1_DEV")"
        gw1="$(get_gw "$WAN1_DEV")"

        if prepare_wan_table "$WAN1_DEV" "$WAN1_TABLE" "$WAN1_PREF" "$ip1" "$gw1" &&
           probe_wan "$WAN1_DEV" "$ip1" "$gw1"; then
            w1=1
        else
            clear_table_and_rule "$WAN1_TABLE" "$WAN1_PREF"
        fi
    else
        clear_table_and_rule "$WAN1_TABLE" "$WAN1_PREF"
    fi

    if is_connected "$WAN2_DEV"; then
        ip2="$(get_ip "$WAN2_DEV")"
        gw2="$(get_gw "$WAN2_DEV")"

        if prepare_wan_table "$WAN2_DEV" "$WAN2_TABLE" "$WAN2_PREF" "$ip2" "$gw2" &&
           probe_wan "$WAN2_DEV" "$ip2" "$gw2"; then
            w2=1
        else
            clear_table_and_rule "$WAN2_TABLE" "$WAN2_PREF"
        fi
    else
        clear_table_and_rule "$WAN2_TABLE" "$WAN2_PREF"
    fi

    if (( w1 )); then
        set_active_default "$WAN1_DEV" "$ip1" "$gw1" "$WAN1_METRIC"
        active="WAN1"
    elif (( w2 )); then
        set_active_default "$WAN2_DEV" "$ip2" "$gw2" "$WAN2_METRIC"
        active="WAN2"
    else
        delete_default "$WAN1_DEV" "$WAN1_METRIC"
        delete_default "$WAN2_DEV" "$WAN2_METRIC"
        active="NONE"
    fi

    state="W1=$w1:$ip1:$gw1 W2=$w2:$ip2:$gw2 ACTIVE=$active"

    if [[ "$state" != "$last_state" ]]; then
        last_state="$state"

        if (( w1 )); then
            log "WAN1: UP ($ip1 via $gw1)"
        else
            log "WAN1: DOWN ${ip1:+($ip1 via $gw1)}"
        fi

        if (( w2 )); then
            log "WAN2: UP ($ip2 via $gw2)"
        else
            log "WAN2: DOWN ${ip2:+($ip2 via $gw2)}"
        fi

        log "Active WAN: $active"
    fi

    sleep "$POLL_INTERVAL"
done
EOF

    chmod 755 "$DAEMON"
}

install_systemd_unit() {
    log "Installing systemd service..."

    backup_file "$UNIT"

    cat > "$UNIT" <<'EOF'
[Unit]
Description=Dual-WAN health monitor and failover router
After=NetworkManager.service network-online.target nftables.service dnsmasq.service
Wants=network-online.target
Requires=NetworkManager.service

[Service]
Type=simple
ExecStart=/usr/local/sbin/dualwan-failover
Restart=always
RestartSec=2
KillSignal=SIGTERM

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable dualwan-failover.service >/dev/null
}

clear_stale_router_state() {
    log "Clearing stale policy rules/routes from previous versions..."

    ip -4 rule del pref "$WAN1_PREF" >/dev/null 2>&1 || true
    ip -4 rule del pref "$WAN2_PREF" >/dev/null 2>&1 || true

    ip -4 route flush table "$WAN1_TABLE" >/dev/null 2>&1 || true
    ip -4 route flush table "$WAN2_TABLE" >/dev/null 2>&1 || true

    while ip -4 route del default dev "$WAN1_DEV" metric "$WAN1_METRIC" \
        >/dev/null 2>&1; do :; done

    while ip -4 route del default dev "$WAN2_DEV" metric "$WAN2_METRIC" \
        >/dev/null 2>&1; do :; done
}

verify_install() {
    log "Running basic post-install checks..."

    if ! command -v nmcli >/dev/null 2>&1; then
        die "nmcli is not available."
    fi

    if ! command -v nft >/dev/null 2>&1; then
        die "nft is not available."
    fi

    [[ -x "$DAEMON" ]] || die "Failover daemon was not installed correctly."
    # Wait briefly for LAN.
    for _ in {1..10}; do
        ip -4 addr show dev "$LAN_DEV" | grep -q '192\.168\.10\.1/24' && break
        sleep 1
    done

    ip -4 addr show dev "$LAN_DEV" | grep -q '192\.168\.10\.1/24' ||
        log "WARNING: $LAN_DEV does not currently have 192.168.10.1/24."

    if nmcli -g GENERAL.STATE device show "$WAN1_DEV" 2>/dev/null | grep -q '^100'; then
        log "WAN1 VLAN is connected."
    else
        log "WAN1 is not currently connected; this is allowed."
    fi

    if nmcli -g GENERAL.STATE device show "$WAN2_DEV" 2>/dev/null | grep -q '^100'; then
        log "WAN2 VLAN is connected."
    else
        log "WAN2 is not currently connected; this is allowed."
    fi
}

main() {
    need_root

    log "Starting complete dual-WAN router installation."
    log "Backups will be stored in: $BACKUP_DIR"

    install_packages

    systemctl enable NetworkManager >/dev/null
    systemctl start NetworkManager

    configure_networkmanager
    configure_sysctl
    configure_dnsmasq
    configure_nftables
    configure_routing_tables
    install_daemon
    install_systemd_unit
    clear_stale_router_state

    systemctl daemon-reload
    systemctl restart nftables
    systemctl restart dnsmasq
    systemctl restart NetworkManager

    # NetworkManager restart can take a moment to recreate VLANs/leases.
    sleep 3

    systemctl restart dualwan-failover.service

    verify_install

    log ""
    log "Installation complete."
    log ""
    log "Useful commands:"
    log "  journalctl -fu dualwan-failover"
    log "  ip -4 rule show"
    log "  ip -4 route show table 101"
    log "  ip -4 route show table 102"
    log "  ip -4 route"
    log "  nmcli device status"
    log "  nft list ruleset"
    log ""
    log "WAN1 should become primary when its gateway/Internet tests pass."
    log "WAN2 may remain physically disconnected without breaking the router."
    log ""
    log "IMPORTANT: because the tested WAN1 uses 192.168.1.0/24,"
    log "keep the RPi's built-in Wi-Fi disabled on the finished router."
}

main "$@"
