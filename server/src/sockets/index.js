/**
 * Socket.io wiring. Each incident gets its own "room" (by incident id);
 * clients join it and receive participant/item/timeline/critical_action/
 * closed events in real time (FR-24: live shareable view).
 */
export function attachSockets(io) {
  io.on("connection", (socket) => {
    socket.on("join_incident", (incidentId) => {
      socket.join(incidentId);
    });
    socket.on("leave_incident", (incidentId) => {
      socket.leave(incidentId);
    });
  });
}
