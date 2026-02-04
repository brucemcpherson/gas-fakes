
#!/bin/bash
set -e

# 1. Prepare Environment
ENV_PATH=".env"
ENV_YAML=".env.yaml" # Matches **/.env* in .gitignore for safety

if [ -f "$ENV_PATH" ]; then
    echo "--- Loading variables from local $ENV_PATH ---"
    export $(grep -v '^#' "$ENV_PATH" | xargs)
    
    echo "--- Generating $ENV_YAML with de-duplication ---"
    # Define any script-specific overrides here (KEY=VALUE, separated by |)
    OVERRIDES="GOOGLE_WORKSPACE_SUBJECT=$(gcloud config get-value account)"
    
    # Use awk to merge .env and script overrides into a single YAML map
    awk -v overrides="$OVERRIDES" '
        BEGIN { 
            FS="="; OFS=": " 
        }
        # Process .env file lines
        /^#/ || /^$/ { next }
        {
            key=$1
            val=substr($0, index($0,"=")+1)
            vars[key]=val
        }
        END {
            # Apply overrides: overrides is a string of KEY=VALUE separated by |
            split(overrides, ov_list, "|")
            for (i in ov_list) {
                sep_idx = index(ov_list[i], "=")
                if (sep_idx > 0) {
                    ov_key = substr(ov_list[i], 1, sep_idx - 1)
                    ov_val = substr(ov_list[i], sep_idx + 1)
                    vars[ov_key] = ov_val
                }
            }
            for (v in vars) print v, vars[v]
        }
    ' "$ENV_PATH" > "$ENV_YAML"
else
    echo "Error: .env not found" && exit 1
fi

# 2. Build Image
REGION="europe-west1"
JOB_NAME="gas-fakes-job"
REPO_NAME="gas-fakes-repo"
IMAGE_PATH="$REGION-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/$REPO_NAME/$JOB_NAME"

# Ensure the Artifact Registry repository exists
gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" >/dev/null 2>&1 || \
    gcloud artifacts repositories create "$REPO_NAME" \
    --repository-format=docker \
    --location="$REGION" \
    --description="Docker repository for gas-fakes"

gcloud builds submit . --config=cloudbuild.yaml --substitutions=_IMAGE_PATH="$IMAGE_PATH"

# 3. Create or Update Job
COMMAND=$(gcloud run jobs describe "$JOB_NAME" --region "$REGION" >/dev/null 2>&1 && echo "update" || echo "create")

gcloud run jobs $COMMAND "$JOB_NAME" \
    --image "$IMAGE_PATH" \
    --region "$REGION" \
    --service-account "${GOOGLE_SERVICE_ACCOUNT_NAME}@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com" \
    --tasks 1 \
    --max-retries 0 \
    --task-timeout 86400 \
    --cpu 1 \
    --memory 2Gi \
    --env-vars-file "$ENV_YAML"

rm "$ENV_YAML"

# 4. Execute and Monitor
echo "--- Starting Execution ---"
EXEC_NAME=$(gcloud run jobs execute "$JOB_NAME" --region "$REGION" --format='value(metadata.name)')

if [ -z "$EXEC_NAME" ]; then
    echo "Error: Failed to start execution or capture execution name."
    exit 1
fi
echo "--- Execution Started: $EXEC_NAME ---"

# 5. Tail logs in background
echo "--- Tailing logs (Automatic close on completion) ---"
gcloud alpha run jobs logs tail "$JOB_NAME" --region "$REGION" &
TAIL_PID=$!

# Ensure the tail process is killed when the script exits (even on error or Ctrl+C)
trap "kill $TAIL_PID 2>/dev/null || true" EXIT

# 6. Wait for the specific execution to complete
echo "--- Waiting for job completion... ---"
while true; do
    # Check if completionTime is set (which indicates the job is finished)
    FINISHED=$(gcloud run jobs executions describe "$EXEC_NAME" --region "$REGION" --format='value(status.completionTime)' 2>/dev/null || echo "")
    if [ -n "$FINISHED" ]; then
        break
    fi
    sleep 5
done

echo "--- Job $EXEC_NAME completed at $FINISHED. ---"