#!/bin/bash
# Start JLink GDB Server with retries (no automatic GDB launch)

echo "=========================================="
echo "Starting JLink GDB Server"
echo "=========================================="

# Kill any existing instances
echo "Cleaning up existing JLink servers..."
pkill -9 JLinkGDBServer 2>/dev/null
sleep 0.1

# Try to start with retries
MAX_RETRIES=16
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo ""
    echo "Attempt $((RETRY_COUNT + 1))/$MAX_RETRIES..."

    # Start JLink
    JLinkGDBServer -device CORTEX-M0 -if SWD -speed 4000 -port 2331 -select USB &
    JLINK_PID=$!

    # Wait for initialization
    sleep 0.5

    # Check if running
    if pgrep -x "JLinkGDBServer" > /dev/null; then
        echo ""
        echo "✓✓✓ JLink GDB Server is RUNNING! ✓✓✓"
        echo "PID: $JLINK_PID"
        echo "Port: 2331"
        echo ""
        echo "Now you can run GDB in another terminal:"
        echo "  cd /home/user/Desktop/tapo"
        echo "  arm-none-eabi-gdb -q -x debug_hash.gdb"
        echo ""
        echo "Or just run:"
        echo "  ./connect_gdb.sh"
        echo ""
        echo "Press Ctrl+C to stop JLink server when done."
        echo ""

        # Keep running
        wait $JLINK_PID
        exit 0
    else
        echo "✗ Failed to start"
        RETRY_COUNT=$((RETRY_COUNT + 1))

        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "Waiting 2 seconds before retry..."
            sleep 0.1
        fi
    fi
done

echo ""
echo "ERROR: Could not start JLink GDB Server"
echo ""
echo "Troubleshooting:"
echo "  1. Check USB connection: lsusb | grep -i jlink"
echo "  2. Check permissions: sudo chmod 666 /dev/bus/usb/*/*"
echo "  3. Try manually: JLinkExe"
echo ""
exit 1

