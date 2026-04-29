import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { ClaimsNotificationService } from '../services/claims-notification.service';

interface Claim {
  id: number;
  student_name: string;
  student_email: string;
  subject: string;
  description: string;
  category: string;
  status: 'CREATED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
  priority: string;
  admin_response: string | null;
  assigned_to: string | null;
  sla_deadline: string | null;
  escalated: boolean;
  created_at: string;
}

interface ClaimsResponse {
  data: Claim[];
  meta: { total: number; page: number; limit: number; totalPages: number; };
}

@Component({
  selector: 'app-claims',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="max-w-4xl mx-auto px-4 py-12">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Support & Claims</h1>
        <p class="text-gray-500">Submit a claim and we'll get back to you as soon as possible.</p>
      </div>

      <!-- 🔔 Real-time Notification Banner -->
      @if (claimsNotif.notifications().length > 0) {
        <div class="mb-6 space-y-2">
          @for (notif of claimsNotif.notifications().slice(0, 3); track notif.claimId) {
            @if (!notif.is_read) {
              <div class="flex items-center gap-3 p-4 rounded-xl border shadow-sm"
                [class]="getNotifBannerClass(notif)">
                <span class="text-xl">{{ getNotifIcon(notif) }}</span>
                <div class="flex-1">
                  <p class="text-sm font-semibold">{{ notif.title }}</p>
                  <p class="text-xs mt-0.5 opacity-75">{{ notif.message }}</p>
                </div>
                <button (click)="dismissNotif(notif)" class="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
              </div>
            }
          }
        </div>
      }

      @if (claimsNotif.connected()) {
        <div class="flex items-center gap-2 mb-4 text-xs text-emerald-600">
          <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          Live updates enabled — you'll be notified when your claims are reviewed
        </div>
      }

      <!-- New Claim Form -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-10">
        <h2 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <span class="w-8 h-8 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center text-sm">📝</span>
          Submit a New Claim
        </h2>
        <form (ngSubmit)="submitClaim()" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
              <input [(ngModel)]="newClaim.subject" (ngModelChange)="checkBadWords()" name="subject" required
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition bg-gray-50 focus:bg-white"
                placeholder="Brief summary of your issue">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select [(ngModel)]="newClaim.category" name="category"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition bg-gray-50 focus:bg-white">
                <option value="General">General</option>
                <option value="Technical">Technical Issue</option>
                <option value="Course">Course Content</option>
                <option value="Payment">Payment / Billing</option>
                <option value="Account">Account Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea [(ngModel)]="newClaim.description" (ngModelChange)="checkBadWords()" name="description" required rows="4"
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition resize-none bg-gray-50 focus:bg-white"
              placeholder="Describe your issue in detail..."></textarea>
          </div>
          @if (badWordWarning) {
            <div class="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200 flex items-center gap-2">
              <span>⚠️</span> Please maintain a respectful tone. Inappropriate language will result in auto-rejection.
            </div>
          }
          <div class="flex justify-end">
            <button type="submit" [disabled]="submitting || !newClaim.subject || !newClaim.description"
              class="px-6 py-2.5 bg-[#009689] text-white font-medium rounded-xl hover:bg-[#00796b] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm">
              @if (submitting) {
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Submitting...
              } @else {
                Submit Claim
              }
            </button>
          </div>
        </form>
        @if (successMessage) {
          <div class="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-xl text-teal-700 text-sm flex items-center gap-2 font-medium">
            ✅ {{ successMessage }}
          </div>
        }
        @if (errorMessage) {
          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2 font-medium">
            ❌ {{ errorMessage }}
          </div>
        }
      </div>

      <!-- My Claims History -->
      <div>
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span class="w-8 h-8 bg-teal-100 text-[#009689] rounded-lg flex items-center justify-center text-sm">📋</span>
            My Claims History
          </h2>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🔍</span>
            <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="loadMyClaims()" placeholder="Search my claims..."
              class="pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:border-[#009689] outline-none w-64 shadow-sm transition">
          </div>
        </div>

        @if (loading) {
          <div class="flex justify-center py-12">
            <span class="w-8 h-8 border-3 border-teal-200 border-t-[#009689] rounded-full animate-spin"></span>
          </div>
        } @else if (claims.length === 0) {
          <div class="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p class="text-gray-400 text-lg">No claims found.</p>
          </div>
        } @else {
          <div class="space-y-4">
            @for (claim of claims; track claim.id) {
              <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                @if (claim.status === 'REJECTED') {
                  <div class="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                }
                <div class="flex items-start justify-between mb-3 pl-2">
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ claim.subject }}</h3>
                    <p class="text-xs text-gray-400 mt-0.5">{{ claim.category }} · {{ claim.created_at | date:'medium' }}</p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-semibold border" [class]="getStatusClasses(claim.status)">
                    {{ getStatusIcon(claim.status) }} {{ getStatusLabel(claim.status) }}
                  </span>
                </div>

                <p class="text-sm text-gray-600 mb-4 pl-2">{{ claim.description }}</p>

                <!-- Workflow Progress Stepper -->
                @if (claim.status !== 'REJECTED') {
                  <div class="flex items-center gap-0 mb-4 px-2">
                    @for (step of workflowSteps; track step.key; let i = $index) {
                      <div class="flex items-center" [class]="i < workflowSteps.length - 1 ? 'flex-1' : ''">
                        <div class="flex flex-col items-center">
                          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all"
                            [class]="getStepClass(claim.status, step.key)">
                            {{ getStepIndex(claim.status, step.key) >= getStepIndex(claim.status, claim.status) ? step.icon : '✓' }}
                          </div>
                          <span class="text-[9px] font-medium mt-1 text-center leading-tight"
                            [class]="isStepCompleted(claim.status, step.key) ? 'text-teal-600' : isStepActive(claim.status, step.key) ? 'text-blue-600' : 'text-gray-400'">
                            {{ step.label }}
                          </span>
                        </div>
                        @if (i < workflowSteps.length - 1) {
                          <div class="flex-1 h-0.5 mx-1 rounded"
                            [class]="isStepCompleted(claim.status, workflowSteps[i + 1].key) || isStepActive(claim.status, workflowSteps[i + 1].key) ? 'bg-teal-400' : 'bg-gray-200'">
                          </div>
                        }
                      </div>
                    }
                  </div>
                }

                <div class="pl-2">
                  @if (claim.priority && claim.status !== 'REJECTED') {
                    <span class="text-xs px-2 py-0.5 rounded-full mr-2 font-medium"
                      [class]="claim.priority === 'CRITICAL' ? 'bg-purple-50 text-purple-700 border border-purple-200' : claim.priority === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' : claim.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' : 'bg-teal-50 text-[#009689] border border-teal-100'">
                      Priority: {{ claim.priority }}
                    </span>
                  }
                  @if (claim.escalated) {
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-50 text-orange-700 border border-orange-200">
                      ⚡ Escalated
                    </span>
                  }
                  @if (claim.admin_response) {
                    <div class="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p class="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Admin Response:</p>
                      <p class="text-sm text-slate-700">{{ claim.admin_response }}</p>
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
      </div>
    </section>
  `
})
export class ClaimsComponent implements OnInit, OnDestroy {
  readonly claimsNotif = inject(ClaimsNotificationService);
  claims: Claim[] = [];
  loading = true;
  submitting = false;
  successMessage = '';
  errorMessage = '';
  badWordWarning = false;
  newClaim = { subject: '', description: '', category: 'General' };
  searchQuery = '';
  meta = { total: 0, page: 1, limit: 5, totalPages: 1 };

  private apiBase = 'http://localhost:8082/api/claims';
  private badWords = ['idiot', 'stupid', 'dumb', 'hate', 'terrible', 'awful', 'shut up', 'useless', 'garbage', 'trash', 'damn', 'hell'];

  // Workflow steps for the visual stepper
  workflowSteps = [
    { key: 'CREATED', label: 'Created', icon: '📋' },
    { key: 'IN_PROGRESS', label: 'Processing', icon: '⚙️' },
    { key: 'RESOLVED', label: 'Resolved', icon: '✅' },
    { key: 'CLOSED', label: 'Closed', icon: '🔒' }
  ];

  private stepOrder: Record<string, number> = { CREATED: 0, IN_PROGRESS: 1, RESOLVED: 2, CLOSED: 3 };

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.loadMyClaims();
    const user = this.auth.getCurrentUser();
    if (user?.email) {
      this.claimsNotif.connectAsUser(user.email);
      this.claimsNotif.onNewNotification((notif) => {
        if (notif.type === 'STATUS_CHANGED' || notif.type === 'CLAIM_ESCALATED') {
          this.loadMyClaims();
        }
      });
    }
  }

  ngOnDestroy() { this.claimsNotif.disconnect(); }

  dismissNotif(notif: any) { if (notif.id) this.claimsNotif.markAsRead(notif.id); }

  checkBadWords() {
    const txt = (this.newClaim.subject + ' ' + this.newClaim.description).toLowerCase();
    this.badWordWarning = this.badWords.some(w => txt.includes(w));
  }

  loadMyClaims() {
    const user = this.auth.getCurrentUser();
    if (!user?.email) { this.loading = false; return; }
    this.loading = true;
    const url = `${this.apiBase}/student/${encodeURIComponent(user.email)}?page=${this.meta.page}&limit=${this.meta.limit}&search=${encodeURIComponent(this.searchQuery)}`;
    this.http.get<ClaimsResponse | any>(url).subscribe({
      next: response => {
        if (response.data && response.meta) { this.claims = response.data; this.meta = response.meta; }
        else if (Array.isArray(response)) { this.claims = response; this.meta = { total: response.length, page: 1, limit: response.length, totalPages: 1 }; }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.meta.totalPages) { this.meta.page = newPage; this.loadMyClaims(); }
  }

  submitClaim() {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.submitting = true; this.successMessage = ''; this.errorMessage = '';
    const payload = {
      student_name: user.name || 'Student', student_email: user.email,
      subject: this.newClaim.subject, description: this.newClaim.description, category: this.newClaim.category
    };
    this.http.post<any>(this.apiBase, payload).subscribe({
      next: (res) => {
        if (res.status === 'REJECTED') {
          this.errorMessage = 'Claim automatically rejected. ' + res.admin_response;
        } else {
          this.successMessage = 'Your claim has been submitted successfully! You will be notified when it is reviewed.';
        }
        this.newClaim = { subject: '', description: '', category: 'General' };
        this.badWordWarning = false; this.submitting = false; this.meta.page = 1; this.searchQuery = '';
        this.loadMyClaims();
      },
      error: () => { this.errorMessage = 'Failed to submit claim. Please try again.'; this.submitting = false; }
    });
  }

  // Stepper helpers
  getStepIndex(claimStatus: string, stepKey: string): number { return this.stepOrder[stepKey] ?? -1; }
  isStepCompleted(claimStatus: string, stepKey: string): boolean { return (this.stepOrder[claimStatus] ?? -1) > (this.stepOrder[stepKey] ?? -1); }
  isStepActive(claimStatus: string, stepKey: string): boolean { return claimStatus === stepKey; }

  getStepClass(claimStatus: string, stepKey: string): string {
    if (this.isStepCompleted(claimStatus, stepKey)) return 'bg-teal-500 border-teal-500 text-white';
    if (this.isStepActive(claimStatus, stepKey)) return 'bg-blue-100 border-blue-500 text-blue-700';
    return 'bg-gray-100 border-gray-300 text-gray-400';
  }

  getStatusClasses(status: string): string {
    const map: any = {
      CREATED: 'bg-blue-50 text-blue-700 border-blue-200', IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
      RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200', CLOSED: 'bg-slate-50 text-slate-700 border-slate-200',
      REJECTED: 'bg-red-50 text-red-700 border-red-200'
    };
    return map[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  }

  getStatusIcon(status: string): string {
    return ({ CREATED: '📋', IN_PROGRESS: '⚙️', RESOLVED: '✅', CLOSED: '🔒', REJECTED: '❌' } as any)[status] || '';
  }

  getStatusLabel(status: string): string {
    return ({ CREATED: 'Created', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed', REJECTED: 'Rejected' } as any)[status] || status;
  }

  getNotifBannerClass(notif: any): string {
    if (notif.newStatus === 'RESOLVED' || notif.newStatus === 'CLOSED') return 'bg-emerald-50 border-emerald-200';
    if (notif.newStatus === 'REJECTED') return 'bg-red-50 border-red-200';
    if (notif.newStatus === 'IN_PROGRESS') return 'bg-blue-50 border-blue-200';
    if (notif.type === 'CLAIM_ESCALATED') return 'bg-orange-50 border-orange-200';
    return 'bg-blue-50 border-blue-200';
  }

  getNotifIcon(notif: any): string {
    if (notif.newStatus === 'RESOLVED' || notif.newStatus === 'CLOSED') return '✅';
    if (notif.newStatus === 'REJECTED') return '❌';
    if (notif.newStatus === 'IN_PROGRESS') return '⚙️';
    if (notif.type === 'CLAIM_ESCALATED') return '⚡';
    return '🔔';
  }
}
