'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '@/lib/socket';

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  error: string | null;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  connect: () => void;
  disconnect: () => void;
}

export const useSocket = (): UseSocketReturn => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket
    const socket = getSocket();
    socketRef.current = socket;

    // Connection handlers
    const handleConnect = () => {
      console.log('✅ Socket connected:', socket.id);
      setConnected(true);
      setError(null);
    };

    const handleDisconnect = (reason: string) => {
      console.log('❌ Socket disconnected:', reason);
      setConnected(false);
    };

    const handleConnectError = (err: Error) => {
      console.error('Socket connection error:', err.message);
      setError(err.message);
      setConnected(false);
    };

    // Register event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Auto-connect if not already connected
    if (!socket.connected) {
      socket.connect();
    } else {
      setConnected(true);
    }

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    const socket = socketRef.current;
    if (!socket) {
      console.warn('Socket not initialized. Cannot emit:', event);
      return;
    }
    if (socket.connected) {
      socket.emit(event, data);
    } else {
      // Queue the emit for when connected
      console.log('Socket not connected yet, queuing:', event);
      socket.once('connect', () => {
        socket.emit(event, data);
      });
      if (!socket.connected) {
        socket.connect();
      }
    }
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
    }
  }, []);

  return {
    socket: socketRef.current,
    connected,
    error,
    emit,
    on,
    off,
    connect,
    disconnect,
  };
};
