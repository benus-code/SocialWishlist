import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
  }
  return socket;
}

export function joinWishlist(wishlistId: string) {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.once("connect", () => {
      s.emit("join_wishlist", { wishlist_id: wishlistId });
    });
  } else {
    s.emit("join_wishlist", { wishlist_id: wishlistId });
  }
}

export function leaveWishlist(wishlistId: string) {
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
