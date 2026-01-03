import io from "socket.io-client";

// Create a single connection instance
export const socket = io("http://localhost:5000");