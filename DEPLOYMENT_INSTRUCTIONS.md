# MedChain Deployment Instructions

## Overview
This repository contains three deployable services:

- `frontend` — React/Vite app for MedChain UI
- `backend` — Spring Boot REST API for authentication, medical vault, and Sentinel integration
- `ml` — FastAPI service running an Isolation Forest anomaly detector

### Deployment targets
- Vercel for the frontend
- Render for the backend and ML service
- Render PostgreSQL for the database

## GitHub
1. Push this repository to GitHub.
2. Use `main` or another primary branch.
3. Make sure `render.yaml`, `vercel.json`, and both `Dockerfile`s are committed.

## Environment variables
### Backend
- `DB_URL` — JDBC URL for PostgreSQL
- `DB_USERNAME` — database username
- `DB_PASSWORD` — database password
- `MAIL_USERNAME` — SMTP username or email address
- `MAIL_PASSWORD` — SMTP password or app password
- `JWT_SECRET` — secret key for signing JWT tokens
- `ML_API_URL` — public URL of the deployed ML service
- `PORT` — service port (Render provides this value internally)
- `SPRING_PROFILES_ACTIVE=prod`

### Frontend
- `VITE_API_BASE_URL` — public backend base URL, e.g. `https://<backend>.onrender.com`

### ML service
- `PORT` — service port (typically `8000` in deployment)

## Backend deployment on Render
1. Create a new Render web service.
2. Select **Docker** as the environment.
3. Set `DockerfilePath` to `backend/Dockerfile`.
4. Set the branch to `main`.
5. Add these environment variables:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `PORT=8081`
   - `DB_URL`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `MAIL_USERNAME`
   - `MAIL_PASSWORD`
   - `JWT_SECRET`
   - `ML_API_URL`
6. Link the service to the managed PostgreSQL database.

## ML service deployment on Render
1. Create a Render web service.
2. Select **Docker** as the environment.
3. Set `DockerfilePath` to `ml/Dockerfile`.
4. Set `PORT=8000`.
5. Once the ML service URL is available, set the backend `ML_API_URL` to that URL.

## Frontend deployment on Vercel
1. Create a new Vercel project from this GitHub repo.
2. Set the project root to `frontend` (or configure `frontend/package.json` as the source).
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add environment variable `VITE_API_BASE_URL` set to the backend URL.

## PostgreSQL on Render
1. Create a managed PostgreSQL database.
2. Use the provided values for `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.
3. Render's database connection string can be used directly as `DB_URL`.

## Verification
1. In `frontend`, run `npm install` and `npm run build`.
2. In `backend`, run `./backend/mvnw -B -DskipTests package`.
3. In `ml`, run `python -m py_compile main.py train.py`.
4. Verify `backend/Dockerfile` and `ml/Dockerfile` build successfully.

## Notes
- `frontend/.env.example` is provided for `VITE_API_BASE_URL`.
- `render.yaml` defines Render services and PostgreSQL.
- `backend` and `ml` services are Docker-based for Render.
