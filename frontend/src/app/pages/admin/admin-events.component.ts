import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DataService, PlatformEvent, AdminEventFormData } from '../../services/data.service';
import {
    Calendar,
    Plus,
    MapPin,
    Clock,
    ChevronRight,
    MoreVertical,
    CheckCircle2,
    AlertCircle
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-admin-events',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <h1 class="text-3xl font-extrabold tracking-tight">Event <span class="text-teal-600 underline decoration-2 underline-offset-4">Manager</span></h1>
          <p class="text-muted-foreground">Schedule and manage platform-wide events and summits.</p>
        </div>
        <button (click)="onCreateEvent()" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-teal-600/20 active:scale-95 group">
          <lucide-icon [name]="Plus" [size]="18" class="group-hover:rotate-90 transition-transform"></lucide-icon>
          Create New Event
        </button>
      </div>

      <!-- Search -->
      <div class="flex justify-end">
        <input
          [(ngModel)]="searchTerm"
          (ngModelChange)="currentPage = 1"
          type="text"
          placeholder="Search events..."
          class="w-full md:w-72 px-3 py-2 rounded-xl border border-border text-sm"
        />
      </div>

      <!-- Event Form (Create / Edit) -->
      <div *ngIf="formVisible" class="bg-white border border-border rounded-3xl shadow-sm p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-extrabold">
            {{ formMode === 'create' ? 'Create new event' : 'Edit event' }}
          </h2>
          <button type="button" class="text-sm text-muted-foreground hover:text-foreground" (click)="closeForm()">
            Close
          </button>
        </div>
        <form (ngSubmit)="submitForm(eventForm)" #eventForm="ngForm" class="grid gap-4 md:grid-cols-2">
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-muted-foreground mb-1">Title</label>
            <input
              [(ngModel)]="formData.title"
              name="title"
              required
              minlength="3"
              #titleCtrl="ngModel"
              class="w-full px-3 py-2 rounded-xl border border-border text-sm"
            />
            <p *ngIf="submitted && titleCtrl.invalid" class="mt-1 text-[11px] text-rose-600">
              Title is required (min. 3 characters).
            </p>
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-muted-foreground mb-1">Description</label>
            <textarea
              [(ngModel)]="formData.description"
              name="description"
              rows="3"
              required
              minlength="10"
              #descCtrl="ngModel"
              class="w-full px-3 py-2 rounded-xl border border-border text-sm"
            ></textarea>
            <p *ngIf="submitted && descCtrl.invalid" class="mt-1 text-[11px] text-rose-600">
              Description is required (minimum 10 characters).
            </p>
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-muted-foreground mb-1">Location</label>
            <input
              [(ngModel)]="formData.location"
              name="location"
              required
              #locationCtrl="ngModel"
              class="w-full px-3 py-2 rounded-xl border border-border text-sm"
              placeholder="Address or place name"
            />
            <p *ngIf="submitted && locationCtrl.invalid" class="mt-1 text-[11px] text-rose-600">
              Location is required.
            </p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-foreground mb-1">Status</label>
            <select
              [(ngModel)]="formData.status"
              name="status"
              required
              #statusCtrl="ngModel"
              class="w-full px-3 py-2 rounded-xl border border-border text-sm"
            >
              <option value="PLANNED">PLANNED</option>
              <option value="ONGOING">ONGOING</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
            <p *ngIf="submitted && statusCtrl.invalid" class="mt-1 text-[11px] text-rose-600">
              Status is required.
            </p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-foreground mb-1">Start time</label>
            <input
              [(ngModel)]="formData.start"
              name="start"
              type="datetime-local"
              required
              #startCtrl="ngModel"
              class="w-full px-3 py-2 rounded-xl border border-border text-sm"
            />
            <p *ngIf="submitted && startCtrl.invalid" class="mt-1 text-[11px] text-rose-600">
              Start date is required.
            </p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-foreground mb-1">End time</label>
            <input
              [(ngModel)]="formData.end"
              name="end"
              type="datetime-local"
              required
              #endCtrl="ngModel"
              class="w-full px-3 py-2 rounded-xl border border-border text-sm"
            />
            <p *ngIf="submitted && endCtrl.invalid" class="mt-1 text-[11px] text-rose-600">
              End date is required.
            </p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-foreground mb-1">Max Participants</label>
            <input
              [(ngModel)]="formData.maxParticipants"
              name="maxParticipants"
              type="number"
              min="1"
              class="w-full px-3 py-2 rounded-xl border border-border text-sm"
              placeholder="Unlimited"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-foreground mb-1">Club (optional)</label>
            <select
              [(ngModel)]="formData.clubName"
              name="clubName"
              class="w-full px-3 py-2 rounded-xl border border-border text-sm"
            >
              <option [ngValue]="null">— Public event (no club) —</option>
              <option *ngFor="let club of data.clubs()" [ngValue]="club.name">{{ club.name }}</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-muted-foreground mb-1">Publish at (optional)</label>
            <input
              [(ngModel)]="formData.publishAt"
              name="publishAt"
              type="datetime-local"
              class="w-full px-3 py-2 rounded-xl border border-border text-sm"
              placeholder="Leave empty = visible immediately"
            />
            <p class="mt-1 text-[11px] text-muted-foreground">
              If set, the event remains pending until this date/time before being displayed.
            </p>
          </div>
          <div class="md:col-span-2">
            <p *ngIf="submitted && !isDateRangeValid()" class="text-[11px] text-rose-600">
              End date must be after start date.
            </p>
          </div>
          <div class="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" class="px-4 py-2 rounded-xl border border-border text-sm font-medium" (click)="closeForm()">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-bold">
              {{ formMode === 'create' ? 'Save event' : 'Update event' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Events List -->
      <div class="space-y-4">
        <div *ngFor="let event of pagedEvents()" class="bg-white p-4 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all group">
            <div class="flex flex-col lg:flex-row lg:items-center gap-6">
                <div class="relative w-full lg:w-48 h-32 rounded-2xl overflow-hidden shrink-0">
                    <img [src]="event.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                    <div class="absolute inset-0 bg-black/20"></div>
                </div>
                
                <div class="flex-1 space-y-2">
                    <div class="flex items-center gap-2">
                        <span [class]="event.type === 'next' ? 'bg-teal-600' : 'bg-muted-foreground'" 
                              class="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded text-white italic">
                            {{ event.type }} event
                        </span>
                        <div *ngIf="event.type === 'next'" class="flex items-center gap-1 text-[10px] font-bold text-teal-600">
                            <lucide-icon [name]="CheckCircle2" [size]="12"></lucide-icon>
                            Published
                        </div>
                    </div>
                    <h3 class="text-xl font-extrabold tracking-tight group-hover:text-teal-600 transition-colors">{{ event.title }}</h3>
                    <div class="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium">
                        <div class="flex items-center gap-1.5">
                            <lucide-icon [name]="Calendar" [size]="14"></lucide-icon>
                            {{ event.date }}
                        </div>
                        <div class="flex items-center gap-1.5">
                            <lucide-icon [name]="MapPin" [size]="14"></lucide-icon>
                            {{ event.location }}
                        </div>
                        <div class="flex items-center gap-1.5">
                            <lucide-icon [name]="Clock" [size]="14"></lucide-icon>
                            {{ event.time || '—' }}
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    <button (click)="onEditEvent(event)" class="px-4 py-2 hover:bg-muted rounded-xl transition-all font-bold text-sm">Edit</button>
                    <button class="px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl transition-all font-bold text-sm flex items-center gap-2 group/btn">
                        Manage
                        <lucide-icon [name]="ChevronRight" [size]="14" class="group-hover/btn:translate-x-1 transition-transform"></lucide-icon>
                    </button>
                    <button (click)="onDeleteEvent(event)" class="p-2 hover:bg-rose-50 rounded-xl transition-all text-rose-600" title="Delete">
                        <lucide-icon [name]="MoreVertical" [size]="18"></lucide-icon>
                    </button>
                </div>
            </div>
        </div>
        <div class="px-2 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Page {{ currentPage }} / {{ totalPages }}</span>
          <div class="flex items-center gap-2">
            <button
              class="px-3 py-1 rounded-lg border border-border disabled:opacity-50"
              (click)="goToPage(currentPage - 1)"
              [disabled]="currentPage === 1"
            >
              Prev
            </button>
            <button
              class="px-3 py-1 rounded-lg border border-border disabled:opacity-50"
              (click)="goToPage(currentPage + 1)"
              [disabled]="currentPage === totalPages"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminEventsComponent implements OnInit {
    data = inject(DataService);

    ngOnInit() {
        this.data.loadEventsFromBackend(true);
    }
    readonly Calendar = Calendar;
    readonly Plus = Plus;
    readonly MapPin = MapPin;
    readonly Clock = Clock;
    readonly ChevronRight = ChevronRight;
    readonly MoreVertical = MoreVertical;
    readonly CheckCircle2 = CheckCircle2;
    readonly AlertCircle = AlertCircle;

    formVisible = false;
    formMode: 'create' | 'edit' = 'create';
    editingId: number | string | null = null;
    formData: AdminEventFormData = {
        title: '',
        description: '',
        location: '',
        status: 'PLANNED',
        start: '',
        end: '',
        maxParticipants: 0,
        clubName: null,
        publishAt: null
    };

    searchTerm = '';
    currentPage = 1;
    pageSize = 5;
    submitted = false;

    onCreateEvent() {
        this.formMode = 'create';
        this.editingId = null;
        this.formData = {
            title: '',
            description: '',
            location: '',
            status: 'PLANNED',
            start: '',
            end: '',
            maxParticipants: 0,
            clubName: null,
            publishAt: null
        };
        this.formVisible = true;
    }

    onEditEvent(event: PlatformEvent) {
        this.formMode = 'edit';
        this.editingId = event.id ?? null;
        this.formData = {
            title: event.title,
            description: event.description,
            location: event.location,
            status: event.type === 'next' ? 'PLANNED' : 'COMPLETED',
            start: '',
            end: '',
            maxParticipants: 0,
            clubName: null,
            publishAt: null
        };
        this.formVisible = true;
    }

    onDeleteEvent(event: PlatformEvent) {
        if (!event.id) return;
        const confirmDelete = confirm(`Delete event "${event.title}"?`);
        if (!confirmDelete) return;
        this.data.deleteEvent(event.id);
    }

    submitForm(form?: NgForm) {
        this.submitted = true;
        if (form && form.invalid) return;
        if (!this.isDateRangeValid()) return;
        if (this.formMode === 'create') {
            this.data.createEvent(this.formData);
        } else if (this.editingId != null) {
            this.data.updateEvent(this.editingId, this.formData);
        }
        this.formVisible = false;
        this.submitted = false;
    }

    closeForm() {
        this.formVisible = false;
    }

    isDateRangeValid(): boolean {
        if (!this.formData.start || !this.formData.end) return true;
        const start = new Date(this.formData.start).getTime();
        const end = new Date(this.formData.end).getTime();
        return !Number.isNaN(start) && !Number.isNaN(end) && end > start;
    }

    private filteredEvents(): PlatformEvent[] {
        const term = this.searchTerm.trim().toLowerCase();
        const list = this.data.events();
        if (!term) return list;
        return list.filter(ev =>
            (ev.title ?? '').toLowerCase().includes(term) ||
            (ev.location ?? '').toLowerCase().includes(term) ||
            (ev.description ?? '').toLowerCase().includes(term)
        );
    }

    get totalPages(): number {
        const total = this.filteredEvents().length;
        return Math.max(1, Math.ceil(total / this.pageSize));
    }

    pagedEvents(): PlatformEvent[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredEvents().slice(start, start + this.pageSize);
    }

    goToPage(page: number) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
    }
}
