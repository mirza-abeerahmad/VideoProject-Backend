# Streamly

Streamly is a video-sharing application built with Express, MongoDB, Mongoose, JWT, Cloudinary, and React/Vite. The backend exposes authentication, video, comment, like, subscription, playlist, tweet, and creator dashboard APIs.

## Requirements

- Node.js 20+
- MongoDB
- Cloudinary account for avatar, thumbnail, and video uploads

## Backend setup

Create `.env` in the project root:

```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017
ACCESS_TOKEN_SECRET=replace-me
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=replace-me-too
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CORS_ORIGIN=http://localhost:5173
```

For multiple frontend origins, separate values with commas:

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,https://streamly-omega-three.vercel.app
```

Install and run the backend:

```bash
npm install
npm run dev
```

The API is available at `http://localhost:3000/api/v1` when `PORT=3000`. The health endpoint is `GET /api/v1/healthcheck` and reports API and MongoDB status.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend uses Axios with `VITE_API_URL` when provided. Otherwise it uses `http://localhost:3000/api/v1` in development and `https://streamlybackend-nu.vercel.app/api/v1` in production.

```env
VITE_API_URL=http://localhost:3000/api/v1
```

Use the app to register, sign in, browse videos, search, publish media, comment, like, follow creators, and manage creator workflows.

## API groups

- `/users`: registration, login, profile, tokens, account updates, and watch history
- `/videos`: feed, publishing, update/delete, and publish status
- `/comments`: video comments CRUD
- `/likes`: video, comment, tweet, and liked-video operations
- `/subscriptions`: subscribe and subscriber/channel lists
- `/playlists`: playlist CRUD and video membership
- `/tweets`: tweet CRUD
- `/dashboard`: channel statistics and owned videos

## Validation

Run the frontend production build with `npm run build` inside `frontend`. Run the backend with `npm run dev` after Node.js is available on the system PATH and MongoDB plus Cloudinary variables are configured.



# Video Sharing Project

## Overview

## Tech Stack

## Features

## Project Structure

## Prerequisites

## Installation

## Environment Variables

## Running the Project

## Database Setup

## API Testing

## Authentication

## Database Design

## Testing

## Deployment