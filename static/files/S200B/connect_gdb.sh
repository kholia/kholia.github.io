#!/bin/bash
# Connect GDB to running JLink server

cd /home/user/Desktop/tapo

echo "=========================================="
echo "Connecting GDB to JLink..."
echo "=========================================="

# Check if JLink is running
if ! pgrep -x "JLinkGDBServer" > /dev/null; then
    echo "ERROR: JLink GDB Server is not running!"
    echo ""
    echo "Start it first with:"
    echo "  ./start_jlink_only.sh"
    echo ""
    exit 1
fi

# Check if port is listening
if ! netstat -tuln 2>/dev/null | grep -q ":2331 " && ! ss -tuln 2>/dev/null | grep -q ":2331 "; then
    echo "WARNING: JLink may not be listening on port 2331"
    echo "Trying to connect anyway..."
fi

echo ""
echo "✓ JLink server detected"
echo "✓ Waiting for server to be ready..."
sleep 1

echo "✓ Starting GDB with debug script..."
echo ""
echo "=========================================="
echo "INSTRUCTIONS:"
echo "=========================================="
echo "1. Wait for breakpoints to be set"
echo "2. Press the S200B button"
echo "3. Watch for hash calculation output"
echo "4. Press button 2-3 times to capture data"
echo "5. Type 'quit' to exit when done"
echo "=========================================="
echo ""

# Try GDB connection with retries
MAX_GDB_RETRIES=5
for i in $(seq 1 $MAX_GDB_RETRIES); do
    echo "GDB connection attempt $i/$MAX_GDB_RETRIES..."

    if arm-none-eabi-gdb -q -x debug_hash.gdb 2>&1; then
        break
    else
        if [ $i -lt $MAX_GDB_RETRIES ]; then
            echo "Connection failed, retrying in 2 seconds..."
            sleep 2
        else
            echo ""
            echo "ERROR: Could not connect GDB after $MAX_GDB_RETRIES attempts"
            echo "Please restart JLink server: ./start_jlink_only.sh"
        fi
    fi
done

echo ""
echo "GDB session ended."

