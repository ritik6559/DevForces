#!/usr/bin/env bash
#
# setup.sh — one-time infrastructure bootstrap for DevForces.
#
# Provisions (idempotently):
#   1. The EKS cluster from k8s/cluster-config.yaml
#   2. The `ingress-nginx` namespace
#   3. The `aws-credentials` secret consumed by workspace pods
#   4. The nginx ingress controller
#
# Usage:
#   cp setup.env.example setup.env     # then fill in real values
#   ./setup.sh
#
# On Windows, run from Git Bash or WSL.
#
set -euo pipefail

# Resolve the directory this script lives in so relative paths work from anywhere.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE="${ENV_FILE:-setup.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found." >&2
  echo "       Copy the template first:  cp setup.env.example setup.env" >&2
  exit 1
fi

# Load the env file (export every assignment for child processes).
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

# Defaults for anything not provided in setup.env.
AWS_REGION="${AWS_REGION:-ap-south-1}"
S3_BUCKET_NAME="${S3_BUCKET_NAME:-devforces}"
CLUSTER_CONFIG="${CLUSTER_CONFIG:-k8s/cluster-config.yaml}"
INGRESS_MANIFEST="${INGRESS_MANIFEST:-k8s/ingress-controller.yaml}"
K8S_SECRET_NAME="${K8S_SECRET_NAME:-aws-credentials}"
K8S_SECRET_NAMESPACE="${K8S_SECRET_NAMESPACE:-default}"

# --- Validation -------------------------------------------------------------
require() {
  if [[ -z "${!1:-}" ]]; then
    echo "ERROR: $1 is not set in $ENV_FILE" >&2
    exit 1
  fi
}
require AWS_ACCESS_KEY_ID
require AWS_SECRET_ACCESS_KEY

for tool in eksctl kubectl; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "ERROR: required tool '$tool' is not on your PATH." >&2
    exit 1
  fi
done

for f in "$CLUSTER_CONFIG" "$INGRESS_MANIFEST"; do
  if [[ ! -f "$f" ]]; then
    echo "ERROR: manifest '$f' not found." >&2
    exit 1
  fi
done

# --- 1. EKS cluster ---------------------------------------------------------
echo "==> [1/4] Ensuring EKS cluster exists"
CLUSTER_NAME="$(grep -E '^[[:space:]]*name:' "$CLUSTER_CONFIG" | head -1 | awk '{print $2}')"
CLUSTER_NAME="${CLUSTER_NAME:-devforces-cluster}"

if eksctl get cluster --name "$CLUSTER_NAME" --region "$AWS_REGION" >/dev/null 2>&1; then
  echo "    Cluster '$CLUSTER_NAME' already exists in $AWS_REGION — skipping create."
else
  echo "    Creating cluster '$CLUSTER_NAME' (this can take ~15-20 minutes)..."
  eksctl create cluster -f "$CLUSTER_CONFIG"
fi

# --- 2. ingress-nginx namespace --------------------------------------------
echo "==> [2/4] Ensuring namespace 'ingress-nginx'"
kubectl create namespace ingress-nginx --dry-run=client -o yaml | kubectl apply -f -

# --- 3. aws-credentials secret ---------------------------------------------
echo "==> [3/4] (Re)creating secret '$K8S_SECRET_NAME' in namespace '$K8S_SECRET_NAMESPACE'"
kubectl delete secret "$K8S_SECRET_NAME" -n "$K8S_SECRET_NAMESPACE" --ignore-not-found
kubectl create secret generic "$K8S_SECRET_NAME" \
  -n "$K8S_SECRET_NAMESPACE" \
  --from-literal=AWS_ACCESS_KEY="$AWS_ACCESS_KEY_ID" \
  --from-literal=AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  --from-literal=AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  --from-literal=AWS_REGION="$AWS_REGION" \
  --from-literal=S3_BUCKET_NAME="$S3_BUCKET_NAME"

# --- 4. ingress controller --------------------------------------------------
echo "==> [4/4] Applying nginx ingress controller"
kubectl apply -f "$INGRESS_MANIFEST"

echo
echo "Setup complete. Cluster '$CLUSTER_NAME' is ready."
