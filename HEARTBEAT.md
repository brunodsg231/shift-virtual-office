# SHIFT HQ Heartbeat API

## POST /api/heartbeat

Report agent status. Called automatically when agents start/complete tasks.

```json
{
  "agentId": "kim",
  "status": "working",
  "currentTask": "Check Saturday bookings"
}
```

Returns `{ ok: true }`. Broadcasts `agent_heartbeat` via Socket.io.

## GET /api/world/state

Returns full office snapshot:

```json
{
  "agents": {
    "kim": {
      "name": "Kim",
      "role": "Bookings & Client Relations",
      "status": "working",
      "currentTask": "Check Saturday bookings",
      "lastHeartbeat": 1710000000000,
      "online": true
    }
  },
  "recentActivity": [],
  "activeTasks": [],
  "timestamp": 1710000000000
}
```

Agents are considered `online` if their last heartbeat was within 5 minutes.

## Socket Events

- `agent_heartbeat` — emitted on each POST, contains `{ agentId, status, currentTask, timestamp }`
