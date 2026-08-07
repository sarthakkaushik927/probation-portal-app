import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth';

let socketInstance: Socket | null = null;
let pusherInstance: any | null = null;

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
        try {
          // Require at runtime to avoid bundler/interop issues in React Native.
          // Some bundlers return a namespace object instead of the constructor.
          // We'll try common export shapes and pick the first callable export.
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const PusherModule = require('pusher-js/react-native');
          console.log('Pusher module keys:', Object.keys(PusherModule || {}));

          let PusherLib: any = null;
          const candidates = [
            PusherModule,
            PusherModule && (PusherModule.default || PusherModule.Pusher),
            PusherModule && PusherModule.default && PusherModule.default.Pusher,
          ];

          for (const c of candidates) {
            if (typeof c === 'function') {
              PusherLib = c;
              break;
            }
          }

          if (!PusherLib && PusherModule && typeof PusherModule === 'object') {
            for (const k of Object.keys(PusherModule)) {
              const v = (PusherModule as any)[k];
              if (typeof v === 'function') {
                PusherLib = v;
                console.log('Selected Pusher constructor from key:', k);
                break;
              }
            }
          }

          if (typeof PusherLib === 'function') {
            pusherInstance = new PusherLib(PUSHER_KEY, {
              cluster: PUSHER_CLUSTER,
            });
          } else {
            const shape = PusherModule && typeof PusherModule === 'object'
              ? Object.keys(PusherModule).map(k => `${k}:${typeof (PusherModule as any)[k]}`).join(', ')
              : String(typeof PusherModule);
            console.warn('Pusher library is not a constructor. Module shape:', shape);
          }
        } catch (err) {
          console.warn('Failed to initialize Pusher:', err);
        }

        // If Pusher couldn't be initialized, fall back to Socket.IO so realtime still works.
        if (!pusherInstance && !socketInstance) {
          try {
            console.log('Falling back to Socket.IO due to Pusher init failure.');
            socketInstance = io(SOCKET_URL, { transports: ['websocket'] });
          } catch (err) {
            console.warn('Failed to initialize fallback Socket.IO:', err);
          }
        }
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
