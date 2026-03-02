import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8000";

let socket: Socket | null = null;
const activeRooms = new Set<string>();

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
    socket.on("connect", () => {
      activeRooms.forEach((wishlistId) => {
        socket!.emit("join_wishlist", { wishlist_id: wishlistId });
      });
    });
  }
  return socket;
}

export function joinWishlist(wishlistId: string) {
  const s = getSocket();
  activeRooms.add(wishlistId);
  if (!s.connected) {
    s.connect();
  } else {
    s.emit("join_wishlist", { wishlist_id: wishlistId });
  }
}

export function leaveWishlist(wishlistId: string) {
  activeRooms.delete(wishlistId);
  const s = getSocket();
  if (s.connected) {
    s.emit("leave_wishlist", { wishlist_id: wishlistId });
  }
}

export interface ItemUpdateEvent {
  type: "ITEM_UPDATED";
  itemId: string;
  total: number;
  contributors: number;
  status: string;
}
