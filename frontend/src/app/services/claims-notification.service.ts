import { Injectable, inject, signal, computed, OnDestroy, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';

export interface ClaimNotification {
  id?: number;
  type: 'CLAIM_CREATED' | 'STATUS_CHANGED' | 'CLAIM_ESCALATED' | 'SLA_WARNING' | 'CONNECTED';
  claimId?: number;
  title: string;
  message: string;
  priority?: string;
  newStatus?: string;
  is_read?: boolean;
  timestamp?: string;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class ClaimsNotificationService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly ngZone = inject(NgZone);

  private eventSource: EventSource | null = null;
  private reconnectTimer: any = null;
  private readonly RECONNECT_DELAY = 3000;

  private apiBase = 'http://localhost:8081/api/claims/notifications';

  // Signals for reactive state
  private readonly _notifications = signal<ClaimNotification[]>([]);
  private readonly _connected = signal(false);

  readonly notifications = this._notifications.asReadonly();
  readonly connected = this._connected.asReadonly();
  readonly unreadCount = computed(() =>
    this._notifications().filter(n => !n.is_read).length
  );

  // Callback for components to react to real-time events
  private onNewNotificationCallback: ((notif: ClaimNotification) => void) | null = null;

  /**
   * Register a callback that fires when a new real-time notification arrives.
   * Used by components to auto-refresh their data.
   */
  onNewNotification(callback: (notif: ClaimNotification) => void): void {
    this.onNewNotificationCallback = callback;
  }

  /**
   * Connect as agent (admin) — listen for new claim notifications
   */
  connectAsAgent(): void {
    this.disconnect();
    this.loadPersistedNotifications('agent');

    const url = `${this.apiBase}/agent/stream`;
    this.setupSSE(url);
  }

  /**
   * Connect as user (student) — listen for claim status change notifications
   */
  connectAsUser(email: string): void {
    this.disconnect();
    this.loadPersistedNotifications('user', email);

    const url = `${this.apiBase}/user/stream?email=${encodeURIComponent(email)}`;
    this.setupSSE(url);
  }

  /**
   * Disconnect from SSE stream
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this._connected.set(false);
  }

  /**
   * Load persisted notifications from the backend
   */
  private loadPersistedNotifications(role: 'agent' | 'user', email?: string): void {
    const url = role === 'agent'
      ? `${this.apiBase}/agent`
      : `${this.apiBase}/user?email=${encodeURIComponent(email!)}`;

    this.http.get<any[]>(url).subscribe({
      next: (notifs) => {
        const mapped: ClaimNotification[] = notifs.map(n => ({
          id: n.id,
          type: n.type,
          claimId: n.claim_id,
          title: n.title,
          message: n.message,
          is_read: !!n.is_read,
          created_at: n.created_at
        }));
        this._notifications.set(mapped);
      },
      error: () => { /* silently fail */ }
    });
  }

  /**
   * Set up SSE connection with auto-reconnect
   */
  private setupSSE(url: string): void {
    // Run outside Angular zone to avoid triggering change detection on every heartbeat
    this.ngZone.runOutsideAngular(() => {
      this.eventSource = new EventSource(url);

      this.eventSource.onmessage = (event) => {
        this.ngZone.run(() => {
          try {
            const data: ClaimNotification = JSON.parse(event.data);

            if (data.type === 'CONNECTED') {
              this._connected.set(true);
              return;
            }

            // Add to local list
            this._notifications.update(prev => [{
              ...data,
              is_read: false,
              created_at: data.timestamp || new Date().toISOString()
            }, ...prev]);

            // Fire toast notification via the global NotificationService
            if (data.type === 'CLAIM_CREATED') {
              this.notificationService.info(data.message, data.title);
            } else if (data.type === 'STATUS_CHANGED') {
              const type = data.newStatus === 'ACCEPTED' || data.newStatus === 'RESOLVED' || data.newStatus === 'CLOSED' ? 'success' : 'warning';
              if (type === 'success') {
                this.notificationService.success(data.message, data.title);
              } else {
                this.notificationService.warning(data.message, data.title);
              }
            } else if (data.type === 'CLAIM_ESCALATED') {
              this.notificationService.warning(data.message, data.title);
            } else if (data.type === 'SLA_WARNING') {
              this.notificationService.error(data.message, data.title);
            }

            // Play notification sound
            this.playNotificationSound();

            // Invoke component callback
            if (this.onNewNotificationCallback) {
              this.onNewNotificationCallback(data);
            }
          } catch (e) {
            console.error('SSE parse error:', e);
          }
        });
      };

      this.eventSource.onerror = () => {
        this.ngZone.run(() => {
          this._connected.set(false);
          this.eventSource?.close();
          this.eventSource = null;
          // Auto-reconnect
          this.reconnectTimer = setTimeout(() => {
            console.log('🔄 Reconnecting SSE...');
            this.setupSSE(url);
          }, this.RECONNECT_DELAY);
        });
      };
    });
  }

  /**
   * Play a subtle notification sound
   */
  private playNotificationSound(): void {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) { /* audio not supported */ }
  }

  /**
   * Mark a notification as read
   */
  markAsRead(id: number): void {
    this.http.put(`${this.apiBase}/${id}/read`, {}).subscribe({
      next: () => {
        this._notifications.update(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
      }
    });
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(role: 'AGENT' | 'USER', email?: string): void {
    this.http.put(`${this.apiBase}/read-all`, { role, email }).subscribe({
      next: () => {
        this._notifications.update(prev =>
          prev.map(n => ({ ...n, is_read: true }))
        );
      }
    });
  }
}
