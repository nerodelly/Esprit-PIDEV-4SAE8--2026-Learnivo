import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DataService, ClubMembership, AdminClubMembershipFormData, Student } from '../../services/data.service';

@Component({
  selector: 'app-admin-club-memberships',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <h1 class="text-3xl font-extrabold tracking-tight">Manage <span class="text-teal-600 underline decoration-2 underline-offset-4">Club Memberships</span></h1>
          <p class="text-muted-foreground">Track which students are members of which clubs.</p>
        </div>
        <button (click)="onCreate()" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-teal-600/20 active:scale-95">
          + Add Membership
        </button>
      </div>

      <div *ngIf="formVisible" class="bg-white border border-border rounded-3xl shadow-sm p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-extrabold">
            {{ formMode === 'create' ? 'Create membership' : 'Edit membership' }}
          </h2>
          <button type="button" class="text-sm text-muted-foreground hover:text-foreground" (click)="closeForm()">
            Close
          </button>
        </div>
        <form (ngSubmit)="submitForm(mForm)" #mForm="ngForm" class="grid gap-4 md:grid-cols-3">
          <div>
            <label class="block text-xs font-semibold text-muted-foreground mb-1">Club</label>
            <select
              [(ngModel)]="formData.clubId"
              name="clubId"
              required
              #clubCtrl="ngModel"
              class="w-full px-3 py-2 rounded-xl border border-border text-sm"
            >
              <option [ngValue]="null">— Sélectionner un club —</option>
              <option *ngFor="let club of data.clubs()" [ngValue]="club.id">
                {{ club.name }}
              </option>
            </select>
            <p *ngIf="submitted && clubCtrl.invalid" class="mt-1 text-[11px] text-rose-600">
              Le club est obligatoire.
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
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <p *ngIf="submitted && statusCtrl.invalid" class="mt-1 text-[11px] text-rose-600">
              Le statut est obligatoire.
            </p>
          </div>
          <div class="md:col-span-3 flex justify-end gap-2 pt-2">
            <button type="button" class="px-4 py-2 rounded-xl border border-border text-sm font-medium" (click)="closeForm()">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-bold">
              {{ formMode === 'create' ? 'Save membership' : 'Update membership' }}
            </button>
          </div>
        </form>
      </div>

      <div class="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        <div class="px-4 pt-4 flex justify-end">
          <input
            [(ngModel)]="searchTerm"
            (ngModelChange)="currentPage = 1"
            type="text"
            placeholder="Search memberships..."
            class="w-full md:w-64 px-3 py-2 rounded-xl border border-border text-sm"
          />
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th class="px-6 py-4">ID</th>
                <th class="px-6 py-4">Club</th>
                <th class="px-6 py-4">Student</th>
                <th class="px-6 py-4">Joined at</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngFor="let m of pagedMemberships()" class="hover:bg-muted/20 transition-colors">
                <td class="px-6 py-4 text-sm text-muted-foreground">{{ m.id }}</td>
                <td class="px-6 py-4 text-sm">{{ getClubName(m.clubId) }}</td>
                <td class="px-6 py-4 text-sm">{{ getStudentName(m.studentId) }}</td>
                <td class="px-6 py-4 text-sm text-muted-foreground">{{ m.joinedAt | date:'short' }}</td>
                <td class="px-6 py-4 text-sm">{{ m.status }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button class="px-3 py-1 rounded-lg border border-border text-xs font-medium hover:bg-muted"
                            (click)="onEdit(m)">Edit</button>
                    <button class="px-3 py-1 rounded-lg border border-rose-200 text-xs font-medium text-rose-600 hover:bg-rose-50"
                            (click)="onDelete(m)">Delete</button>
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
export class AdminClubMembershipsComponent {
  data = inject(DataService);

  formVisible = false;
  formMode: 'create' | 'edit' = 'create';
  editingId: number | string | null = null;
  formData: AdminClubMembershipFormData = {
    status: 'ACTIVE',
    clubId: null,
    studentId: null
  };

  submitted = false;

  searchTerm = '';
  currentPage = 1;
  pageSize = 5;

  onCreate() {
    this.formMode = 'create';
    this.editingId = null;
    this.formData = { status: 'ACTIVE', clubId: null, studentId: null };
    this.formVisible = true;
  }

  onEdit(m: ClubMembership) {
    this.formMode = 'edit';
    this.editingId = m.id ?? null;
    this.formData = {
      status: m.status,
      clubId: (m.clubId as number) ?? null,
      studentId: (m.studentId as number) ?? null
    };
    this.formVisible = true;
  }

  onDelete(m: ClubMembership) {
    if (!m.id) return;
    const ok = confirm(`Supprimer l adhésion #${m.id} ?`);
    if (!ok) return;
    this.data.deleteClubMembership(m.id);
  }

  submitForm(form: NgForm) {
    this.submitted = true;
    if (form.invalid) {
      return;
    }
    if (this.formMode === 'create') {
      this.data.createClubMembership(this.formData);
    } else if (this.editingId != null) {
      this.data.updateClubMembership(this.editingId, this.formData);
    }
    this.formVisible = false;
    this.submitted = false;
  }

  closeForm() {
    this.formVisible = false;
    this.submitted = false;
  }

  getClubName(clubId: number | string | null): string {
    if (clubId == null) return '';
    const club = this.data.clubs().find(c => c.id === clubId);
    return club ? club.name : String(clubId);
  }

  getStudentName(studentId: number | string | null): string {
    if (studentId == null) return '';
    const student = this.data.students().find((s: Student) => s.id === studentId);
    return student ? student.name : String(studentId);
  }

  private filteredMemberships(): ClubMembership[] {
    const term = this.searchTerm.trim().toLowerCase();
    const list = this.data.clubMemberships();
    if (!term) return list;
    return list.filter((m: ClubMembership) =>
      JSON.stringify(m).toLowerCase().includes(term)
    );
  }

  get totalPages(): number {
    const total = this.filteredMemberships().length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  pagedMemberships(): ClubMembership[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMemberships().slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }
}

