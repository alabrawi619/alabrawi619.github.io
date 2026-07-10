---
layout: post
title: "Shell Scripting Patterns I Use Every Week"
date: 2024-03-22 08:00:00 +0000
categories: [tools, devops]
tags: [bash, shell, scripting, productivity]
excerpt: "Collected bash patterns that have saved hours of manual work — from safe script headers to parallel execution."
---

## LOADING PATTERNS…

Bash scripting has a low floor but a very high ceiling. The patterns below are ones I return to repeatedly because they are safe, portable, and clear.

## 1. THE SAFE SCRIPT HEADER

Every non-trivial script should start with these options:

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# -e  : Exit immediately if any command fails
# -u  : Treat unset variables as errors
# -o pipefail : Catch errors in piped commands
# IFS : Safer word splitting (no spaces)
```

Without `set -euo pipefail`, silent failures are common and dangerous.

## 2. CHECKING FOR REQUIRED COMMANDS

```bash
require_cmd() {
    local cmd="$1"
    if ! command -v "$cmd" &>/dev/null; then
        echo "[ERROR] Required command not found: $cmd" >&2
        exit 1
    fi
}

require_cmd git
require_cmd curl
require_cmd jq
```

## 3. LOGGING WITH LEVELS

```bash
log()  { echo "[$(date '+%H:%M:%S')] INFO  : $*"; }
warn() { echo "[$(date '+%H:%M:%S')] WARN  : $*" >&2; }
err()  { echo "[$(date '+%H:%M:%S')] ERROR : $*" >&2; }
die()  { err "$*"; exit 1; }

log  "Starting process..."
warn "Low disk space detected"
die  "Critical failure — aborting"
```

## 4. TEMPORARY FILES WITH CLEANUP

```bash
TMPDIR_WORK=$(mktemp -d)
trap 'rm -rf "$TMPDIR_WORK"' EXIT

# Now use TMPDIR_WORK freely — it auto-cleans on exit
work_file="$TMPDIR_WORK/output.txt"
curl -s "https://api.example.com/data" > "$work_file"
process "$work_file"
```

The `trap ... EXIT` pattern is one of the most useful in Bash. It fires even on errors.

## 5. PARALLEL EXECUTION WITH WAIT

```bash
pids=()

for host in web01 web02 web03; do
    ssh "$host" "sudo systemctl restart nginx" &
    pids+=($!)
done

# Wait for all and collect exit codes
failed=0
for pid in "${pids[@]}"; do
    wait "$pid" || ((failed++))
done

if (( failed > 0 )); then
    die "$failed host(s) failed the restart"
fi

log "All hosts restarted successfully"
```

## 6. PARSING ARGUMENTS

```bash
usage() {
    echo "Usage: $0 [-v] [-o OUTPUT] INPUT"
    exit 1
}

verbose=false
output="/dev/stdout"

while getopts ":vo:" opt; do
    case "$opt" in
        v) verbose=true ;;
        o) output="$OPTARG" ;;
        :) die "Option -$OPTARG requires an argument" ;;
        ?) die "Unknown option: -$OPTARG" ;;
    esac
done

shift $((OPTIND - 1))
input="${1:-}" 
[[ -z "$input" ]] && usage
```

## 7. RETRY LOOP

```bash
retry() {
    local retries=$1; shift
    local delay=$1;   shift
    local attempt=0

    until "$@"; do
        ((attempt++))
        if (( attempt >= retries )); then
            err "Command failed after $retries attempts: $*"
            return 1
        fi
        warn "Attempt $attempt failed. Retrying in ${delay}s…"
        sleep "$delay"
    done
}

# Retry curl up to 5 times with a 3-second backoff
retry 5 3 curl -sf "https://api.example.com/health"
```

## CLOSING TRANSMISSION

```bash
$ cat /etc/motd
The terminal rewards patience.
Learn one pattern per week.
In a year, you'll be dangerous.

$ _
```

These patterns are the result of many hours debugging silent failures and pipelines that ate errors. Start with the safe header — everything else follows from it.
