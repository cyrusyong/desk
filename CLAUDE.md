# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Droplet is a temporary file-sharing web app. Users upload files, get a short URL, and recipients can download within a short TTL window. Files are auto-deleted from DynamoDB after the TTL expires.

## Development Commands

```bash
# Frontend development
cd droplet-frontend
npm install
npm run dev       # Start Vite dev server
npm run build     # Production build
npm run lint      # ESLint

npm run preview   # Preview production build locally
```

No test commands are configured — Lambda functions have no tests.

## Architecture

**Monorepo layout:**
- `droplet-frontend/` — React 19 + Vite SPA
- `getS3url/` — Lambda: generates presigned S3 PUT URL, returns `{ fieldId, uploadUrl }`
- `store-data/` — Lambda: stores metadata in DynamoDB, returns `{ simpleID }` (6-char nanoid)
- `get-data/` — Lambda: fetches metadata by simpleID, constructs S3 object URL
- `deleteS3Object/` — Lambda stub (not yet implemented)

**Request flow:**
1. Frontend calls `POST /DropletAPI/create-upload-url` → `getS3url` Lambda
2. Frontend PUTs file directly to S3 using the presigned URL
3. Frontend calls `POST /DropletAPI/store-data` with metadata + fieldID → `store-data` Lambda
4. Shareable URL: `/<simpleID>`
5. `FileDetails` page calls `GET /DropletAPI/get-data?id=<simpleID>` → `get-data` Lambda → returns S3 object URL for download

**AWS resources:**
- S3 bucket: `droplet.app` (us-east-2)
- DynamoDB table: `S3_Metadata` with TTL field (`expiration_time`)
- API Gateway prefix: `/DropletAPI`

**Frontend routing** uses Wouter (not React Router):
- `/` → `App.jsx` (upload page)
- `/:simpleID` → `FileDetails.jsx` (download page)

## Lambda Notes

- Lambda functions use CommonJS (`"type": "commonjs"`) — use `require()`/`module.exports`
- Frontend uses ES modules (`"type": "module"`) — use `import`/`export`
- CI/CD zips and deploys Lambdas on push to `main` via `.github/workflows/deploy.yml`
- TTL is currently set to 1 minute (shortened for testing — see `store-data/index.mjs`)
