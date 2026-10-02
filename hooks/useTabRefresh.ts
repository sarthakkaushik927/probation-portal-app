import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';

/**
 * Shared event emitter for tab double-tap refresh.
 * On web/desktop, double-tapping a nav tab triggers a 'refresh' event 
 * that screens can listen to via useTabRefresh().
 */
type RefreshListener = () => void;

// Simple event bus for refresh events keyed by route name
const listeners = new Map<string, Set<RefreshListener>>();

export function emitTabRefresh(routeName: string) {
  const set = listeners.get(routeName);
  if (set) {
    set.forEach(fn => fn());
  }
}

/**
 * Hook for screens to listen to tab double-tap refresh events.
 * @param routeName - The route name this screen is associated with
 * @param onRefresh - Callback to invoke when a refresh is triggered
 */
export function useTabRefresh(routeName: string, onRefresh: RefreshListener) {
  const savedCallback = useRef(onRefresh);
  savedCallback.current = onRefresh;

  // Register on mount, cleanup on unmount
  const register = useCallback(() => {
    const handler: RefreshListener = () => savedCallback.current();
    
    if (!listeners.has(routeName)) {
      listeners.set(routeName, new Set());
    }
    listeners.get(routeName)!.add(handler);

    return () => {
      listeners.get(routeName)?.delete(handler);
    };
  }, [routeName]);

  // Use effect-like behavior via ref
  const cleanupRef = useRef<(() => void) | null>(null);
  
  if (!cleanupRef.current) {
    cleanupRef.current = register();
  }

  // Return cleanup function for manual use if needed
  return cleanupRef.current;
}

/**
 * Returns whether RefreshControl should be used.
 * On web, we disable pull-to-refresh and use double-tap instead.
 */
export function shouldUseRefreshControl(): boolean {
  return Platform.OS !== 'web';
}
