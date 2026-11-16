# Virtual Park Server

Express, PostgreSQL, and WebSocket backend for the Virtual Park frontend.

## Local setup

Requirements: Node.js 18+ and PostgreSQL.

```bash
cd server
npm install
cp .env.example .env
```

Configure PostgreSQL in `.env`. To use the frontend's current Vite proxy and API defaults, set `PORT=5001`. Create the database and tables, seed the Lumen Park row, and start the server:

```bash
createdb virtual_park
npm run setup-db
npm run seed
npm run dev
```

The server defaults to port `5000` when `PORT` is unset. The frontend currently expects port `5001`; if you use another port, update the proxy targets in `virtual-park/vite.config.js` and set `VITE_API_BASE` for the API URL.

## HTTP API

All routes are prefixed with `/api`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Health check |
| GET, POST | `/parks` | List or create parks |
| GET, PUT, DELETE | `/parks/:id` | Read, update, or delete a park |
| GET, POST | `/parks/:parkId/features` | List or create park features |
| PUT, DELETE | `/features/:id` | Update or delete a feature |
| GET, POST | `/users` | List or create users |
| GET, POST | `/players` | List or create player profiles |
| GET, PUT | `/players/:id` | Read or update a player profile |
| GET | `/parks/:parkId/players` | List active players in a park |

## WebSocket protocol

Connect to `/ws`. Messages use JSON. The client can send:

- `join_park` — join a park with a session player key, display name, avatar, and starting position.
- `leave_park` — leave the current park.
- `player_move` — broadcast and save the player's position and rotation.
- `get_players` — request the current park player list.
- `chat_message` — send a text message to players within 14 park units (maximum 500 characters).
- `voice_status` — announce whether the player has enabled their microphone.
- `voice_signal` — relay a WebRTC offer, answer, or ICE candidate to a nearby player in the same park room.
- `ping` — request a heartbeat response.

The server sends `welcome`, `joined_park`, `player_list`, `player_joined`, `player_left`, `player_moved`, `chat_message`, `voice_status`, `voice_signal`, `left_park`, `pong`, and `error` messages as appropriate.

Voice audio is peer-to-peer; this server only relays WebRTC signaling. The frontend uses STUN by default and can be configured with `VITE_TURN_URLS`, `VITE_TURN_USERNAME`, and `VITE_TURN_CREDENTIAL` when a TURN relay is needed.
