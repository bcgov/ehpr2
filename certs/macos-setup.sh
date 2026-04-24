#! /bin/zsh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENTERPRISE_CERT_CA="Zscaler Root CA"
PEM_FILE="$SCRIPT_DIR/$(echo "$ENTERPRISE_CERT_CA" | tr ' ' '-' | tr '[:upper:]' '[:lower:]').pem"

# Extract Zscaler Root CA to a PEM file.
if [[ -f "$PEM_FILE" ]]; then
    echo "$ENTERPRISE_CERT_CA PEM file already exists. Skipping extraction."
else
    echo "Extracting $ENTERPRISE_CERT_CA from System Keychain..."
    security find-certificate -c "$ENTERPRISE_CERT_CA" -p > "$PEM_FILE"
    echo "Certificate saved to $PEM_FILE"
fi