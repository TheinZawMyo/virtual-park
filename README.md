# Virtual Park

Lumen Park is a small 3D park built with React, Three.js, and React Three Fiber. Players can explore together, customize an avatar, chat by text, and use proximity voice chat.

## Features

- Walk around the park with WASD or the on-screen joystick.
- Choose an Explorer, Robot, or Dino avatar.
- See other players and their movement in real time.
- Send text messages to everyone in the park using the chat button in the upper-right corner.
- Turn on the microphone to talk with other mic-enabled players nearby. Voice connects within about 14 game units.
- Walk up to the Burmese information sign (`လမ်းညွှန်ဆိုင်းဘုတ်`) and press `E` or use its prompt to open the detailed park map.

## Requirements

- Node.js 20.19+ or 22.12+
- PostgreSQL

## Run locally

The frontend's current Vite proxy and API defaults expect the backend on port `5001`.

1. Configure and start PostgreSQL.
2. Set up the backend:

   ```bash
   cd server
   npm install
   cp .env.example .env
   ```

   In `server/.env`, set `PORT=5001` and update the PostgreSQL settings if needed. Create the database and tables, then add the Lumen Park seed row:

   ```bash
   createdb virtual_park
   npm run setup-db
   npm run seed
   npm run dev
   ```

3. In another terminal, start the frontend:

   ```bash
   cd virtual-park
   npm install
   npm run dev
   ```

4. Open the Vite URL shown in the terminal, usually <http://localhost:5173>.

The backend API is available at `http://localhost:5001/api`; the WebSocket endpoint is `ws://localhost:5001/ws`.

## Chat and microphone

- Text chat is shared with players in the same park. Open it with the message icon.
- Voice chat is proximity-based. Both players must turn on their microphone and allow browser access. The browser only requests microphone permission after the mic button is clicked.
- Microphone access requires HTTPS or `localhost`.
- Voice media is sent peer-to-peer; the WebSocket server relays WebRTC setup messages.
- The app uses a public STUN server by default. Networks that block direct peer connections may require a TURN service. Configure one in `virtual-park/.env`:

  ```dotenv
  VITE_TURN_URLS=turn:turn.example.com:3478
  VITE_TURN_USERNAME=your-turn-username
  VITE_TURN_CREDENTIAL=your-turn-credential
  ```

  `VITE_*` values are included in the browser build, so use short-lived TURN credentials where possible.

## Build

```bash
cd virtual-park
npm run build
npm run preview
```

For a backend port other than `5001`, update the `/api` and `/ws` proxy targets in `virtual-park/vite.config.js`. Set `VITE_API_BASE` if the API is hosted at a different URL.
