import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationType } from '../../services/notification.service';
import { LucideAngularModule, CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-angular';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed top-20 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <div class="pointer-events-auto flex flex-col gap-3">
        @for (n of notificationService.toasts(); track n.id) {
          <div
            [class]="toastClasses(n.type)"
            class="rounded-xl border shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right-5 duration-300"
          >
            <span class="flex-shrink-0 mt-0.5">
              @switch (n.type) {
                @case ('success') {
                  <lucide-icon [name]="CheckCircle" [size]="22" class="text-emerald-600"></lucide-icon>
                }
                @case ('error') {
                  <lucide-icon [name]="XCircle" [size]="22" class="text-rose-600"></lucide-icon>
                }
                @case ('warning') {
                  <lucide-icon [name]="AlertTriangle" [size]="22" class="text-amber-600"></lucide-icon>
                }
                @default {
                  <lucide-icon [name]="Info" [size]="22" class="text-sky-600"></lucide-icon>
                }
              }
            </span>
            <div class="flex-1 min-w-0">
              @if (n.title) {
                <p class="font-semibold text-sm text-foreground">{{ n.title }}</p>
              }
              <p class="text-sm text-muted-foreground">{{ n.message }}</p>
            </div>
            <button
              type="button"
              (click)="notificationService.remove(n.id)"
              class="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors"
              aria-label="Fermer"
            >
              <lucide-icon [name]="X" [size]="16"></lucide-icon>
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class NotificationToastComponent {
  readonly notificationService = inject(NotificationService);
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly Info = Info;
  readonly AlertTriangle = AlertTriangle;
  readonly X = X;

  toastClasses(type: NotificationType): string {
    const base = 'bg-white';
    switch (type) {
      case 'success':
        return `${base} border-emerald-200`;
      case 'error':
        return `${base} border-rose-200`;
      case 'warning':
        return `${base} border-amber-200`;
      default:
        return `${base} border-sky-200`;
    }
  }
}
