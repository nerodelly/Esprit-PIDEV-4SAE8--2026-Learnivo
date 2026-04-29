import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Trash2, Bell } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { ClaimsNotificationService } from '../../services/claims-notification.service';

interface Claim {
  id: number;
  student_name: string;
  student_email: string;
  subject: string;
  description: string;
  category: string;
  status: 'CREATED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
  priority: string;
  sentiment: string;
  ai_suggestion: string | null;
  admin_response: string | null;
  assigned_to: string | null;
  sla_deadline: string | null;
  escalated: boolean;
  escalation_count: number;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
}

interface ClaimsResponse {
  data: Claim[];
  meta: { total: number; page: number; limit: number; totalPages: number; };
}

interface ClaimStats {
  total: number; created: number; inProgress: number; resolved: number;
  closed: number; rejected: number; critical: number; escalated: number; slaBreached: number;
}

@Component({
  selector: 'app-admin-claims',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Stats Cards -->
    <div class="grid grid-cols-3 md:grid-cols-9 gap-3 mb-8">
      <div class="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
        <p class="text-xl font-bold text-gray-900">{{ stats.total }}</p>
        <p class="text-[10px] text-gray-400 mt-1">Total</p>
      </div>
      <div class="bg-white rounded-2xl border border-blue-100 p-4 text-center shadow-sm">
        <p class="text-xl font-bold text-blue-600">{{ stats.created }}</p>
        <p class="text-[10px] text-gray-400 mt-1">📋 Created</p>
      </div>
      <div class="bg-white rounded-2xl border border-amber-100 p-4 text-center shadow-sm">
        <p class="text-xl font-bold text-amber-600">{{ stats.inProgress }}</p>
        <p class="text-[10px] text-gray-400 mt-1">⚙️ In Progress</p>
      </div>
      <div class="bg-white rounded-2xl border border-green-100 p-4 text-center shadow-sm">
        <p class="text-xl font-bold text-green-600">{{ stats.resolved }}</p>
        <p class="text-[10px] text-gray-400 mt-1">✅ Resolved</p>
      </div>
      <div class="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
        <p class="text-xl font-bold text-slate-600">{{ stats.closed }}</p>
        <p class="text-[10px] text-gray-400 mt-1">🔒 Closed</p>
      </div>
      <div class="bg-white rounded-2xl border border-red-100 p-4 text-center shadow-sm">
        <p class="text-xl font-bold text-red-600">{{ stats.rejected }}</p>
        <p class="text-[10px] text-gray-400 mt-1">❌ Rejected</p>
      </div>
      <div class="bg-white rounded-2xl border border-purple-100 p-4 text-center shadow-sm">
        <p class="text-xl font-bold text-purple-600">{{ stats.critical }}</p>
        <p class="text-[10px] text-gray-400 mt-1">🚨 Critical</p>
      </div>
      <div class="bg-white rounded-2xl border border-orange-100 p-4 text-center shadow-sm">
        <p class="text-xl font-bold text-orange-600">{{ stats.escalated }}</p>
        <p class="text-[10px] text-gray-400 mt-1">⚡ Escalated</p>
      </div>
      <div class="bg-white rounded-2xl border p-4 text-center shadow-sm" [class]="stats.slaBreached > 0 ? 'border-red-300 bg-red-50' : 'border-gray-100'">
        <p class="text-xl font-bold" [class]="stats.slaBreached > 0 ? 'text-red-600 animate-pulse' : 'text-gray-400'">{{ stats.slaBreached }}</p>
        <p class="text-[10px] text-gray-400 mt-1">⏰ SLA Breach</p>
      </div>
    </div>

    <!-- Header & Filters -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <h1 class="text-2xl font-bold text-gray-900">Claims Management</h1>
      <div class="flex items-center gap-3">
        <!-- 🔔 Notification Bell -->
        <div class="relative">
          <button (click)="showNotifDropdown = !showNotifDropdown"
            class="relative p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition shadow-sm group">
            <lucide-icon [name]="Bell" [size]="20" class="text-gray-600 group-hover:text-[#009689] transition-colors"></lucide-icon>
            @if (claimsNotif.unreadCount() > 0) {
              <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                {{ claimsNotif.unreadCount() > 9 ? '9+' : claimsNotif.unreadCount() }}
              </span>
            }
            @if (claimsNotif.connected()) {
              <span class="absolute bottom-1 right-1 w-2 h-2 bg-emerald-400 rounded-full border border-white"></span>
            }
          </button>
          @if (showNotifDropdown) {
            <div class="absolute right-0 top-12 w-96 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden">
              <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#009689]/5 to-teal-50 border-b border-gray-100">
                <h3 class="text-sm font-bold text-gray-800 flex items-center gap-2">
                  🔔 Live Notifications
                  @if (claimsNotif.connected()) {
                    <span class="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">LIVE</span>
                  }
                </h3>
                <button (click)="claimsNotif.markAllAsRead('AGENT')" class="text-xs text-[#009689] hover:underline font-medium">Mark all read</button>
              </div>
              <div class="max-h-80 overflow-y-auto">
                @if (claimsNotif.notifications().length === 0) {
                  <div class="p-8 text-center">
                    <p class="text-gray-400 text-sm">No notifications yet</p>
                  </div>
                } @else {
                  @for (notif of claimsNotif.notifications().slice(0, 15); track notif.claimId) {
                    <div class="px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition cursor-pointer"
                      [class.bg-teal-50/30]="!notif.is_read">
                      <p class="text-sm font-semibold text-gray-800 truncate">{{ notif.title }}</p>
                      <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ notif.message }}</p>
                      <p class="text-[10px] text-gray-400 mt-1">{{ notif.created_at || notif.timestamp | date:'short' }}</p>
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🔍</span>
          <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="loadClaims()" placeholder="Search claims..."
            class="pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:border-[#009689] outline-none w-64 transition shadow-sm">
        </div>
        <select [(ngModel)]="filterStatus" (ngModelChange)="applyLocalFilters()"
          class="px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#009689] outline-none hover:bg-white transition shadow-sm">
          <option value="ALL">All Status</option>
          <option value="CREATED">📋 Created</option>
          <option value="IN_PROGRESS">⚙️ In Progress</option>
          <option value="RESOLVED">✅ Resolved</option>
          <option value="CLOSED">🔒 Closed</option>
          <option value="REJECTED">❌ Rejected</option>
        </select>
        <select [(ngModel)]="filterPriority" (ngModelChange)="applyLocalFilters()"
          class="px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#009689] outline-none hover:bg-white transition shadow-sm">
          <option value="ALL">All Priority</option>
          <option value="CRITICAL">🚨 Critical</option>
          <option value="HIGH">🔴 High</option>
          <option value="MEDIUM">🟡 Medium</option>
          <option value="LOW">🟢 Low</option>
        </select>
      </div>
    </div>

    <!-- Claims List -->
    @if (loading) {
      <div class="flex justify-center py-16">
        <span class="w-10 h-10 border-4 border-teal-100 border-t-[#009689] rounded-full animate-spin"></span>
      </div>
    } @else if (filteredClaims.length === 0) {
      <div class="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p class="text-gray-400 text-lg">No claims found.</p>
      </div>
    } @else {
      <div class="space-y-4">
        @for (claim of filteredClaims; track claim.id) {
          <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">

            <!-- Escalation glow -->
            @if (claim.escalated) {
              <div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-400 to-red-500 animate-pulse"></div>
            }

            <div class="p-6 pl-8">
              <!-- Top Row -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 class="font-semibold text-gray-900 text-lg">{{ claim.subject }}</h3>
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                      [class]="claim.priority === 'CRITICAL' ? 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse' : claim.priority === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100' : claim.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-teal-50 text-[#009689] border-teal-100'">
                      {{ claim.priority }}
                    </span>
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-gray-500 border border-gray-200 uppercase tracking-tighter">
                      {{ claim.category }}
                    </span>
                    @if (claim.escalated) {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 animate-pulse">
                        ⚡ ESCALATED (×{{ claim.escalation_count }})
                      </span>
                    }
                  </div>
                  <p class="text-sm text-gray-400">
                    From <strong class="text-gray-700">{{ claim.student_name }}</strong> <span class="text-xs">({{ claim.student_email }})</span>
                    · {{ claim.created_at | date:'medium' }}
                    @if (claim.assigned_to) {
                      · <span class="text-xs text-teal-600">→ {{ claim.assigned_to }}</span>
                    }
                  </p>
                </div>
                <div class="flex flex-col items-end gap-1.5">
                  <span class="px-3.5 py-1 rounded-full text-[11px] font-bold border"
                    [class]="getStatusClasses(claim.status)">
                    {{ getStatusIcon(claim.status) }} {{ claim.status }}
                  </span>
                  <!-- SLA Timer -->
                  @if (claim.sla_deadline && !isTerminal(claim.status)) {
                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                      [class]="getSLARemaining(claim.sla_deadline) <= 0 ? 'bg-red-100 text-red-700 animate-pulse' : getSLARemaining(claim.sla_deadline) < 6 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'">
                      ⏰ {{ formatSLA(claim.sla_deadline) }}
                    </span>
                  }
                </div>
              </div>

              <!-- Description -->
              <p class="text-sm text-gray-700 mb-5 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
                {{ claim.description }}
              </p>

              <!-- AI Insight -->
              @if (claim.ai_suggestion) {
                <div class="p-4 rounded-xl mb-4 border"
                  [class]="claim.ai_suggestion.includes('⚠️') ? 'bg-orange-50 border-orange-200' : 'bg-teal-50 border-teal-100'">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-xs font-bold uppercase tracking-wider"
                      [class]="claim.ai_suggestion.includes('⚠️') ? 'text-orange-600' : 'text-teal-600'">
                      🤖 AI Analysis & Strategy
                    </p>
                    <span class="text-xs font-semibold text-teal-600 bg-white px-2 py-0.5 rounded-md border border-teal-100">
                      Sentiment: {{ claim.sentiment }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-800 whitespace-pre-line">{{ claim.ai_suggestion }}</p>
                  @if (!isTerminal(claim.status)) {
                    <button (click)="useAiDraft(claim)"
                      class="mt-3 text-xs font-bold text-teal-700 bg-white border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition shadow-sm flex items-center gap-1.5">
                      ✨ Use AI Draft Response
                    </button>
                  }
                </div>
              }

              <!-- Workflow Action Buttons -->
              @if (!isTerminal(claim.status)) {
                <div class="border-t border-gray-100 pt-4 mt-4">
                  <label class="text-sm font-medium text-gray-700 mb-2 block">Response (optional)</label>
                  <textarea [(ngModel)]="responses[claim.id]" [name]="'resp_' + claim.id" rows="2"
                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition resize-none text-sm mb-3"
                    placeholder="Write a response to the student..."></textarea>
                  <div class="flex items-center gap-3 flex-wrap">
                    @if (claim.status === 'CREATED') {
                      <button (click)="updateStatus(claim, 'IN_PROGRESS')"
                        class="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 shadow-sm transition flex items-center gap-1.5">
                        ▶️ Start Processing
                      </button>
                      <button (click)="updateStatus(claim, 'REJECTED')"
                        class="px-5 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 shadow-sm transition flex items-center gap-1.5">
                        ❌ Reject
                      </button>
                    }
                    @if (claim.status === 'IN_PROGRESS') {
                      <button (click)="updateStatus(claim, 'RESOLVED')"
                        class="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 shadow-sm transition flex items-center gap-1.5">
                        ✅ Mark Resolved
                      </button>
                      <button (click)="updateStatus(claim, 'REJECTED')"
                        class="px-5 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 shadow-sm transition flex items-center gap-1.5">
                        ❌ Reject
                      </button>
                    }
                    @if (claim.status === 'RESOLVED') {
                      <button (click)="updateStatus(claim, 'CLOSED')"
                        class="px-5 py-2 bg-slate-700 text-white text-sm font-medium rounded-xl hover:bg-slate-800 shadow-sm transition flex items-center gap-1.5">
                        🔒 Close
                      </button>
                      <button (click)="updateStatus(claim, 'IN_PROGRESS')"
                        class="px-5 py-2 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 shadow-sm transition flex items-center gap-1.5">
                        🔄 Reopen
                      </button>
                    }
                    <button (click)="deleteClaim(claim)"
                      class="ml-auto p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 border border-transparent hover:border-red-100 group">
                      <lucide-icon [name]="Trash2" [size]="18" class="group-hover:scale-110 transition-transform"></lucide-icon>
                    </button>
                  </div>
                </div>
              } @else {
                @if (claim.admin_response) {
                  <div class="border-l-4 border-gray-300 pl-4 mt-4">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Admin Response</p>
                    <p class="text-sm text-gray-800">{{ claim.admin_response }}</p>
                  </div>
                }
                <div class="flex items-center justify-end mt-4 pt-4 border-t border-gray-50">
                  <button (click)="deleteClaim(claim)"
                    class="flex items-center gap-2 px-4 py-2 text-red-500 text-sm font-bold bg-white border border-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm group">
                    <lucide-icon [name]="Trash2" [size]="16" class="group-hover:animate-bounce"></lucide-icon>
                    <span>Remove</span>
                  </button>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Pagination -->
      <div *ngIf="meta.totalPages > 1" class="flex justify-center items-center gap-4 mt-8">
        <button (click)="changePage(meta.page - 1)" [disabled]="meta.page === 1"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition">
          Previous
        </button>
        <span class="text-sm font-medium text-gray-600">Page {{ meta.page }} of {{ meta.totalPages }}</span>
        <button (click)="changePage(meta.page + 1)" [disabled]="meta.page === meta.totalPages"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition">
          Next
        </button>
      </div>
    }
  `
})
export class AdminClaimsComponent implements OnInit, OnDestroy {
  readonly claimsNotif = inject(ClaimsNotificationService);
  Trash2 = Trash2;
  Bell = Bell;
  claims: Claim[] = [];
  filteredClaims: Claim[] = [];
  loading = true;
  showNotifDropdown = false;
  searchQuery = '';
  meta = { total: 0, page: 1, limit: 10, totalPages: 1 };
  filterStatus = 'ALL';
  filterPriority = 'ALL';
  responses: { [key: number]: string } = {};
  stats: ClaimStats = { total: 0, created: 0, inProgress: 0, resolved: 0, closed: 0, rejected: 0, critical: 0, escalated: 0, slaBreached: 0 };

  private apiBase = 'http://localhost:8082/api/claims';
  private slaTimer: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadClaims();
    this.loadStats();
    this.claimsNotif.connectAsAgent();
    this.claimsNotif.onNewNotification((notif) => {
      if (notif.type === 'CLAIM_CREATED' || notif.type === 'CLAIM_ESCALATED') {
        this.loadClaims();
        this.loadStats();
      }
    });
    // Refresh SLA timers every 30s
    this.slaTimer = setInterval(() => {}, 30000);
  }

  ngOnDestroy() {
    this.claimsNotif.disconnect();
    if (this.slaTimer) clearInterval(this.slaTimer);
  }

  loadClaims() {
    this.loading = true;
    const url = `${this.apiBase}?page=${this.meta.page}&limit=${this.meta.limit}&search=${encodeURIComponent(this.searchQuery)}`;
    this.http.get<ClaimsResponse | any>(url).subscribe({
      next: response => {
        if (response.data && response.meta) {
          this.claims = response.data;
          this.meta = response.meta;
        } else if (Array.isArray(response)) {
          this.claims = response;
          this.meta = { total: response.length, page: 1, limit: response.length, totalPages: 1 };
        }
        this.applyLocalFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.meta.totalPages) {
      this.meta.page = newPage;
      this.loadClaims();
    }
  }

  loadStats() {
    this.http.get<ClaimStats>(`${this.apiBase}/stats`).subscribe({
      next: s => this.stats = s,
      error: () => {}
    });
  }

  applyLocalFilters() {
    this.filteredClaims = this.claims.filter(c => {
      if (this.filterStatus !== 'ALL' && c.status !== this.filterStatus) return false;
      if (this.filterPriority !== 'ALL' && c.priority !== this.filterPriority) return false;
      return true;
    });
  }

  useAiDraft(claim: Claim) {
    if (!claim.ai_suggestion) return;
    const parts = claim.ai_suggestion.split('📝 AI Draft Response: "');
    if (parts.length > 1) {
      const draft = parts[1].slice(0, -1);
      this.responses[claim.id] = draft;
    }
  }

  updateStatus(claim: Claim, status: string) {
    const body = { status, admin_response: this.responses[claim.id] || '' };
    this.http.put<any>(`${this.apiBase}/${claim.id}/status`, body).subscribe({
      next: (res) => {
        claim.status = status as any;
        claim.admin_response = body.admin_response;
        this.loadStats();
        this.applyLocalFilters();
      },
      error: (err) => {
        alert(err.error?.error || 'Failed to update status');
      }
    });
  }

  deleteClaim(claim: Claim) {
    if (!confirm('Are you sure you want to delete this claim?')) return;
    this.http.delete(`${this.apiBase}/${claim.id}`).subscribe({
      next: () => { this.loadClaims(); this.loadStats(); }
    });
  }

  isTerminal(status: string): boolean {
    return status === 'CLOSED' || status === 'REJECTED';
  }

  getStatusClasses(status: string): string {
    const map: any = {
      CREATED: 'bg-blue-50 text-blue-700 border-blue-200',
      IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
      RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      CLOSED: 'bg-slate-50 text-slate-700 border-slate-200',
      REJECTED: 'bg-red-50 text-red-700 border-red-200'
    };
    return map[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  }

  getStatusIcon(status: string): string {
    const map: any = { CREATED: '📋', IN_PROGRESS: '⚙️', RESOLVED: '✅', CLOSED: '🔒', REJECTED: '❌' };
    return map[status] || '';
  }

  getSLARemaining(deadline: string): number {
    return (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);
  }

  formatSLA(deadline: string): string {
    const hours = this.getSLARemaining(deadline);
    if (hours <= 0) return 'BREACHED';
    if (hours < 1) return `${Math.round(hours * 60)}m left`;
    return `${hours.toFixed(1)}h left`;
  }
}
