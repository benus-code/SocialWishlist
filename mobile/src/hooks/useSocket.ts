import {useEffect, useRef, useCallback} from 'react';
import {io, Socket} from 'socket.io-client';
import {BASE_URL} from '../api/client';

type ItemUpdate = {
  type: 'ITEM_UPDATED';
  itemId: string;
  total: number;
  contributors: number;
  status: 'AVAILABLE' | 'PARTIALLY_FUNDED' | 'FULLY_FUNDED';
};

export function useSocket(
  wishlistId: string | null,
  onItemUpdate?: (data: ItemUpdate) => void,
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!wishlistId) return;

    const socket = io(BASE_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_wishlist', {wishlist_id: wishlistId});
    });

    socket.on('item_updated', (data: ItemUpdate) => {
      onItemUpdate?.(data);
    });

    return () => {
      socket.emit('leave_wishlist', {wishlist_id: wishlistId});
      socket.disconnect();
      socketRef.current = null;
    };
  }, [wishlistId, onItemUpdate]);

  const emit = useCallback((event: string, data: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  return {emit};
}
