# NEO Tracker (Frontend + Backend)

This repository contains a small two-service application:

- **frontend**: A Vite + React app that displays Near-Earth Object (NEO) data.
- **backend**: A Fastify + TypeScript API that serves NEO data and supporting endpoints.

Quick start (Local development)

Run both services locally without Docker using two terminals.

1) Start the backend

```bash
cd backend
npm install
# copy or edit env (create .env from .env.example and add your NASA_API_KEY)
cp .env.example .env || true
# development server (hot reload)
npm run dev
```

The backend listens on http://localhost:3001 by default.

2) Start the frontend

```bash
cd frontend
npm install
# set the backend base URL for the dev server (create .env with this line)
# VITE_API_BASE_URL=http://localhost:3001
echo "VITE_API_BASE_URL=http://localhost:3001" > .env
npm run dev
```

The frontend dev server runs on Vite's default port (http://localhost:5173).

Notes

- For production builds:
	- Frontend: `cd frontend && npm run build` then `npm run preview` to serve the built assets locally.
	- Backend: `cd backend && npm run build` then `npm start` to run the compiled server.
- See the per-service READMEs for more details and available scripts:
	- [frontend/README.md](frontend/README.md)
	- [backend/README.md](backend/README.md)

Environment files

- Add per-service `.env` files in the service folders when needed:
	- `./backend/.env` — backend-specific environment values (e.g. `NASA_API_KEY`).
	- `./frontend/.env` — frontend-specific values (e.g. `VITE_API_BASE_URL`).

Access the services in your browser:
- Frontend (dev): http://localhost:5173
- Backend API: http://localhost:3001
- Backend Swagger UI: http://localhost:3001/documentation