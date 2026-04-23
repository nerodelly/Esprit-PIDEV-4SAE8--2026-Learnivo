import { Injectable, signal, computed } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  date: Date;
  read: boolean;
  /** If true, this notification is no longer shown in the toast stack (but remains in center). */
  toastHidden?: boolean;
}

const MAX_ITEMS = 100;
const TOAST_VISIBLE_MS = 5000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _list = signal<NotificationItem[]>([]);
  private idCounter = 0;

  readonly list = this._list.asReadonly();
  readonly unreadCount = computed(() =>
    this._list().filter(n => !n.read).length
  );
  readonly recentList = computed(() =>
    [...this._list()].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 50)
  );

  /** Notifications to show as toasts (newest, not yet hidden from toast). */
  readonly toasts = computed(() =>
    this._list().filter(n => !n.toastHidden).slice(0, 5)
  );

  private add(type: NotificationType, message: string, options?: { title?: string }): string {
    const id = `notif-${++this.idCounter}-${Date.now()}`;
    const item: NotificationItem = {
      id,
      type,
      title: options?.title,
      message,
      date: new Date(),
      read: false,
      toastHidden: false,
    };
    this._list.update(prev => {
      const next = [item, ...prev].slice(0, MAX_ITEMS);
      return next;
    });
    // Hide from toast stack after delay; keep in notification center
    setTimeout(() => {
      this._list.update(prev =>
        prev.map(n => (n.id === id ? { ...n, toastHidden: true } : n))
      );
    }, TOAST_VISIBLE_MS);
    return id;
  }

  success(message: string, title?: string): string {
    return this.add('success', message, { title });
  }

  error(message: string, title?: string): string {
    return this.add('error', message, { title });
  }

  info(message: string, title?: string): string {
    return this.add('info', message, { title });
  }

  warning(message: string, title?: string): string {
    return this.add('warning', message, { title });
  }

  remove(id: string): void {
    this._list.update(prev => prev.filter(n => n.id !== id));
  }

  markAsRead(id: string): void {
    this._list.update(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }

  markAllAsRead(): void {
    this._list.update(prev => prev.map(n => ({ ...n, read: true })));
  }

  clearAll(): void {
    this._list.set([]);
  }
}
