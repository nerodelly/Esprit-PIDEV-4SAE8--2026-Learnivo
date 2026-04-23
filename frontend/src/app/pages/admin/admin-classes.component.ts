import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, PlatformClass, EnrolledStudent, ClassMaterial, AttendanceRecord } from '../../services/data.service';
import {
  LucideAngularModule, Video, Plus, Search, Pencil, Trash2, X,
  Clock, Globe, Calendar, User, ExternalLink, AlertTriangle,
  BookOpen, Check, RefreshCw, Users, FileText, Link
} from 'lucide-angular';

const EMPTY_CLASS = (): Omit<PlatformClass, 'id'> => ({
  title: '', instructor: '', day: 'Monday', time: '', duration: '',
  level: '', type: 'Live Class', link: '',
  status: 'active', maxCapacity: 20, enrolled: [],
  attendance: [], materials: [], recurring: true, notes: ''
});

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TYPES = ['Live Class', 'Workshop', 'Masterclass', 'Bootcamp', 'Webinar'];
const LEVELS = ['A1', 'A2', 'A2/B1', 'B1', 'B2', 'C1', 'C2', 'All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const MAT_TYPES: ClassMaterial['type'][] = ['pdf', 'slide', 'video', 'link'];

@Component({
  selector: 'app-admin-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-extrabold">Class <span class="text-teal-600 underline decoration-2 underline-offset-4">Scheduler</span></h1>
          <p class="text-muted-foreground mt-1">Manage sessions, track attendance, and share materials.</p>
        </div>
        <button (click)="openCreate()" class="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-600/20 active:scale-95 group">
          <lucide-icon [name]="Plus" [size]="18" class="group-hover:rotate-90 transition-transform"></lucide-icon>
          Schedule Class
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
        @for (stat of stats(); track stat.label) {
          <div class="bg-white rounded-3xl border border-border p-5 flex items-center gap-4 hover:border-teal-600/30 transition-colors">
            <div [ngClass]="stat.bg" class="w-11 h-11 rounded-2xl flex items-center justify-center">
              <lucide-icon [name]="stat.icon" [size]="20" [ngClass]="stat.color"></lucide-icon>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{{ stat.label }}</p>
              <p class="text-2xl font-black">{{ stat.value }}</p>
            </div>
          </div>
        }
      </div>

      <!-- Split: List + Detail -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Left: Class list -->
        <div class="lg:col-span-1 space-y-4">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <lucide-icon [name]="Search" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
              <input [(ngModel)]="searchQuery" type="text" placeholder="Search…"
                     class="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white border border-border text-sm font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
            </div>
            <select [(ngModel)]="filterDay"
                    class="px-3 py-2.5 rounded-2xl bg-white border border-border text-xs font-bold outline-none focus:ring-2 focus:ring-teal-600/20">
              <option value="">All</option>
              @for (d of days; track d) { <option [value]="d">{{ d.slice(0,3) }}</option> }
            </select>
          </div>

          <div class="space-y-3">
            @for (cls of filtered(); track cls.id) {
              <div (click)="select(cls)"
                   [ngClass]="selected()?.id === cls.id ? 'border-teal-600 bg-teal-50/50 shadow-md shadow-teal-600/10' : 'border-border hover:border-teal-600/40'"
                   class="bg-white rounded-2xl border p-4 cursor-pointer transition-all group">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-sm truncate group-hover:text-teal-600 transition-colors">{{ cls.title }}</p>
                    <p class="text-[10px] text-muted-foreground mt-0.5 font-medium">{{ cls.day }} · {{ cls.time }}</p>
                    <div class="flex items-center gap-2 mt-2 flex-wrap">
                      <span [ngClass]="{
                        'bg-teal-600/10 text-teal-600': cls.status === 'active',
                        'bg-orange-500/10 text-orange-600': cls.status === 'full',
                        'bg-red-500/10 text-red-500': cls.status === 'cancelled'
                      }" class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">{{ cls.status }}</span>
                      <span class="text-[10px] text-muted-foreground">{{ (cls.enrolled || []).length }}/{{ cls.maxCapacity }} enrolled</span>
                    </div>
                  </div>
                  <div class="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button (click)="openEdit(cls); $event.stopPropagation()" class="p-1.5 hover:bg-teal-100 rounded-lg transition-all">
                      <lucide-icon [name]="Pencil" [size]="13"></lucide-icon>
                    </button>
                    <button (click)="confirmDelete(cls); $event.stopPropagation()" class="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all">
                      <lucide-icon [name]="Trash2" [size]="13"></lucide-icon>
                    </button>
                  </div>
                </div>
              </div>
            } @empty {
              <p class="text-center text-muted-foreground py-8 text-sm font-medium">No classes found.</p>
            }
          </div>
        </div>

        <!-- Right: Detail panel -->
        <div class="lg:col-span-2">
          @if (selected()) {
            <div class="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">

              <!-- Header bar -->
              <div class="p-6 border-b border-border space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-[9px] font-black uppercase tracking-widest text-teal-600 bg-teal-100/50 px-2 py-0.5 rounded italic">{{ selected()!.type }}</span>
                      @if (selected()!.recurring) {
                        <span class="text-[9px] font-black uppercase tracking-widest text-purple-600 bg-purple-100/50 px-2 py-0.5 rounded italic flex items-center gap-1">
                          <lucide-icon [name]="RefreshCw" [size]="9"></lucide-icon> Weekly
                        </span>
                      }
                    </div>
                    <h2 class="text-lg font-extrabold text-foreground">{{ selected()!.title }}</h2>
                    <p class="text-sm text-muted-foreground">with {{ selected()!.instructor }} · {{ selected()!.day }} · {{ selected()!.time }}</p>
                  </div>
                  <div class="text-right space-y-1">
                    <div class="flex items-center justify-end gap-2 text-sm font-bold">
                      <lucide-icon [name]="Users" [size]="14" class="text-teal-600"></lucide-icon>
                      <span>{{ (selected()!.enrolled || []).length }} / {{ selected()!.maxCapacity }}</span>
                    </div>
                    <!-- Capacity bar -->
                    <div class="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all"
                           [ngClass]="capacityPct() >= 100 ? 'bg-red-500' : capacityPct() > 75 ? 'bg-orange-400' : 'bg-teal-600'"
                           [style.width.%]="capacityPct()"></div>
                    </div>
                  </div>
                </div>
                @if (selected()!.notes) {
                  <p class="text-xs text-muted-foreground italic bg-muted/30 rounded-xl px-4 py-2">📌 {{ selected()!.notes }}</p>
                }
              </div>

              <!-- Tabs -->
              <div class="border-b border-border">
                <div class="flex overflow-x-auto">
                  @for (tab of tabs; track tab) {
                    <button (click)="activeTab.set(tab)"
                            [ngClass]="activeTab() === tab ? 'border-b-2 border-teal-600 text-teal-600 font-bold' : 'text-muted-foreground hover:text-foreground'"
                            class="px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors">{{ tab }}</button>
                  }
                </div>
              </div>

              <!-- Tab: Enrolled -->
              @if (activeTab() === 'Enrolled') {
                <div class="p-6 space-y-4">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-bold text-muted-foreground">{{ (selected()!.enrolled || []).length }} students enrolled</p>
                    <button (click)="openEnrollModal()" class="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
                      <lucide-icon [name]="Plus" [size]="13"></lucide-icon> Enroll Student
                    </button>
                  </div>
                  @for (s of (selected()!.enrolled || []); track s.id) {
                    <div class="flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-muted/20 transition-all group">
                      <div class="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm shadow-teal-600/20">{{ s.name.charAt(0) }}</div>
                      <div class="flex-1 min-w-0">
                        <p class="font-bold text-sm">{{ s.name }}</p>
                        <p class="text-xs text-muted-foreground">{{ s.email }} · enrolled {{ s.enrolledAt }}</p>
                      </div>
                      <button (click)="unenroll(s.id)" title="Remove" class="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <lucide-icon [name]="Trash2" [size]="14"></lucide-icon>
                      </button>
                    </div>
                  } @empty {
                    <div class="py-10 text-center text-muted-foreground text-sm">No students enrolled yet.</div>
                  }
                </div>
              }

              <!-- Tab: Attendance -->
              @if (activeTab() === 'Attendance') {
                <div class="p-6 space-y-4">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-bold text-muted-foreground">Session records</p>
                    <button (click)="markTodayAttendance()" class="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
                      <lucide-icon [name]="Check" [size]="13"></lucide-icon> Mark Today
                    </button>
                  </div>
                  @for (record of (selected()!.attendance || []); track record.date) {
                    <div class="p-5 rounded-2xl border border-border space-y-3">
                      <div class="flex items-center justify-between">
                        <p class="font-bold text-sm">{{ record.date }}</p>
                        <span class="text-xs text-muted-foreground">{{ record.attendees.length }} present</span>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        @for (s of (selected()!.enrolled || []); track s.id) {
                          <button (click)="toggleAttendee(record, s.id)"
                                  [ngClass]="record.attendees.includes($any(s.id)) ? 'bg-teal-600 text-white' : 'bg-muted text-muted-foreground'"
                                  class="px-3 py-1.5 rounded-full text-[10px] font-bold transition-all hover:opacity-80">
                            {{ s.name.split(' ')[0] }}
                          </button>
                        } @empty {
                          <p class="text-xs text-muted-foreground italic">No enrolled students to track.</p>
                        }
                      </div>
                    </div>
                  } @empty {
                    <div class="py-10 text-center text-muted-foreground text-sm">No attendance records yet. Click "Mark Today" to start.</div>
                  }
                </div>
              }

              <!-- Tab: Materials -->
              @if (activeTab() === 'Materials') {
                <div class="p-6 space-y-4">
                  <button (click)="openMaterialModal()" class="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
                    <lucide-icon [name]="Plus" [size]="13"></lucide-icon> Add Material
                  </button>
                  @for (m of (selected()!.materials || []); track m.url; let i = $index) {
                    <div class="flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-muted/20 transition-all group">
                      <div [ngClass]="{
                        'bg-red-50 text-red-500': m.type === 'pdf',
                        'bg-blue-50 text-blue-500': m.type === 'slide',
                        'bg-purple-50 text-purple-500': m.type === 'video',
                        'bg-teal-50 text-teal-500': m.type === 'link'
                      }" class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0">
                        <lucide-icon [name]="m.type === 'link' ? Link : FileText" [size]="18"></lucide-icon>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-bold text-sm truncate">{{ m.title }}</p>
                        <p class="text-xs text-muted-foreground truncate">{{ m.url }}</p>
                      </div>
                      <span class="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{{ m.type }}</span>
                      <button (click)="removeMaterial(i)" class="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <lucide-icon [name]="Trash2" [size]="14"></lucide-icon>
                      </button>
                    </div>
                  } @empty {
                    <div class="py-10 text-center text-muted-foreground text-sm">No materials uploaded yet.</div>
                  }
                </div>
              }

              <!-- Tab: Notes -->
              @if (activeTab() === 'Notes') {
                <div class="p-6 space-y-4">
                  <textarea [(ngModel)]="notesText" rows="8" placeholder="Instructor notes, session agenda, reminders…"
                            class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 text-sm font-medium focus:ring-2 focus:ring-teal-600/20 outline-none resize-none leading-relaxed"></textarea>
                  <button (click)="saveNotes()" class="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-teal-600/20 active:scale-95">
                    Save Notes
                  </button>
                </div>
              }

            </div>
          } @else {
            <div class="h-80 bg-white rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <lucide-icon [name]="Video" [size]="40" class="opacity-20"></lucide-icon>
              <p class="font-bold">Select a class to manage it</p>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Enroll Student Modal -->
    @if (showEnrollModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="showEnrollModal.set(false)"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 space-y-5 border border-border">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-lg">Enroll Student</h3>
            <button (click)="showEnrollModal.set(false)" class="p-2 hover:bg-muted rounded-xl"><lucide-icon [name]="X" [size]="18"></lucide-icon></button>
          </div>
          <div class="space-y-3">
            <input [(ngModel)]="newStudentName" placeholder="Full name *" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
            <input [(ngModel)]="newStudentEmail" placeholder="Email address *" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
          </div>
          <div class="flex gap-3">
            <button (click)="enrollStudent()" [disabled]="!newStudentName || !newStudentEmail"
                    class="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all active:scale-95">Enroll</button>
            <button (click)="showEnrollModal.set(false)" class="px-5 py-3 border border-border rounded-2xl font-bold hover:bg-muted transition-all">Cancel</button>
          </div>
        </div>
      </div>
    }

    <!-- Add Material Modal -->
    @if (showMaterialModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="showMaterialModal.set(false)"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 space-y-5 border border-border">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-lg">Add Material</h3>
            <button (click)="showMaterialModal.set(false)" class="p-2 hover:bg-muted rounded-xl"><lucide-icon [name]="X" [size]="18"></lucide-icon></button>
          </div>
          <div class="space-y-3">
            <input [(ngModel)]="newMatTitle" placeholder="Title *" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
            <input [(ngModel)]="newMatUrl" placeholder="URL or file path *" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
            <select [(ngModel)]="newMatType" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
              @for (t of matTypes; track t) { <option [value]="t">{{ t }}</option> }
            </select>
          </div>
          <div class="flex gap-3">
            <button (click)="addMaterial()" [disabled]="!newMatTitle || !newMatUrl"
                    class="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all active:scale-95">Add</button>
            <button (click)="showMaterialModal.set(false)" class="px-5 py-3 border border-border rounded-2xl font-bold hover:bg-muted transition-all">Cancel</button>
          </div>
        </div>
      </div>
    }

    <!-- Create / Edit Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="closeModal()"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-border overflow-hidden">
          <div class="flex items-center justify-between px-8 pt-8 pb-4 border-b border-border">
            <h2 class="text-xl font-bold">{{ isEditing() ? 'Edit Class' : 'Schedule Class' }}</h2>
            <button (click)="closeModal()" class="p-2 rounded-xl hover:bg-muted"><lucide-icon [name]="X" [size]="20"></lucide-icon></button>
          </div>
          <form (ngSubmit)="save()" class="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Class Title *</label>
              <input [(ngModel)]="form.title" name="title" required placeholder="e.g. Advanced Business English"
                     class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Instructor *</label>
              <input [(ngModel)]="form.instructor" name="instructor" required placeholder="e.g. Dr. Sarah Wilson"
                     class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Day *</label>
                <select [(ngModel)]="form.day" name="day" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
                  @for (d of days; track d) { <option [value]="d">{{ d }}</option> }
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Type *</label>
                <select [(ngModel)]="form.type" name="type" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
                  @for (t of types; track t) { <option [value]="t">{{ t }}</option> }
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Time *</label>
                <input [(ngModel)]="form.time" name="time" required placeholder="10:00 AM - 12:00 PM"
                       class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Duration *</label>
                <input [(ngModel)]="form.duration" name="duration" required placeholder="e.g. 2 hours"
                       class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Level *</label>
                <select [(ngModel)]="form.level" name="level" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
                  <option value="">Select…</option>
                  @for (l of levels; track l) { <option [value]="l">{{ l }}</option> }
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Status</label>
                <select [(ngModel)]="form.status" name="status" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
                  <option value="active">Active</option>
                  <option value="full">Full</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Max Capacity</label>
                <input [(ngModel)]="form.maxCapacity" name="maxCapacity" type="number" placeholder="20"
                       class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Session Link</label>
                <input [(ngModel)]="form.link" name="link" placeholder="https://zoom.us/…"
                       class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
              </div>
            </div>
            <div class="flex items-center gap-3 pt-2">
              <input type="checkbox" [(ngModel)]="form.recurring" name="recurring" id="recurring" class="w-4 h-4 accent-teal-600">
              <label for="recurring" class="text-sm font-bold cursor-pointer">Recurring weekly session</label>
            </div>
            <div class="flex gap-3 pt-4 border-t border-border">
              <button type="submit" [disabled]="!form.title || !form.instructor || !form.time"
                      class="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-lg shadow-teal-600/20 active:scale-95">
                {{ isEditing() ? 'Save Changes' : 'Add to Schedule' }}
              </button>
              <button type="button" (click)="closeModal()" class="px-6 py-3 border border-border rounded-2xl font-bold hover:bg-muted transition-all">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirm -->
    @if (deleteTarget()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="deleteTarget.set(null)"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 space-y-6 border border-border text-center">
          <div class="w-14 h-14 rounded-3xl bg-red-50 flex items-center justify-center mx-auto text-red-500">
            <lucide-icon [name]="AlertTriangle" [size]="26"></lucide-icon>
          </div>
          <div>
            <h3 class="text-xl font-bold mb-2">Remove Class?</h3>
            <p class="text-sm text-muted-foreground">"<strong>{{ deleteTarget()!.title }}</strong>" will be permanently removed from the schedule.</p>
          </div>
          <div class="flex gap-3">
            <button (click)="doDelete()" class="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all active:scale-95">Remove</button>
            <button (click)="deleteTarget.set(null)" class="flex-1 py-3 border border-border rounded-2xl font-bold hover:bg-muted transition-all">Cancel</button>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminClassesComponent {
  data = inject(DataService);

  readonly days = DAYS;
  readonly types = TYPES;
  readonly levels = LEVELS;
  readonly matTypes = MAT_TYPES;

  // Icons
  readonly Video = Video; readonly Plus = Plus; readonly Search = Search;
  readonly Pencil = Pencil; readonly Trash2 = Trash2; readonly X = X;
  readonly Clock = Clock; readonly Globe = Globe; readonly Calendar = Calendar;
  readonly User = User; readonly ExternalLink = ExternalLink; readonly AlertTriangle = AlertTriangle;
  readonly BookOpen = BookOpen; readonly Check = Check; readonly RefreshCw = RefreshCw;
  readonly Users = Users; readonly FileText = FileText; readonly Link = Link;

  tabs = ['Enrolled', 'Attendance', 'Materials', 'Notes'];
  activeTab = signal('Enrolled');
  selected = signal<PlatformClass | null>(null);
  searchQuery = '';
  filterDay = '';
  showModal = signal(false);
  isEditing = signal(false);
  editId = signal<number | string | null>(null);
  deleteTarget = signal<PlatformClass | null>(null);
  showEnrollModal = signal(false);
  showMaterialModal = signal(false);
  newStudentName = '';
  newStudentEmail = '';
  newMatTitle = '';
  newMatUrl = '';
  newMatType: ClassMaterial['type'] = 'pdf';
  notesText = '';
  form: Omit<PlatformClass, 'id'> = EMPTY_CLASS();

  stats = computed(() => {
    const all = this.data.classes();
    const totalEnrolled = all.reduce((s, c) => s + (c.enrolled?.length ?? 0), 0);
    const instructors = new Set(all.map(c => c.instructor)).size;
    return [
      { label: 'Total Classes', value: all.length, bg: 'bg-teal-50', color: 'text-teal-600', icon: this.Video },
      { label: 'Enrolled', value: totalEnrolled, bg: 'bg-purple-50', color: 'text-purple-600', icon: this.Users },
      { label: 'Instructors', value: instructors, bg: 'bg-blue-50', color: 'text-blue-600', icon: this.User },
      { label: 'Active', value: all.filter(c => c.status === 'active').length, bg: 'bg-teal-50', color: 'text-teal-600', icon: this.Check },
    ];
  });

  capacityPct = computed(() => {
    const cls = this.selected();
    if (!cls || !cls.maxCapacity) return 0;
    return Math.min(100, Math.round(((cls.enrolled?.length ?? 0) / cls.maxCapacity) * 100));
  });

  filtered() {
    return this.data.classes().filter(c => {
      const q = this.searchQuery.toLowerCase();
      return (!q || c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q))
        && (!this.filterDay || c.day === this.filterDay);
    });
  }

  select(cls: PlatformClass) {
    this.selected.set(cls);
    this.activeTab.set('Enrolled');
    this.notesText = cls.notes ?? '';
  }

  private sync(updated: PlatformClass) {
    this.data.updateClass(updated);
    this.selected.set(updated);
  }

  // ── CRUD ──
  openCreate() {
    this.form = EMPTY_CLASS();
    this.isEditing.set(false);
    this.editId.set(null);
    this.showModal.set(true);
  }

  openEdit(cls: PlatformClass) {
    const { id, ...rest } = cls;
    this.form = { ...rest, enrolled: [...(rest.enrolled ?? [])], attendance: [...(rest.attendance ?? [])], materials: [...(rest.materials ?? [])] };
    this.editId.set(id);
    this.isEditing.set(true);
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  save() {
    if (!this.form.title || !this.form.instructor || !this.form.time) return;
    if (this.isEditing() && this.editId() !== null) {
      const updated = { id: this.editId()!, ...this.form };
      this.data.updateClass(updated);
      this.selected.set(updated);
    } else {
      this.data.addClass({ id: Date.now(), ...this.form });
    }
    this.closeModal();
  }

  confirmDelete(cls: PlatformClass) { this.deleteTarget.set(cls); }

  doDelete() {
    if (this.deleteTarget()) {
      if (this.selected()?.id === this.deleteTarget()!.id) this.selected.set(null);
      this.data.deleteClass(this.deleteTarget()!.id);
      this.deleteTarget.set(null);
    }
  }

  // ── Enrollment ──
  openEnrollModal() { this.newStudentName = ''; this.newStudentEmail = ''; this.showEnrollModal.set(true); }

  enrollStudent() {
    if (!this.selected() || !this.newStudentName || !this.newStudentEmail) return;
    const student: EnrolledStudent = { id: Date.now(), name: this.newStudentName, email: this.newStudentEmail, enrolledAt: new Date().toISOString().slice(0, 10) };
    this.sync({ ...this.selected()!, enrolled: [...(this.selected()!.enrolled ?? []), student] });
    this.showEnrollModal.set(false);
  }

  unenroll(id: number | string) {
    if (!this.selected()) return;
    this.sync({ ...this.selected()!, enrolled: (this.selected()!.enrolled ?? []).filter(s => s.id !== id) });
  }

  // ── Attendance ──
  markTodayAttendance() {
    if (!this.selected()) return;
    const today = new Date().toISOString().slice(0, 10);
    const existing = (this.selected()!.attendance ?? []).find(r => r.date === today);
    if (existing) return;
    const record: AttendanceRecord = { date: today, attendees: [] };
    this.sync({ ...this.selected()!, attendance: [...(this.selected()!.attendance ?? []), record] });
  }

  toggleAttendee(record: AttendanceRecord, studentId: number | string) {
    if (!this.selected()) return;
    const was = record.attendees.includes(studentId);
    const attendees = was ? record.attendees.filter(id => id !== studentId) : [...record.attendees, studentId];
    const attendance = (this.selected()!.attendance ?? []).map(r => r.date === record.date ? { ...r, attendees } : r);
    this.sync({ ...this.selected()!, attendance });
  }

  // ── Materials ──
  openMaterialModal() { this.newMatTitle = ''; this.newMatUrl = ''; this.newMatType = 'pdf'; this.showMaterialModal.set(true); }

  addMaterial() {
    if (!this.selected() || !this.newMatTitle || !this.newMatUrl) return;
    const mat: ClassMaterial = { title: this.newMatTitle, url: this.newMatUrl, type: this.newMatType };
    this.sync({ ...this.selected()!, materials: [...(this.selected()!.materials ?? []), mat] });
    this.showMaterialModal.set(false);
  }

  removeMaterial(index: number) {
    if (!this.selected()) return;
    const materials = (this.selected()!.materials ?? []).filter((_, i) => i !== index);
    this.sync({ ...this.selected()!, materials });
  }

  // ── Notes ──
  saveNotes() {
    if (!this.selected()) return;
    this.sync({ ...this.selected()!, notes: this.notesText });
  }
}
