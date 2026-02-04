#!/bin/bash

# Filter out specific keys from env file

# Default keys to exclude (space-separated)
DEFAULT_EXCLUDE="GOOGLE_CLOUD_PROJECT GCP_PROJECT_ID DRIVE_TEST_FILE_ID AC DEFAULT_SCOPES EXTRA_SCOPES LOG_DESTINATION"


# Check if exclude list is provided as argument
if [[ $# -eq 1 && -f "$1" ]]; then
    # Read exclude list from file
    EXCLUDE_KEYS=$(tr '\n' ' ' < "$1" | sed 's/ $//')
elif [[ $# -gt 0 ]]; then
    # Use provided space-separated list
    EXCLUDE_KEYS="$*"
else
    # Use default exclude list
    EXCLUDE_KEYS="$DEFAULT_EXCLUDE"
fi

# Convert space-separated list to grep-compatible pattern
PATTERN=$(echo "$EXCLUDE_KEYS" | sed 's/ /|/g')

if [[ -n "$PATTERN" ]]; then
    # Filter out lines starting with any of the excluded keys
    grep -vE "^($PATTERN)="
else
    # No filtering, pass through
    cat
fi