// singnaling-server.mjs
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3000, host: '0.0.0.0' }, () => {
  console.log(`WebSocket signaling server running on ws://xx:3000`);
});

let peers = new Set();

wss.on('connection', ws => {
  peers.add(ws);
  ws.on('message', msg => {
    for (const peer of peers) {
      if (peer !== ws && peer.readyState === ws.OPEN) {
        peer.send(msg);
      }
    }
  });
  ws.on('close', () => peers.delete(ws));
});