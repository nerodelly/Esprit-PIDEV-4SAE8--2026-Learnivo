import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule, Clock, Globe, Video, Calendar, Users, X,
  AlertTriangle, ChevronRight, Check, Zap, BookOpen, ExternalLink
} from 'lucide-angular';
import { DataService, PlatformClass, EnrolledStudent } from '../services/data.service';

type JoinStep = 'form' | 'confirm' | 'success';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background pb-20 pt-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div class="space-y-4 max-w-2xl">
            <h1 class="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Live <span class="text-teal-600 underline underline-offset-8 decoration-4">Classes</span>
            </h1>
            <p class="text-lg text-muted-foreground leading-relaxed">
              Join live sessions with expert instructors. Interactive, engaging, and tailored to your level.
            </p>
          </div>
          <!-- Filter by day -->
          <div class="flex items-center gap-2 flex-wrap">
            <button (click)="filterDay.set('')"
                    [ngClass]="filterDay() === '' ? 'bg-teal-600 text-white' : 'bg-white border border-border text-foreground hover:bg-muted'"
                    class="px-4 py-2 rounded-xl font-bold text-sm transition-all">All</button>
            @for (day of days; track day) {
              <button (click)="filterDay.set(day)"
                      [ngClass]="filterDay() === day ? 'bg-teal-600 text-white' : 'bg-white border border-border text-foreground hover:bg-muted'"
                      class="px-4 py-2 rounded-xl font-bold text-sm transition-all">{{ day.slice(0,3) }}</button>
            }
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          @for (stat of statsRow(); track stat.label) {
            <div class="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
              <div [ngClass]="stat.bg" class="w-10 h-10 rounded-xl flex items-center justify-center">
                <lucide-icon [name]="stat.icon" [size]="18" [ngClass]="stat.color"></lucide-icon>
              </div>
              <div>
                <p class="text-xl font-black">{{ stat.value }}</p>
                <p class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{{ stat.label }}</p>
              </div>
            </div>
          }
        </div>

        <!-- Classes grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (cls of filtered(); track cls.id) {
            <div class="group flex flex-col bg-white rounded-3xl border border-border overflow-hidden hover:shadow-2xl hover:shadow-teal-600/10 transition-all duration-500 hover:-translate-y-1">

              <!-- Header color band -->
              <div [style.background]="cls.type === 'Workshop' ? 'linear-gradient(135deg, #9333ea, #7e22ce)' : cls.type === 'Bootcamp' ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'linear-gradient(135deg, #0d9488, #0f766e)'"
                   class=" p-6 text-white">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-full">{{ cls.type }}</span>
                  <span [ngClass]="{
                    'bg-teal-400/30 text-white': cls.status === 'active',
                    'bg-red-400/30 text-white': cls.status === 'full',
                    'bg-gray-400/30 text-white': cls.status === 'cancelled'
                  }" class="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full">{{ cls.status }}</span>
                </div>
                <h3 class="text-xl font-extrabold leading-tight">{{ cls.title }}</h3>
                <p class="text-white/70 text-sm mt-1">{{ cls.instructor }}</p>
              </div>

              <!-- Info -->
              <div class="p-6 flex-1 flex flex-col space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <lucide-icon [name]="Calendar" [size]="14" class="text-teal-600 shrink-0"></lucide-icon>
                    <span class="font-medium truncate">{{ cls.day }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <lucide-icon [name]="Clock" [size]="14" class="text-teal-600 shrink-0"></lucide-icon>
                    <span class="font-medium">{{ cls.time }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <lucide-icon [name]="BookOpen" [size]="14" class="text-purple-500 shrink-0"></lucide-icon>
                    <span class="font-medium">{{ cls.level }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <lucide-icon [name]="Users" [size]="14" class="text-orange-500 shrink-0"></lucide-icon>
                    <span class="font-medium">{{ (cls.enrolled?.length ?? 0) }}/{{ cls.maxCapacity }}</span>
                  </div>
                </div>

                <!-- Capacity bar -->
                <div class="space-y-1">
                  <div class="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all"
                         [ngClass]="enrolledFrac(cls) >= 1 ? 'bg-red-500' : enrolledFrac(cls) > 0.75 ? 'bg-orange-400' : 'bg-teal-600'"
                         [style.width.%]="enrolledFrac(cls) * 100"></div>
                  </div>
                  <p class="text-[10px] text-muted-foreground text-right font-medium">
                    {{ Math.max(0, (cls.maxCapacity ?? 0) - (cls.enrolled?.length ?? 0)) }} spots left
                  </p>
                </div>

                <!-- Meet link (si déjà généré) -->
                @if (cls.link) {
                  <a [href]="cls.link" target="_blank"
                     class="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-all">
                    <lucide-icon [name]="Video" [size]="14"></lucide-icon>
                    Join Google Meet
                    <lucide-icon [name]="ExternalLink" [size]="11" class="ml-auto"></lucide-icon>
                  </a>
                }

                <!-- CTA -->
                <div class="mt-auto pt-2">
                  @if (isAlreadyJoined(cls)) {
                    <div class="w-full py-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 font-black text-sm flex items-center justify-center gap-2">
                      <lucide-icon [name]="Check" [size]="16"></lucide-icon>
                      Enrolled
                    </div>
                  } @else if (cls.status === 'cancelled') {
                    <div class="w-full py-3 rounded-2xl bg-muted text-muted-foreground font-bold text-sm flex items-center justify-center">
                      Class Cancelled
                    </div>
                  } @else if (cls.status === 'full') {
                    <div class="w-full py-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 font-bold text-sm flex items-center justify-center">
                      Class Full
                    </div>
                  } @else {
                    <button (click)="openJoinModal(cls)"
                            class="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-600/20 active:scale-[0.98] group/btn">
                      <lucide-icon [name]="Zap" [size]="16" class="group-hover/btn:animate-bounce"></lucide-icon>
                      Join Class
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>

        @if (filtered().length === 0) {
          <div class="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-border">
            <p class="text-muted-foreground font-medium">No classes found for this day.</p>
          </div>
        }
      </div>
    </div>

    <!-- ── ENROLL MODAL ────────────────────────────────────────────────────── -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="closeModal()"></div>

        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-md border border-border overflow-hidden">

          <!-- STEP: form -->
          @if (joinStep() === 'form') {
            <div class="px-8 pt-8 pb-4 border-b border-border flex items-center justify-between">
              <div>
                <p class="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Step 1 of 2</p>
                <h2 class="text-xl font-extrabold">Your Information</h2>
              </div>
              <button (click)="closeModal()" class="p-2 hover:bg-muted rounded-xl"><lucide-icon [name]="X" [size]="20"></lucide-icon></button>
            </div>
            <div class="p-8 space-y-4">
              <div class="p-4 rounded-2xl bg-teal-50 border border-teal-100 flex items-center gap-3">
                <lucide-icon [name]="Video" [size]="18" class="text-teal-600 shrink-0"></lucide-icon>
                <div>
                  <p class="font-bold text-sm">{{ targetClass()!.title }}</p>
                  <p class="text-xs text-teal-600">{{ targetClass()!.day }} · {{ targetClass()!.time }}</p>
                </div>
              </div>

              @if (joinError()) {
                <div class="p-3 rounded-xl bg-red-50 border border-red-100 flex gap-2 text-red-700 text-sm">
                  <lucide-icon [name]="AlertTriangle" [size]="16" class="shrink-0 mt-0.5"></lucide-icon>
                  {{ joinError() }}
                </div>
              }

              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name *</label>
                <input [(ngModel)]="joinName" placeholder="e.g. Ahmed Ben Ali"
                       class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address *</label>
                <input [(ngModel)]="joinEmail" type="email" placeholder="you@example.com"
                       class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Your Current Level</label>
                <select [(ngModel)]="joinLevel"
                        class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
                  <option value="">Select your level</option>
                  @for (lvl of levels; track lvl) { <option [value]="lvl">{{ lvl }}</option> }
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Your Goal (optional)</label>
                <textarea [(ngModel)]="joinGoal" rows="2" placeholder="What do you hope to achieve?"
                          class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none resize-none"></textarea>
              </div>
              <button (click)="goToJoinConfirm()" [disabled]="!joinName || !joinEmail"
                      class="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-lg shadow-teal-600/20 active:scale-95 flex items-center justify-center gap-2">
                Continue <lucide-icon [name]="ChevronRight" [size]="18"></lucide-icon>
              </button>
            </div>
          }

          <!-- STEP: confirm -->
          @if (joinStep() === 'confirm') {
            <div class="px-8 pt-8 pb-4 border-b border-border flex items-center justify-between">
              <div>
                <p class="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Step 2 of 2</p>
                <h2 class="text-xl font-extrabold">Confirm Enrollment</h2>
              </div>
              <button (click)="closeModal()" class="p-2 hover:bg-muted rounded-xl"><lucide-icon [name]="X" [size]="20"></lucide-icon></button>
            </div>
            <div class="p-8 space-y-4">
              <div class="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-3">
                @for (row of confirmRows(); track row.label) {
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground font-medium">{{ row.label }}</span>
                    <span class="font-bold text-right max-w-[60%]">{{ row.value }}</span>
                  </div>
                }
              </div>
              <p class="text-xs text-muted-foreground text-center">
                📧 A Google Meet link will be sent to <strong>{{ joinEmail }}</strong>
              </p>
              @if (joinError()) {
                <div class="p-3 rounded-xl bg-red-50 border border-red-100 flex gap-2 text-red-700 text-sm">
                  <lucide-icon [name]="AlertTriangle" [size]="16" class="shrink-0 mt-0.5"></lucide-icon>
                  {{ joinError() }}
                </div>
              }
              <div class="flex gap-3">
                <button (click)="joinStep.set('form')" class="flex-1 py-3 border border-border rounded-2xl font-bold hover:bg-muted">← Edit</button>
                <button (click)="submitJoin()" class="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-teal-600/20 active:scale-95">
                  Confirm ✓
                </button>
              </div>
            </div>
          }

          <!-- STEP: success -->
          @if (joinStep() === 'success') {
            <div class="p-10 text-center space-y-6">
              <div class="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mx-auto text-5xl">🎓</div>
              <div class="space-y-2">
                <h2 class="text-2xl font-extrabold">You're Enrolled!</h2>
                <p class="text-muted-foreground">Welcome, <strong>{{ joinName }}</strong>! You've successfully joined <strong>{{ targetClass()!.title }}</strong>.</p>
              </div>

              <div class="p-4 bg-teal-50 rounded-2xl border border-teal-100 text-sm text-teal-700 font-medium space-y-1.5 text-left">
                <p>📅 <strong>{{ targetClass()!.day }}</strong> at <strong>{{ targetClass()!.time }}</strong></p>
                <p>👨‍🏫 Instructor: <strong>{{ targetClass()!.instructor }}</strong></p>
                <p>⏱ Duration: <strong>{{ targetClass()!.duration }}</strong></p>
              </div>

              <!-- ★ Lien Google Meet -->
              @if (enrolledMeetLink()) {
                <div class="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                  <div class="flex items-center justify-center gap-2 text-blue-700 font-black text-sm">
                    <lucide-icon [name]="Video" [size]="18"></lucide-icon>
                    Your Google Meet Link
                  </div>
                  <a [href]="enrolledMeetLink()!" target="_blank"
                     class="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all active:scale-95">
                    <lucide-icon [name]="ExternalLink" [size]="16"></lucide-icon>
                    Join the Class
                  </a>
                  <p class="text-xs text-blue-500 break-all">{{ enrolledMeetLink() }}</p>
                  <p class="text-xs text-blue-600 font-medium">📧 This link was also sent to {{ joinEmail }}</p>
                </div>
              }

              <button (click)="closeModal()" class="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold transition-all active:scale-95">
                Done 🚀
              </button>
            </div>
          }

        </div>
      </div>
    }
  `
})
export class ClassesComponent implements OnInit {
  data = inject(DataService);

  readonly Clock = Clock; readonly Globe = Globe; readonly Video = Video;
  readonly Calendar = Calendar; readonly Users = Users; readonly X = X;
  readonly AlertTriangle = AlertTriangle; readonly ChevronRight = ChevronRight;
  readonly Check = Check; readonly Zap = Zap; readonly BookOpen = BookOpen;
  readonly ExternalLink = ExternalLink;
  readonly Math = Math;

  readonly days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  readonly levels = ['A1', 'A2', 'A2/B1', 'B1', 'B2', 'C1', 'C2', 'All Levels', 'Beginner', 'Intermediate', 'Advanced'];

  filterDay   = signal('');
  showModal   = signal(false);
  targetClass = signal<PlatformClass | null>(null);
  joinStep    = signal<JoinStep>('form');
  joinError   = signal<string | null>(null);

  // ★ Lien Meet après enroll réussi
  enrolledMeetLink = signal<string | null>(null);

  joinName  = '';
  joinEmail = '';
  joinLevel = '';
  joinGoal  = '';

  private joinedIds = new Set<string>();

  ngOnInit() {
    const stored = localStorage.getItem('joined_classes');
    if (stored) {
      try { JSON.parse(stored).forEach((id: string) => this.joinedIds.add(id)); } catch {}
    }
  }

  statsRow() {
    const all = this.data.classes();
    return [
      { label: 'Total Classes', value: all.length,                                  bg: 'bg-teal-50',   color: 'text-teal-600',   icon: this.Video },
      { label: 'Instructors',   value: new Set(all.map(c => c.instructor)).size,     bg: 'bg-purple-50', color: 'text-purple-600', icon: this.Users },
      { label: 'Active',        value: all.filter(c => c.status === 'active').length, bg: 'bg-teal-50',  color: 'text-teal-600',   icon: this.Check },
      { label: 'Days Per Week', value: new Set(all.map(c => c.day)).size,            bg: 'bg-orange-50', color: 'text-orange-500', icon: this.Calendar },
    ];
  }

  filtered() {
    const day = this.filterDay();
    return day ? this.data.classes().filter(c => c.day === day) : this.data.classes();
  }

  enrolledFrac(cls: PlatformClass): number {
    if (!cls.maxCapacity) return 0;
    return Math.min(1, (cls.enrolled?.length ?? 0) / cls.maxCapacity);
  }

  isAlreadyJoined(cls: PlatformClass): boolean {
    return this.joinedIds.has(String(cls.id));
  }

  confirmRows() {
    const cls = this.targetClass();
    if (!cls) return [];
    return [
      { label: 'Name',       value: this.joinName },
      { label: 'Email',      value: this.joinEmail },
      { label: 'Class',      value: cls.title },
      { label: 'Instructor', value: cls.instructor },
      { label: 'Schedule',   value: `${cls.day} · ${cls.time}` },
      { label: 'Level',      value: cls.level },
      ...(this.joinLevel ? [{ label: 'Your Level', value: this.joinLevel }] : []),
    ];
  }

  openJoinModal(cls: PlatformClass) {
    this.targetClass.set(cls);
    this.joinStep.set('form');
    this.joinError.set(null);
    this.enrolledMeetLink.set(null);
    this.joinName = ''; this.joinEmail = ''; this.joinLevel = ''; this.joinGoal = '';
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  goToJoinConfirm() {
    if (!this.joinName.trim() || !this.joinEmail.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.joinEmail)) {
      this.joinError.set('Please enter a valid email address.');
      return;
    }
    this.joinError.set(null);
    this.joinStep.set('confirm');
  }

  submitJoin() {
    const cls = this.targetClass();
    if (!cls) return;

    const err = this.data.joinClass(cls.id, this.joinName.trim(), this.joinEmail.trim());
    if (err) { this.joinError.set(err); return; }

    // Persister l'état
    this.joinedIds.add(String(cls.id));
    localStorage.setItem('joined_classes', JSON.stringify([...this.joinedIds]));

    // Récupérer le lien Meet depuis la classe mise à jour
    const updated = this.data.classes().find(c => c.id === cls.id);
    if (updated) {
      this.targetClass.set(updated);
      // ★ Récupérer le lien Meet généré par le backend
      this.enrolledMeetLink.set(updated.link ?? null);
    }

    this.joinError.set(null);
    this.joinStep.set('success');
  }
}
