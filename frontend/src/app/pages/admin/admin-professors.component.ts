import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  createdAt: string | null;
}

@Component({
  selector: 'app-admin-professors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <h1 class="text-3xl font-extrabold tracking-tight">Manage <span class="text-teal-600 underline decoration-2 underline-offset-4">Professors</span></h1>
          <p class="text-muted-foreground">Manage instructors attached to trainings and clubs.</p>
        </div>
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span *ngIf="dataSource" class="px-2 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">📡 {{ dataSource }}</span>
        </div>
      </div>

      <!-- Search -->
      <div class="flex justify-end">
        <input
          [(ngModel)]="searchTerm"
          (ngModelChange)="filterLocally()"
          type="text"
          placeholder="Search professors..."
          class="w-full md:w-72 px-3 py-2 rounded-xl border border-border text-sm"
        />
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <span class="w-8 h-8 border-3 border-teal-200 border-t-[#009689] rounded-full animate-spin"></span>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p class="text-red-600 font-medium mb-2">⚠️ {{ error }}</p>
        <button (click)="loadProfessors()" class="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition">Retry</button>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && !error && allProfessors.length === 0" class="bg-white rounded-3xl border border-border shadow-sm p-12 text-center">
        <p class="text-5xl mb-4">👨‍🏫</p>
        <p class="text-lg font-bold mb-1">No professors found</p>
        <p class="text-muted-foreground text-sm">No professor accounts exist yet. Professors appear here once they register.</p>
      </div>

      <!-- Table -->
      <div *ngIf="!loading && !error && allProfessors.length > 0" class="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th class="px-6 py-4">Name</th>
                <th class="px-6 py-4">Email</th>
                <th class="px-6 py-4">Phone</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Joined</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngIf="filteredProfessors.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-muted-foreground">No results for "{{ searchTerm }}"</td>
              </tr>
              <tr *ngFor="let prof of pagedProfessors()" class="hover:bg-muted/20 transition-colors">
                <td class="px-6 py-4 text-sm font-medium">
                  <span *ngIf="prof.firstName || prof.lastName">{{ prof.firstName || '' }} {{ prof.lastName || '' }}</span>
                  <span *ngIf="!prof.firstName && !prof.lastName" class="text-muted-foreground italic">No name</span>
                </td>
                <td class="px-6 py-4 text-sm text-muted-foreground">{{ prof.email }}</td>
                <td class="px-6 py-4 text-sm text-muted-foreground">{{ prof.phone || '—' }}</td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-bold"
                    [class]="prof.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : prof.status === 'SUSPENDED' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-600 border border-gray-200'">
                    {{ prof.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-xs text-muted-foreground">{{ prof.createdAt ? (prof.createdAt | date:'mediumDate') : '—' }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button *ngIf="prof.status !== 'ACTIVE'"
                      (click)="verifyUser(prof)"
                      class="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1">
                      ✅ Verify
                    </button>
                    <button *ngIf="prof.status === 'ACTIVE'"
                      (click)="suspendUser(prof)"
                      class="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition flex items-center gap-1">
                      ⏸️ Suspend
                    </button>
                    <button
                      (click)="deleteUser(prof)"
                      class="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition flex items-center gap-1">
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
          <span>Showing {{ filteredProfessors.length }} professor(s) · Page {{ currentPage }} / {{ totalPages }}</span>
          <div class="flex items-center gap-2">
            <button
              class="px-3 py-1 rounded-lg border border-border disabled:opacity-50 hover:bg-muted transition"
              (click)="goToPage(currentPage - 1)"
              [disabled]="currentPage === 1">
              Prev
            </button>
            <button
              class="px-3 py-1 rounded-lg border border-border disabled:opacity-50 hover:bg-muted transition"
              (click)="goToPage(currentPage + 1)"
              [disabled]="currentPage === totalPages">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminProfessorsComponent implements OnInit {
  private http = inject(HttpClient);
  private apiBase = 'http://localhost:8081/api';

  allProfessors: User[] = [];
  filteredProfessors: User[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  dataSource = '';

  ngOnInit() { this.loadProfessors(); }

  loadProfessors() {
    this.loading = true;
    this.error = '';
    this.dataSource = '';

    // Try BOTH sources in parallel, use whichever returns data
    const userService$ = this.http.get<any>(`${this.apiBase}/users?size=200`).pipe(
      catchError(err => { console.warn('[Professors] user-service failed:', err.status, err.statusText); return of(null); })
    );
    const clubService$ = this.http.get<any[]>(`${this.apiBase}/professors`).pipe(
      catchError(err => { console.warn('[Professors] club-event-service failed:', err.status, err.statusText); return of(null); })
    );

    forkJoin([userService$, clubService$]).subscribe(([usersRes, clubRes]) => {
      let professors: User[] = [];

      // Source 1: user-service (/api/users) — has role, status, full profile
      if (usersRes) {
        let users: any[] = [];
        if (usersRes.content && Array.isArray(usersRes.content)) {
          users = usersRes.content;
        } else if (Array.isArray(usersRes)) {
          users = usersRes;
        }
        const filtered = users.filter(u => u.role === 'PROFESSOR');
        if (filtered.length > 0) {
          professors = filtered.map(u => ({
            id: String(u.id), email: u.email, role: u.role,
            status: u.status || 'ACTIVE',
            firstName: u.firstName || null, lastName: u.lastName || null,
            phone: u.phone || null, createdAt: u.createdAt || null
          }));
          this.dataSource = 'user-service';
        }
      }

      // Source 2: club-event-service (/api/professors) — fallback
      if (professors.length === 0 && clubRes && Array.isArray(clubRes)) {
        professors = clubRes.map(p => ({
          id: String(p.id), email: p.email || '', role: 'PROFESSOR',
          status: 'ACTIVE',
          firstName: p.name?.split(' ')[0] || p.firstName || null,
          lastName: p.name?.split(' ').slice(1).join(' ') || p.lastName || null,
          phone: p.phone || null, createdAt: null
        }));
        this.dataSource = 'club-event-service';
      }

      if (professors.length === 0 && !usersRes && !clubRes) {
        this.error = 'Failed to load professors. Make sure user-service or club-event-service is running.';
      }

      this.allProfessors = professors;
      this.filterLocally();
      this.loading = false;
    });
  }

  filterLocally() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredProfessors = [...this.allProfessors];
    } else {
      this.filteredProfessors = this.allProfessors.filter(p =>
        (p.firstName || '').toLowerCase().includes(term) ||
        (p.lastName || '').toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredProfessors.length / this.pageSize));
  }

  pagedProfessors(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProfessors.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  verifyUser(user: User) {
    this.http.put<any>(`${this.apiBase}/users/${user.id}`, { status: 'ACTIVE' }).subscribe({
      next: () => { user.status = 'ACTIVE'; },
      error: () => alert('Failed to verify user. Make sure user-service is running.')
    });
  }

  suspendUser(user: User) {
    if (!confirm(`Suspend professor "${user.firstName ?? ''} ${user.lastName ?? ''}" (${user.email})?`)) return;
    this.http.put<any>(`${this.apiBase}/users/${user.id}`, { status: 'SUSPENDED' }).subscribe({
      next: () => { user.status = 'SUSPENDED'; },
      error: () => alert('Failed to suspend user. Make sure user-service is running.')
    });
  }

  deleteUser(user: User) {
    if (!confirm(`Delete professor "${user.firstName ?? ''} ${user.lastName ?? ''}" (${user.email})? This action cannot be undone.`)) return;

    this.http.delete(`${this.apiBase}/users/${user.id}`).pipe(
      catchError(() => this.http.delete(`${this.apiBase}/professors/${user.id}`).pipe(catchError(() => of(null))))
    ).subscribe({
      next: () => {
        this.allProfessors = this.allProfessors.filter(p => p.id !== user.id);
        this.filterLocally();
      },
      error: () => alert('Failed to delete user.')
    });
  }
}
