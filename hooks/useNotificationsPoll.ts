import { useEffect, useRef } from 'react';
import { getNotifications } from '../services/api';

type NotificationItem = any;

export function useNotificationsPoll(onNew: (n: NotificationItem) => void, intervalMs = 5000) {
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const res = await getNotifications();
        const list: NotificationItem[] = res.data.data || [];
        for (const n of list) {
          if (!n || !n.id) continue;
          if (!seenRef.current.has(n.id)) {
            seenRef.current.add(n.id);
            if (mounted) onNew(n);
          }
        }
      } catch (err) {
        // ignore polling errors
      }
    };

    // initial poll
    poll();
    const id = setInterval(poll, intervalMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [onNew, intervalMs]);
}
