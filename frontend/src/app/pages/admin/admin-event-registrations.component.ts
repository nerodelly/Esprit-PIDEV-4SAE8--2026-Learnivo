import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DataService, EventRegistration, AdminEventRegistrationFormData } from '../../services/data.service';

@Component({
  selector: 'app-admin-event-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <h1 class="text-3xl font-extrabold tracking-tight">Manage <span class="text-teal-600 underline decoration-2 underline-offset-4">Event Registrations</span></h1>
          <p class="text-muted-foreground">See which students have registered to which events.</p>
        </div>
        <button (click)="onCreate()" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-teal-600/20 active:scale-95">
          + Add Registration
        </button>
      </div>

      <!-- Search -->
      <div class="flex justify-end">
        <input
          [(ngModel)]="searchTerm"
          (ngModelChange)="currentPage = 1"
          type="text"
          placeholder="Search registrations..."
          class="w-full md:w-72 px-3 py-2 rounded-xl border border-border text-sm"
        />
      </div>

      <div *ngIf="formVisible" class="bg-white border border-border rounded-3xl shadow-sm p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-extrabold">
            {{ formMode === 'create' ? 'Create registration' : 'Edit registration' }}
          </h2>
          <button type="button" class="text-sm text-muted-foreground hover:text-foreground" (click)="closeForm()">
            Close
          </button>
        </div>
        <form (ngSubmit)="submitForm(rForm)" #rForm="ngForm" class="grid gap-4 md:grid-cols-3">
          <div>
            <label class="block text-xs font-semibold text-muted-foreground mb-1">Event</label>
            <select
              [(ngModel)]="formData.eventId"
              name="eventId"
              required
              #eventCtrl="ngModel"
              class="w-full px-3 py-2 rounded-xl border border-border text-sm"
            >
              <option [ngValue]="null">— Sélectionner un événement —</option>
              <option *ngFor="let ev of data.events()" [ngValue]="ev.id">
                {{ ev.title }}
              </option>
            </select>
            <p *ngIf="submitted && eventCtrl.invalid" class="mt-1 text-[11px] text-rose-600">
              L événement est obligatoire.
            </p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-foreground mb-1">Student</label>
            <select
              [(ngModel)]="formData.studentId"
              name="studentId"
              required
              #studentCtrl="ngModel"
              class="w-full px-3 py-2 rounded-xl border border-border text-sm"
            >
              <option [ngValue]="null">— Sélectionner un étudiant —</option>
              <option *ngFor="let s of data.students()" [ngValue]="s.id">
                {{ s.name }} ({{ s.email }})
              </option>
            </select>
            <p *ngIf="submitted && studentCtrl.invalid" class="mt-1 text-[11px] text-rose-600">
              L étudiant est obligatoire.
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
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="WAITING">WAITING</option>
            </select>
            <p *ngIf="submitted && statusCtrl.invalid" class="mt-1 text-[11px] text-rose-600">
              Le statut est obligatoire.
            </p>
          </div>
          <div class="md:col-span-3 flex justify-end gap-2 pt-2">
            <button type="button" class="px-4 py-2 rounded-xl border border-border text-sm font-medium" (click)="closeForm()">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-bold">
              {{ formMode === 'create' ? 'Save registration' : 'Update registration' }}
            </button>
          </div>
        </form>
      </div>

      <div class="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th class="px-6 py-4">ID</th>
                <th class="px-6 py-4">Event</th>
                <th class="px-6 py-4">Student</th>
                <th class="px-6 py-4">Registered at</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngFor="let r of pagedRegistrations()" class="hover:bg-muted/20 transition-colors">
                <td class="px-6 py-4 text-sm text-muted-foreground">{{ r.id }}</td>
                <td class="px-6 py-4 text-sm">
                  <div class="flex flex-col">
                    <span class="font-medium">{{ r.eventTitle || r.eventId }}</span>
                    <span class="text-xs text-muted-foreground">{{ r.eventStartTime | date:'short' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div class="flex flex-col">
                    <span class="font-medium">{{ r.studentName || r.studentId }}</span>
                    <span class="text-xs text-muted-foreground">ID: {{ r.studentId }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-muted-foreground">{{ r.registeredAt | date:'short' }}</td>
                <td class="px-6 py-4 text-sm">{{ r.status }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button class="px-3 py-1 rounded-lg border border-border text-xs font-medium hover:bg-muted"
                            (click)="onEdit(r)">Edit</button>
                    <button class="px-3 py-1 rounded-lg border border-rose-200 text-xs font-medium text-rose-600 hover:bg-rose-50"
                            (click)="onDelete(r)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
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
export class AdminEventRegistrationsComponent {
  data = inject(DataService);

  formVisible = false;
  formMode: 'create' | 'edit' = 'create';
  editingId: number | string | null = null;
  formData: AdminEventRegistrationFormData = {
    status: 'CONFIRMED',
    eventId: null,
    studentId: null
  };

  submitted = false;

  searchTerm = '';
  currentPage = 1;
  pageSize = 5;

  onCreate() {
    this.formMode = 'create';
    this.editingId = null;
    this.formData = { status: 'CONFIRMED', eventId: null, studentId: null };
    this.formVisible = true;
  }

  onEdit(r: EventRegistration) {
    this.formMode = 'edit';
    this.editingId = r.id ?? null;
    this.formData = {
      status: r.status,
      eventId: (r.eventId as number) ?? null,
      studentId: (r.studentId as number) ?? null
    };
    this.formVisible = true;
  }

  onDelete(r: EventRegistration) {
    if (!r.id) return;
    const ok = confirm(`Supprimer l inscription #${r.id} ?`);
    if (!ok) return;
    this.data.deleteEventRegistration(r.id);
  }

  submitForm(form: NgForm) {
    this.submitted = true;
    if (form.invalid) {
      return;
    }
    if (this.formMode === 'create') {
      this.data.createEventRegistration(this.formData);
    } else if (this.editingId != null) {
      this.data.updateEventRegistration(this.editingId, this.formData);
    }
    this.formVisible = false;
    this.submitted = false;
  }

  closeForm() {
    this.formVisible = false;
    this.submitted = false;
  }

  private filteredRegistrations(): EventRegistration[] {
    const term = this.searchTerm.trim().toLowerCase();
    const list = this.data.eventRegistrations();
    if (!term) return list;
    return list.filter((r: EventRegistration) =>
      (r.eventTitle ?? '').toLowerCase().includes(term) ||
      (r.studentName ?? '').toLowerCase().includes(term) ||
      String(r.id ?? '').includes(term)
    );
  }

  get totalPages(): number {
    const total = this.filteredRegistrations().length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  pagedRegistrations(): EventRegistration[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRegistrations().slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }
}

