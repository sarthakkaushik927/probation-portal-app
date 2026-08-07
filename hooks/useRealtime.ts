import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Pusher from 'pusher-js';
import { useAuthStore } from '../store/auth';

let socketInstance: Socket | null = null;
let pusherInstance: Pusher | null = null;

const USE_PUSHER = process.env.EXPO_PUBLIC_USE_PUSHER === 'true';
const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
const PUSHER_KEY = process.env.EXPO_PUBLIC_PUSHER_KEY || '';
const PUSHER_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER || '';

export function useRealtime() {
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token || !user) return;

    if (USE_PUSHER && PUSHER_KEY) {
      if (!pusherInstance) {
        console.log('🔌 Connecting to Pusher...');
        pusherInstance = new Pusher(PUSHER_KEY, {
          cluster: PUSHER_CLUSTER,
        });
      }
    } else {
      if (!socketInstance) {
        console.log('🔌 Connecting to Socket.IO...');
        socketInstance = io(SOCKET_URL, {
          transports: ['websocket'],
        });
      }
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      if (pusherInstance) {
        pusherInstance.disconnect();
        pusherInstance = null;
      }
    };
  }, [token, user]);

  const subscribe = useCallback((channelName: string, eventName: string, callback: (data: any) => void) => {
    if (USE_PUSHER && pusherInstance) {
      const channel = pusherInstance.subscribe(channelName);
      channel.bind(eventName, callback);
      return () => {
        channel.unbind(eventName, callback);
        // Only unsubscribe if no other bindings exist (simplified)
        pusherInstance?.unsubscribe(channelName);
      };
    } else if (socketInstance) {
      socketInstance.emit('join', channelName);
      socketInstance.on(eventName, callback);
      return () => {
        socketInstance?.off(eventName, callback);
      };
    }
    return () => {};
  }, []);

  return { subscribe };
}
