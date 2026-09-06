# Script to deploy Aegis AI to Google Cloud Platform (Project ID: secure-guru-507815-q3)
$PROJECT_ID = "secure-guru-507815-q3"

Write-Host "Configuring GCP Project: $PROJECT_ID..." -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

Write-Host "Enabling Google Cloud Services (Run, Container Registry, Cloud Build)..." -ForegroundColor Cyan
gcloud services enable run.googleapis.com containerregistry.googleapis.com cloudbuild.googleapis.com --project=$PROJECT_ID

Write-Host "Submitting Cloud Build and deploying container to Cloud Run..." -ForegroundColor Cyan
gcloud builds submit --config cloudbuild.yaml

Write-Host "Deployment Complete!" -ForegroundColor Green
