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
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <h1 class="text-3xl font-extrabold tracking-tight">Manage <span class="text-teal-600 underline decoration-2 underline-offset-4">Students</span></h1>
          <p class="text-muted-foreground">Manage learners accounts registered in the platform.</p>
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
          placeholder="Search students..."
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
        <button (click)="loadStudents()" class="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition">Retry</button>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && !error && allStudents.length === 0" class="bg-white rounded-3xl border border-border shadow-sm p-12 text-center">
        <p class="text-5xl mb-4">👩‍🎓</p>
        <p class="text-lg font-bold mb-1">No students found</p>
        <p class="text-muted-foreground text-sm">No student accounts exist yet. Students appear here once they register.</p>
      </div>

      <!-- Table -->
      <div *ngIf="!loading && !error && allStudents.length > 0" class="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
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
              <tr *ngIf="filteredStudents.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-muted-foreground">No results for "{{ searchTerm }}"</td>
              </tr>
              <tr *ngFor="let student of pagedStudents()" class="hover:bg-muted/20 transition-colors">
                <td class="px-6 py-4 text-sm font-medium">
                  <span *ngIf="student.firstName || student.lastName">{{ student.firstName || '' }} {{ student.lastName || '' }}</span>
                  <span *ngIf="!student.firstName && !student.lastName" class="text-muted-foreground italic">No name</span>
                </td>
                <td class="px-6 py-4 text-sm text-muted-foreground">{{ student.email }}</td>
                <td class="px-6 py-4 text-sm text-muted-foreground">{{ student.phone || '—' }}</td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-bold"
                    [class]="student.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : student.status === 'SUSPENDED' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-600 border border-gray-200'">
                    {{ student.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-xs text-muted-foreground">{{ student.createdAt ? (student.createdAt | date:'mediumDate') : '—' }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button *ngIf="student.status !== 'ACTIVE'"
                      (click)="verifyUser(student)"
                      class="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1">
                      ✅ Verify
                    </button>
                    <button *ngIf="student.status === 'ACTIVE'"
                      (click)="suspendUser(student)"
                      class="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition flex items-center gap-1">
                      ⏸️ Suspend
                    </button>
                    <button
                      (click)="deleteUser(student)"
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
          <span>Showing {{ filteredStudents.length }} student(s) · Page {{ currentPage }} / {{ totalPages }}</span>
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
export class AdminStudentsComponent implements OnInit {
  private http = inject(HttpClient);
  private apiBase = 'http://localhost:8082/api';

  allStudents: User[] = [];
  filteredStudents: User[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  dataSource = '';

  ngOnInit() { this.loadStudents(); }

  loadStudents() {
    this.loading = true;
    this.error = '';
    this.dataSource = '';

    // Try BOTH sources in parallel, use whichever returns data
    const userService$ = this.http.get<any>(`${this.apiBase}/users?size=200`).pipe(
      catchError(err => { console.warn('[Students] user-service failed:', err.status, err.statusText); return of(null); })
    );
    const clubService$ = this.http.get<any[]>(`${this.apiBase}/students`).pipe(
      catchError(err => { console.warn('[Students] club-event-service failed:', err.status, err.statusText); return of(null); })
    );

    forkJoin([userService$, clubService$]).subscribe(([usersRes, clubRes]) => {
      let students: User[] = [];

      // Source 1: user-service (/api/users) — has role, status, full profile
      if (usersRes) {
        let users: any[] = [];
        if (usersRes.content && Array.isArray(usersRes.content)) {
          users = usersRes.content;
        } else if (Array.isArray(usersRes)) {
          users = usersRes;
        }
        const filtered = users.filter(u => u.role === 'STUDENT');
        if (filtered.length > 0) {
          students = filtered.map(u => ({
            id: String(u.id), email: u.email, role: u.role,
            status: u.status || 'ACTIVE',
            firstName: u.firstName || null, lastName: u.lastName || null,
            phone: u.phone || null, createdAt: u.createdAt || null
          }));
          this.dataSource = 'user-service';
        }
      }

      // Source 2: club-event-service (/api/students) — fallback
      if (students.length === 0 && clubRes && Array.isArray(clubRes)) {
        students = clubRes.map(s => ({
          id: String(s.id), email: s.email || '', role: 'STUDENT',
          status: 'ACTIVE',
          firstName: s.name?.split(' ')[0] || s.firstName || null,
          lastName: s.name?.split(' ').slice(1).join(' ') || s.lastName || null,
          phone: s.phone || null, createdAt: null
        }));
        this.dataSource = 'club-event-service';
      }

      if (students.length === 0 && !usersRes && !clubRes) {
        this.error = 'Failed to load students. Make sure user-service or club-event-service is running.';
      }

      this.allStudents = students;
      this.filterLocally();
      this.loading = false;
    });
  }

  filterLocally() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredStudents = [...this.allStudents];
    } else {
      this.filteredStudents = this.allStudents.filter(s =>
        (s.firstName || '').toLowerCase().includes(term) ||
        (s.lastName || '').toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredStudents.length / this.pageSize));
  }

  pagedStudents(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredStudents.slice(start, start + this.pageSize);
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
    if (!confirm(`Suspend student "${user.firstName ?? ''} ${user.lastName ?? ''}" (${user.email})?`)) return;
    this.http.put<any>(`${this.apiBase}/users/${user.id}`, { status: 'SUSPENDED' }).subscribe({
      next: () => { user.status = 'SUSPENDED'; },
      error: () => alert('Failed to suspend user. Make sure user-service is running.')
    });
  }

  deleteUser(user: User) {
    if (!confirm(`Delete student "${user.firstName ?? ''} ${user.lastName ?? ''}" (${user.email})? This action cannot be undone.`)) return;

    // Try user-service first, then club-event-service
    this.http.delete(`${this.apiBase}/users/${user.id}`).pipe(
      catchError(() => this.http.delete(`${this.apiBase}/students/${user.id}`).pipe(catchError(() => of(null))))
    ).subscribe({
      next: () => {
        this.allStudents = this.allStudents.filter(s => s.id !== user.id);
        this.filterLocally();
      },
      error: () => alert('Failed to delete user.')
    });
  }
}
