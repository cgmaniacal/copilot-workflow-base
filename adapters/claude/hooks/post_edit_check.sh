#!/bin/bash
# PostToolUse hook — stack-aware syntax/type check after Edit/Write operations
# Replaces post_edit_typecheck.sh with support for TypeScript, PHP, C#, and Python
# Reads JSON from stdin, extracts file_path, runs appropriate checker

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
    echo '{}'
    exit 0
fi

# ─── Helper: find nearest config file by walking up directories ───────────────

find_nearest_config() {
    local start_dir="$1"
    local filename="$2"
    local dir="$start_dir"

    while [ "$dir" != "/" ]; do
        if [ -f "$dir/$filename" ]; then
            echo "$dir/$filename"
            return 0
        fi
        dir=$(dirname "$dir")
    done
    return 1
}

find_nearest_pattern() {
    local start_dir="$1"
    local pattern="$2"
    local dir="$start_dir"

    while [ "$dir" != "/" ]; do
        local match
        match=$(find "$dir" -maxdepth 1 -name "$pattern" -type f 2>/dev/null | head -1)
        if [ -n "$match" ]; then
            echo "$match"
            return 0
        fi
        dir=$(dirname "$dir")
    done
    return 1
}

# ─── Helper: escape a string for embedding in JSON ───────────────────────────

escape_json() {
    echo "$1" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr '\n' ' ' | sed 's/[[:space:]]*$//'
}

# ─── Dispatch by file extension ──────────────────────────────────────────────

FILE_DIR=$(dirname "$FILE_PATH")

case "$FILE_PATH" in
    *.ts|*.tsx)
        # Find nearest tsconfig.json
        TSCONFIG=$(find_nearest_config "$FILE_DIR" "tsconfig.json")
        if [ -z "$TSCONFIG" ]; then
            echo '{}'
            exit 0
        fi

        TSCONFIG_DIR=$(dirname "$TSCONFIG")
        ERRORS=$(cd "$TSCONFIG_DIR" && npx tsc --noEmit -p "$TSCONFIG" 2>&1 | grep -A 1 "$(basename "$FILE_PATH")" | head -10)

        if [ -n "$ERRORS" ] && echo "$ERRORS" | grep -q "error TS"; then
            ESCAPED=$(escape_json "$(echo "$ERRORS" | head -5)")
            echo "{\"decision\":\"allow\",\"reason\":\"TypeScript error detected after edit: $ESCAPED\"}"
        else
            echo '{}'
        fi
        exit 0
        ;;

    *.php)
        OUTPUT=$(php -l "$FILE_PATH" 2>&1)
        EXIT_CODE=$?
        if [ $EXIT_CODE -ne 0 ]; then
            ESCAPED=$(escape_json "$OUTPUT")
            echo "{\"decision\":\"allow\",\"reason\":\"PHP syntax error: $ESCAPED\"}"
        else
            echo '{}'
        fi
        exit 0
        ;;

    *.cs)
        # Find nearest .csproj by walking up directories
        CSPROJ=$(find_nearest_pattern "$FILE_DIR" "*.csproj")
        if [ -z "$CSPROJ" ]; then
            echo '{}'
            exit 0
        fi

        CSPROJ_DIR=$(dirname "$CSPROJ")
        OUTPUT=$(cd "$CSPROJ_DIR" && dotnet build --no-restore "$CSPROJ" 2>&1 | grep -E "error|Error" | head -5)
        if [ -n "$OUTPUT" ]; then
            ESCAPED=$(escape_json "$OUTPUT")
            echo "{\"decision\":\"allow\",\"reason\":\"C# build error: $ESCAPED\"}"
        else
            echo '{}'
        fi
        exit 0
        ;;

    *.py)
        if command -v ruff &>/dev/null; then
            OUTPUT=$(ruff check "$FILE_PATH" 2>&1 | head -5)
            if [ -n "$OUTPUT" ]; then
                ESCAPED=$(escape_json "$OUTPUT")
                echo "{\"decision\":\"allow\",\"reason\":\"Python lint error (ruff): $ESCAPED\"}"
            else
                echo '{}'
            fi
        else
            echo '{}'
        fi
        exit 0
        ;;

    *)
        # No check for other file types
        echo '{}'
        exit 0
        ;;
esac
