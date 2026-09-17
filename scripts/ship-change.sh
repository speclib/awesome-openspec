#!/usr/bin/env bash
# ship-change.sh <change-name> [commit-subject]
#
# Gated tail for shipping ONE implemented OpenSpec change:
#   stage -> gate (nix flake check) -> archive -> commit -> push.
# If the gate fails this aborts before archiving or committing.
set -euo pipefail

CHANGE="${1:?usage: ship-change.sh <change-name> [commit-subject]}"
SUBJECT="${2:-Implement ${CHANGE}}"

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

TASKS="openspec/changes/${CHANGE}/tasks.md"
if [[ ! -d "openspec/changes/${CHANGE}" ]]; then
  echo "ship: no active change ${CHANGE} under openspec/changes/" >&2
  exit 1
fi
if [[ -f "$TASKS" ]] && grep -qE "^\s*- \[ \]" "$TASKS"; then
  echo "ship: $TASKS still has unchecked tasks, finish the apply step first" >&2
  exit 1
fi

echo "==> [1/5] stage working tree (so nix flake sees new files)"
git add -A

echo "==> [2/5] gate: nix flake check"
nix flake check

echo "==> [3/5] archive OpenSpec change: ${CHANGE}"
openspec archive "${CHANGE}" --yes

echo "==> [4/5] commit"
git add -A
jj commit -m "${SUBJECT}"

echo "==> [5/5] push main"
jj bookmark set main -r @-
jj git push --bookmark main

echo "==> shipped ${CHANGE}"
