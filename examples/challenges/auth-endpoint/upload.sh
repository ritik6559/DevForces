#!/usr/bin/env bash
#
# Uploads the auth-endpoint challenge to S3 in the layout the platform expects.
#
#   base/<CONTEST_ID>/challenges/<CHALLENGE_ID>/         <- starter files (copied to each user on join)
#   contests/<CONTEST_ID>/challenges/<CHALLENGE_ID>/tests.js   <- grader (injected at judge time)
#
# Usage:
#   ./upload.sh <CONTEST_ID> <CHALLENGE_ID> [BUCKET]
#
# Requires the AWS CLI configured with write access to the bucket (default: devforces).
#
set -euo pipefail

CONTEST_ID="${1:?Usage: ./upload.sh <CONTEST_ID> <CHALLENGE_ID> [BUCKET]}"
CHALLENGE_ID="${2:?Usage: ./upload.sh <CONTEST_ID> <CHALLENGE_ID> [BUCKET]}"
BUCKET="${3:-devforces}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BASE_PREFIX="s3://${BUCKET}/base/${CONTEST_ID}/challenges/${CHALLENGE_ID}"
TESTS_KEY="s3://${BUCKET}/contests/${CONTEST_ID}/challenges/${CHALLENGE_ID}/tests.js"

echo "==> Uploading starter files to ${BASE_PREFIX}/"
aws s3 cp "${SCRIPT_DIR}/base/package.json" "${BASE_PREFIX}/package.json"
aws s3 cp "${SCRIPT_DIR}/base/app.js"       "${BASE_PREFIX}/app.js"
aws s3 cp "${SCRIPT_DIR}/base/index.js"     "${BASE_PREFIX}/index.js"

echo "==> Uploading grader to ${TESTS_KEY}"
aws s3 cp "${SCRIPT_DIR}/tests.js" "${TESTS_KEY}"

echo
echo "✅ Done. Remember the DB rows must also exist:"
echo "   - Challenge row (challenge_id=${CHALLENGE_ID}, max_points set, tech_stack=NODEJS)"
echo "   - ContestToChallengeMapping for (${CONTEST_ID}, ${CHALLENGE_ID})"
echo "   - Contest status = ACTIVE"
