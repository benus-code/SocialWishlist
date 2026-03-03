import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8000";

let socket: Socket | null = null;
const activeRooms = new Set<string>();

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    // Rejoin all active rooms on every (re)connection
    socket.on("connect", () => {
      console.log("[WS] Connected, rejoining rooms:", [...activeRooms]);
      activeRooms.forEach((id) => {
        socket!.emit("join_wishlist", { wishlist_id: id });
      });
    });
    socket.on("disconnect", (reason) => {
      console.log("[WS] Disconnected:", reason);
    });
    socket.on("connect_error", (err) => {
      console.log("[WS] Connection error:", err.message);
    });
  }
  return socket;
}

export function joinWishlist(wishlistId: string) {
  activeRooms.add(wishlistId);
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  } else {
    s.emit("join_wishlist", { wishlist_id: wishlistId });
  }
}

export function leaveWishlist(wishlistId: string) {
  activeRooms.delete(wishlistId);
  const s = getSocket();
  s.emit("leave_wishlist", { wishlist_id: wishlistId });
}

export interface ItemUpdateEvent {
  type: "ITEM_UPDATED";
  itemId: string;
  total: number;
  contributors: number;
  status: string;
}
