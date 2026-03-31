#!/bin/bash
set -e

# =============================================================================
# Configuration - Set these environment variables or modify defaults
# =============================================================================
GCP_PROJECT_ID="${GCP_PROJECT_ID:-tts-server-491318}"
GCP_REGION="${GCP_REGION:-us-central1}"
GCS_BUCKET_NAME="${GCS_BUCKET_NAME:-tts-ui}"

# =============================================================================
# Functions
# =============================================================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v gcloud &> /dev/null; then
        error "gcloud CLI not found. Please install Google Cloud SDK."
        exit 1
    fi
    
    gcloud config set project "$GCP_PROJECT_ID"
    log "Using project: $GCP_PROJECT_ID"
}

# =============================================================================
# Dotenv support
# =============================================================================

load_env_file() {
    ENV_FILE="$1"

    if [ ! -f "$ENV_FILE" ]; then
        return 0
    fi

    log "Loading env vars from $ENV_FILE"
    # Support lines like KEY=VALUE and skip comments/empty lines
    grep -E '^[^#[:space:]]' "$ENV_FILE" | while IFS='=' read -r key value; do
        # Trim whitespace
        key="$(echo "$key" | xargs)"
        value="$(echo "$value" | xargs)"

        case "$key" in
            ""|\#*) continue ;;
        esac

        # Strip optional surrounding quotes
        value="${value%\"}"
        value="${value#\"}"

        export "$key"="$value"
    done
}

# =============================================================================
# Build Application
# =============================================================================

build_app() {
    # Support both .env.prod and .env.production (Vite default)
    if [ -f ".env.prod" ]; then
        load_env_file ".env.prod"
    fi

    if [ -f ".env.production" ]; then
        load_env_file ".env.production"
    fi

    log "Building application with production environment..."
    npm run build -- --mode production
    log "Build complete. Output in dist/"
}

# =============================================================================
# GCS Bucket Setup
# =============================================================================

setup_bucket() {
    log "Setting up GCS bucket: gs://${GCS_BUCKET_NAME}"
    
    if ! gcloud storage buckets describe "gs://${GCS_BUCKET_NAME}" --project="$GCP_PROJECT_ID" &>/dev/null; then
        log "Creating bucket..."
        gcloud storage buckets create "gs://${GCS_BUCKET_NAME}" \
            --location="${GCP_REGION}" \
            --uniform-bucket-level-access \
            --project="$GCP_PROJECT_ID"
        log "Bucket created."
    else
        log "Bucket already exists."
    fi
    
    log "Setting bucket to public..."
    gcloud storage buckets add-iam-policy-binding \
        "gs://${GCS_BUCKET_NAME}" \
        --member=allUsers \
        --role=roles/storage.objectViewer \
        --project="$GCP_PROJECT_ID" \
        2>/dev/null || log "Public access already configured."
    
    log "Configuring bucket for SPA routing..."
    gcloud storage buckets update "gs://${GCS_BUCKET_NAME}" \
        --web-main-page-suffix=index.html \
        --web-error-page=index.html \
        --project="$GCP_PROJECT_ID"
}

# =============================================================================
# Upload Files
# =============================================================================

upload_files() {
    log "Uploading build files..."
    
    # Upload index.html with no-cache for immediate updates
    log "Uploading index.html (no-cache)..."
    gcloud storage cp dist/index.html "gs://${GCS_BUCKET_NAME}/index.html" \
        --cache-control="no-cache, no-store, max-age=0" \
        --project="$GCP_PROJECT_ID"
    
    # Upload static assets with long cache
    if [ -d "dist/assets" ]; then
        log "Uploading assets (1 year cache)..."
        gcloud storage cp dist/assets/** "gs://${GCS_BUCKET_NAME}/assets/" \
            --cache-control="public,max-age=31536000,immutable" \
            --project="$GCP_PROJECT_ID"
    fi
    
    # Upload other files
    log "Uploading other files..."
    gcloud storage rsync dist/ "gs://${GCS_BUCKET_NAME}/" \
        --exclude="assets/**" \
        --exclude="index.html" \
        --cache-control="public,max-age=31536000,immutable" \
        --recursive \
        --project="$GCP_PROJECT_ID"
    
    log "Files uploaded."
}

# =============================================================================
# Purge CDN Cache
# =============================================================================

purge_cache() {
    log "Purging CDN cache..."
    gcloud compute url-maps invalidate-cdn-cache games \
        --path="/*" \
        --global \
        --project="$GCP_PROJECT_ID" 2>/dev/null || log "Cache purge initiated."
}

# =============================================================================
# Main
# =============================================================================

main() {
    log "========================================"
    log "Starting frontend deployment"
    log "========================================"
    
    check_prerequisites
    build_app
    setup_bucket
    upload_files
    purge_cache
    
    log ""
    log "========================================"
    log "Deployment complete!"
    log "========================================"
    log "GCS Bucket: gs://${GCS_BUCKET_NAME}"
    log ""
    log "CDN/Load Balancer is already configured (backend: games)"
}

main "$@"
