Project Overview

This repository contains a full-stack MEAN (MongoDB, Express, Angular, Node.js) application. The application has been containerized and deployed on an Ubuntu VM using Docker Compose. CI/CD is implemented with GitHub Actions: on push to main the pipeline builds Docker images, pushes them to Docker Hub, then deploys to the VM via SSH (pull + docker compose up -d).

Deliverables included:

Backend and frontend code

backend/Dockerfile, frontend/Dockerfile

docker-compose.prod.yml

nginx/nginx.conf

GitHub Actions workflow: .github/workflows/ci-cd.yml

This README.md

/screenshots/ (place for all required screenshots)

Repository structure
.
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/...
├── nginx/
│   └── nginx.conf
├── docker-compose.prod.yml
├── .github/
│   └── workflows/ci-cd.yml
├── screenshots/
└── README.md
Prerequisites (local & server)

Local:

Git

Docker Desktop (or Docker + Buildx)

Node.js & npm (for local build & lockfile generation if needed)

Server (Ubuntu VM):

Docker & docker-compose plugin installed

Public IP / DNS (e.g. EC2)

SSH access for CI (public key in ~/.ssh/authorized_keys)

Security Group: allow inbound HTTP (80) and SSH (22) for CI / tests

How to run locally (optional)

From repo root:

# Build backend image
cd backend
docker build -t mohsincs/backend:local .


# Build frontend image
cd ../frontend
docker build -t mohsincs/frontend:local .


# Run locally (example)
cd ..
docker compose -f docker-compose.prod.yml up -d

Note: docker-compose.prod.yml expects mohsincs/backend:latest and mohsincs/frontend:latest by default — modify compose file for local :local tags if you want to test locally.

Dockerfiles / Angular notes

Backend Dockerfile exposes 8080 and runs node server.js (adjust if your entrypoint differs).

Frontend Dockerfile builds Angular output; the outputPath in angular.json for this project is dist/angular-15-crud. If your angular.json outputs to a different folder, update the Dockerfile accordingly.

If npm ci fails in CI, ensure package-lock.json exists and matches package.json. We committed lockfiles to guarantee deterministic builds.

GitHub Actions — CI/CD

Workflow path: .github/workflows/ci-cd.yml What it does on push to main:

Checkout code

Build backend and frontend Docker images (buildx)

Login to Docker Hub and push images (mohsincs/backend:latest, mohsincs/frontend:latest)

SSH into the server and run:

docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans
GitHub Secrets required (repo → Settings → Secrets → Actions)

DOCKERHUB_USERNAME = mohsincs

DOCKERHUB_TOKEN = Docker Hub access token (must have read & write/push scope)

SSH_PRIVATE_KEY = private key used by GitHub Actions (the public key should be in ~/.ssh/authorized_keys of ubuntu on the VM)

SERVER_IP = the VM public DNS or IP (e.g. ec2-3-106-198-160.ap-southeast-2.compute.amazonaws.com)

Important: ensure DOCKERHUB_TOKEN was created with push permissions — otherwise the action will fail with a 401 Unauthorized.

How to trigger CI/CD

Make a small change (eg. change a frontend HTML comment)

Commit & push to main:

git add .
git commit -m "CI/CD test: frontend change"
git push origin main

Open GitHub → Actions and watch the workflow run.

How to verify deployment

Check GitHub Actions → top workflow run → both jobs must be green.

Confirm Docker Hub has mohsincs/backend:latest and mohsincs/frontend:latest updated.

SSH to VM:

ssh -i path/to/webkey.pem ubuntu@<SERVER_IP>
cd ~/mean-deploy
docker compose -f docker-compose.prod.yml ps

Open the app in browser:

http://<SERVER_IP>/

Test API:

http://<SERVER_IP>/api/tutorials
Troubleshooting (deploy job exit code 255 — SSH/SCP failure)

deploy job exit code 255 commonly indicates SSH failure. Do these checks in order:

SSH locally using the same private key (on your workstation):

ssh -i "$env:USERPROFILE\.ssh\github_actions_deploy" ubuntu@<SERVER_IP>

If you cannot connect, Actions cannot either. Fix SSH first.

Check SSH_PRIVATE_KEY in GitHub secrets

The private key must be exact (including -----BEGIN OPENSSH PRIVATE KEY----- ... END lines) and no extra leading/trailing spaces.

Check public key on VM:

ssh -i path/to/webkey.pem ubuntu@<SERVER_IP>
ls -l ~/.ssh
tail -n 5 ~/.ssh/authorized_keys

Ensure the public key you uploaded from github_actions_deploy.pub is present and on a single line.

Permissions: ~/.ssh = 700, authorized_keys = 600.

Security group / firewall

Ensure port 22 is open to GitHub Actions IPs (for testing, temporarily allow 0.0.0.0/0), then tighten later.

Test scp from your local machine:

scp -i "$env:USERPROFILE\.ssh\github_actions_deploy" -o StrictHostKeyChecking=no docker-compose.prod.yml ubuntu@<SERVER_IP>:~/mean-deploy/docker-compose.prod.yml

If this fails, investigate SSH key / server firewall.

Check Actions logs: copy the failing deploy step log and search for Permission denied / Connection timed out.

Logs & debug commands (VM) : 
# show running containers
docker compose -f ~/mean-deploy/docker-compose.prod.yml ps


# tail nginx logs
docker compose -f ~/mean-deploy/docker-compose.prod.yml logs -f nginx --tail 200


# tail backend logs
docker compose -f ~/mean-deploy/docker-compose.prod.yml logs -f backend --tail 300
