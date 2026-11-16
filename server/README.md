# Virtual Park Server

Express.js + PostgreSQL + WebSocket API backend for the Virtual Park frontend.

## Structure

```
server/
├── package.json
├── .env.example          # copy to .env and edit
├── .gitignore
├── README.md
├── src/
│   ├── index.js          # Express app + HTTP server + WebSocket server
│   ├── db.js             # pg connection pool + query helper
│   ├── models/park.js    # Park, Feature, User data models
│   ├── routes/api.js     # REST API routes (/api/*)
│   ├── ws/index.js       # WebSocket server (park rooms, broadcast)
│   └── scripts/
│       ├── setup-db.js   # create tables
│       └── seed.js       # seed sample data
```

## Prerequisites

- Node.js (v18+)
- PostgreSQL running (verified: `pg_isready` accepting connections)

## Quick Start

```bash
# 1. Install dependencies
cd /Users/theinzawmyo/AI/VirturalPark/server
npm install

# 2. Configure environment
cp .env.example .env
# edit .env if your Postgres credentials differ

# 3. Create database (optional: done manually or via psql)
createdb virtual_park   # or: psql -c "CREATE DATABASE virtual_park;"

# 4. Set up schema
npm run setup-db

# 5. Seed sample data (optional)
npm run seed

# 6. Start dev server
npm run dev
```

Server: `http://localhost:5000`
WebSocket: `ws://localhost:5000/ws`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/parks` | List parks |
| GET | `/api/parks/:id` | Get a park |
| POST | `/api/parks` | Create a park |
| PUT | `/api/parks/:id` | Update a park |
| DELETE | `/api/parks/:id` | Delete a park |
| GET | `/api/parks/:parkId/features` | List features in a park |
| POST | `/api/parks/:parkId/features` | Add a feature |
| PUT | `/api/features/:id` | Update a feature |
| DELETE | `/api/features/:id` | Delete a feature |
| GET | `/api/users` | List users |
| POST | `/api/users` | Create a user |

## WebSocket (`/ws`)

Message types (client → server):

- `{ type: 'join_park', parkId, userId }` — join a park room
- `{ type: 'leave_park' }` — leave current park room
- `{ type: 'feature_update', feature: {...} }` — broadcast feature change to park room
- `{ type: 'ping' }` — heartbeat

Server → client messages:

- `{ type: 'welcome', clientId }`
- `{ type: 'joined_park', parkId }`
- `{ type: 'user_joined', userId, clientId }` (broadcast to room)
- `{ type: 'user_left', userId, clientId }` (broadcast to room)
- `{ type: 'feature_updated', feature, updatedBy }` (broadcast to room)
- `{ type: 'pong', ts }`
- `{ type: 'error', error }`

## Frontend Integration (Vite + React)

The frontend lives in `../virtual-park`. It can call `http://localhost:5000/api/...`
and connect to `ws://localhost:5000/ws`. Enable CORS (already configured) and make
sure both dev servers run simultaneously:

- Frontend: `cd virtual-park && npm run dev` (default `http://localhost:5173`)
- Backend: `cd server && npm run dev` (default `http://localhost:5000`)