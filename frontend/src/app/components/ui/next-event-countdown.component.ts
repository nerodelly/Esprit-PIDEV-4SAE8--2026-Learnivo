import { Component, inject, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService, NextEventInfo } from '../../services/data.service';
import { LucideAngularModule, Clock } from 'lucide-angular';

@Component({
  selector: 'app-next-event-countdown',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
      @if (nextEvent()) {
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span class="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground shrink-0">
            <lucide-icon [name]="Clock" [size]="14"></lucide-icon>
            Prochain événement
          </span>
          <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span class="font-semibold text-foreground max-w-[180px] sm:max-w-xs truncate" [title]="nextEvent()!.title">{{ nextEvent()!.title }}</span>
            <span class="text-muted-foreground hidden sm:inline">—</span>
            <span [class]="countdownClass()" class="inline-flex items-center px-3 py-1 rounded-lg font-mono text-sm font-bold tabular-nums bg-white/80 border border-teal-200 shadow-sm">
              {{ countdownText() }}
            </span>
          </div>
        </div>
        <a [routerLink]="['/events', 'event-' + nextEvent()!.eventId]"
           class="inline-flex items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow shrink-0 w-fit">
          Voir l'événement
        </a>
      } @else if (loaded()) {
        <span class="text-sm text-muted-foreground italic">Aucun événement à venir</span>
      }
    </div>
  `,
})
export class NextEventCountdownComponent implements OnInit, OnDestroy {
  private readonly data = inject(DataService);

  @Input() includeScheduled = false;
  @Input() compact = false;

  readonly nextEvent = signal<NextEventInfo | null>(null);
  readonly countdownText = signal<string>('');
  readonly countdownClass = signal<string>('text-teal-600');
  readonly loaded = signal(false);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly Clock = Clock;

  ngOnInit(): void {
    this.data.getNextEvent(this.includeScheduled).subscribe({
      next: (event: NextEventInfo | null) => {
        this.nextEvent.set(event);
        this.loaded.set(true);
        if (event?.startTime) {
          this.tick(event.startTime);
          this.intervalId = setInterval(() => this.tick(event.startTime), 1000);
        }
      },
      error: () => this.loaded.set(true),
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private refetchNextEvent(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
    this.data.getNextEvent(this.includeScheduled).subscribe({
      next: (event: NextEventInfo | null) => {
        this.nextEvent.set(event);
        if (event?.startTime) {
          this.tick(event.startTime);
          this.intervalId = setInterval(() => this.tick(event.startTime), 1000);
        }
      },
    });
  }

  private tick(startTimeIso: string): void {
    const start = new Date(startTimeIso).getTime();
    if (Number.isNaN(start)) return;
    const now = Date.now();
    const diff = Math.max(0, start - now);

    if (diff === 0) {
      this.countdownText.set('En cours');
      this.countdownClass.set('text-amber-600');
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      // Recharger le prochain événement après 2 s pour afficher celui qui suit
      setTimeout(() => this.refetchNextEvent(), 2000);
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const parts: string[] = [];
    if (d > 0) parts.push(`${d}j`);
    parts.push(`${h}h`);
    parts.push(`${m}m`);
    parts.push(`${s}s`);
    this.countdownText.set(parts.join(' '));
    this.countdownClass.set(diff < 3600000 ? 'text-amber-600' : 'text-teal-600');
  }
}
