import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Competition, Participant, CompetitionRound, Announcement } from '../../services/data.service';
import {
  LucideAngularModule, Trophy, Plus, Search, Pencil, Trash2, X,
  CheckCircle2, Clock, AlertTriangle, Users, Tag, Medal, Star, Flag
} from 'lucide-angular';

const EMPTY_COMP = (): Omit<Competition, 'id'> => ({
  title: '', description: '', image: '/images/event-1.jpg', slug: '',
  status: 'upcoming', startDate: '', deadline: '', prize: '', category: '',
  tags: [], maxParticipants: 50, participants: [], rounds: [],
  rules: '', resultsPublished: false
});

@Component({
  selector: 'app-admin-competitions',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SlicePipe],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-extrabold">Competition <span class="text-teal-600 underline decoration-2 underline-offset-4">Manager</span></h1>
          <p class="text-muted-foreground mt-1">Full lifecycle management: participants, rounds, leaderboard.</p>
        </div>
        <button (click)="openCreate()" class="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-600/20 active:scale-95 group">
          <lucide-icon [name]="Plus" [size]="18" class="group-hover:rotate-90 transition-transform"></lucide-icon>
          New Competition
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

      <!-- Split List / Detail -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Liste -->
        <div class="lg:col-span-1 space-y-4">
          <div class="relative">
            <lucide-icon [name]="Search" [size]="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
            <input [(ngModel)]="searchQuery" type="text" placeholder="Search…"
                   class="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-border font-medium focus:ring-2 focus:ring-teal-600/20 outline-none text-sm">
          </div>
          <div class="space-y-3">
            @for (comp of filtered(); track comp.id) {
              <div (click)="select(comp)"
                   [ngClass]="selected()?.id === comp.id ? 'border-teal-600 bg-teal-50/50 shadow-md shadow-teal-600/10' : 'border-border hover:border-teal-600/40'"
                   class="bg-white rounded-2xl border p-4 cursor-pointer transition-all group">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-sm truncate group-hover:text-teal-600 transition-colors">{{ comp.title }}</p>
                    <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span [ngClass]="{
                        'bg-teal-600/10 text-teal-600': comp.status === 'ongoing',
                        'bg-orange-500/10 text-orange-600': comp.status === 'upcoming',
                        'bg-muted text-muted-foreground': comp.status === 'completed'
                      }" class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">{{ comp.status }}</span>
                      <span class="text-[10px] text-muted-foreground">{{ (comp.participants||[]).length }}/{{ comp.maxParticipants }}</span>
                    </div>
                    @if (comp.status !== 'completed' && comp.deadline) {
                      <p class="text-[10px] text-teal-600 font-bold mt-1 flex items-center gap-1">
                        <lucide-icon [name]="Clock" [size]="10"></lucide-icon>
                        {{ miniCountdown(comp.deadline) }}
                      </p>
                    }
                  </div>
                  <div class="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button (click)="openEdit(comp); $event.stopPropagation()" class="p-1.5 hover:bg-teal-100 hover:text-teal-700 rounded-lg transition-all">
                      <lucide-icon [name]="Pencil" [size]="13"></lucide-icon>
                    </button>
                    <button (click)="confirmDelete(comp); $event.stopPropagation()" class="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all">
                      <lucide-icon [name]="Trash2" [size]="13"></lucide-icon>
                    </button>
                  </div>
                </div>
              </div>
            } @empty {
              <p class="text-center text-muted-foreground py-8 text-sm font-medium">No competitions found.</p>
            }
          </div>
        </div>

        <!-- Detail -->
        <div class="lg:col-span-2">
          @if (selected()) {
            <div class="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">

              <!-- Banner -->
              <div class="relative h-40 overflow-hidden">
                <img [src]="selected()!.image" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div class="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                  <div>
                    <h2 class="text-lg font-extrabold text-white leading-tight line-clamp-2">{{ selected()!.title }}</h2>
                    <div class="flex items-center gap-2 mt-1 flex-wrap">
                      @for (tag of (selected()!.tags||[]); track tag) {
                        <span class="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-[9px] font-bold text-white">#{{ tag }}</span>
                      }
                    </div>
                  </div>
                  <span class="text-lg font-black text-teal-400">{{ selected()!.prize }}</span>
                </div>
              </div>

              <!-- Countdown admin -->
              @if (selected()!.status !== 'completed' && countdown().length > 0) {
                <div class="px-6 pt-4">
                  <div class="p-4 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 text-white flex items-center gap-6">
                    <div class="flex-1">
                      <p class="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Registration closes in</p>
                      <div class="flex items-center gap-4">
                        @for (unit of countdown(); track unit.label) {
                          <div class="text-center">
                            <p class="text-2xl font-black leading-none">{{ unit.value }}</p>
                            <p class="text-[9px] uppercase tracking-widest opacity-70 mt-0.5">{{ unit.label }}</p>
                          </div>
                          @if (!$last) { <span class="text-white/50 font-black text-xl">:</span> }
                        }
                      </div>
                    </div>
                    <lucide-icon [name]="Trophy" [size]="32" class="opacity-30 shrink-0"></lucide-icon>
                  </div>
                </div>
              }

              <!-- Tabs -->
              <div class="border-b border-border mt-4">
                <div class="flex overflow-x-auto">
                  @for (tab of tabs; track tab) {
                    <button (click)="activeTab.set(tab)"
                            [ngClass]="activeTab() === tab ? 'border-b-2 border-teal-600 text-teal-600 font-bold' : 'text-muted-foreground hover:text-foreground'"
                            class="px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors">{{ tab }}</button>
                  }
                </div>
              </div>

              <!-- Overview -->
              @if (activeTab() === 'Overview') {
                <div class="p-6 space-y-6">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
                      <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Start Date</p>
                      <p class="font-bold text-sm">{{ selected()!.startDate ? formatDeadline(selected()!.startDate!) : '—' }}</p>
                    </div>
                    <div class="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
                      <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deadline</p>
                      <p class="font-bold text-sm">{{ formatDeadline(selected()!.deadline) }}</p>
                    </div>
                    <div class="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
                      <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</p>
                      <p class="font-bold">{{ selected()!.category }}</p>
                    </div>
                    <div class="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
                      <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registrations</p>
                      <p class="font-bold">{{ (selected()!.participants||[]).length }} / {{ selected()!.maxParticipants }}</p>
                      <div class="w-full bg-muted rounded-full h-1.5 mt-2">
                        <div class="bg-teal-600 h-1.5 rounded-full transition-all"
                             [style.width.%]="((selected()!.participants||[]).length / (selected()!.maxParticipants||1)) * 100"></div>
                      </div>
                    </div>
                    <div class="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
                      <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Results</p>
                      <div class="flex items-center gap-2">
                        <div [ngClass]="selected()!.resultsPublished ? 'bg-teal-500' : 'bg-muted-foreground'" class="w-2 h-2 rounded-full"></div>
                        <p class="font-bold text-sm">{{ selected()!.resultsPublished ? 'Published' : 'Not published' }}</p>
                      </div>
                      <button (click)="toggleResults()" class="text-xs font-bold text-teal-600 hover:underline mt-1">
                        {{ selected()!.resultsPublished ? 'Unpublish' : 'Publish Results' }}
                      </button>
                    </div>
                  </div>
                  <p class="text-sm text-muted-foreground leading-relaxed">{{ selected()!.description }}</p>
                </div>
              }

              <!-- Participants -->
              @if (activeTab() === 'Participants') {
                <div class="p-6 space-y-4">
                  <div class="flex items-center justify-between mb-2">
                    <p class="font-bold text-sm text-muted-foreground">{{ (selected()!.participants||[]).length }} registered</p>
                    <button (click)="openAddParticipant()" class="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
                      <lucide-icon [name]="Plus" [size]="14"></lucide-icon> Add manually
                    </button>
                  </div>
                  @for (p of (selected()!.participants||[]); track p.id) {
                    <div class="flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-muted/20 transition-all group">
                      <div class="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs shrink-0">{{ p.name.charAt(0) }}</div>
                      <div class="flex-1 min-w-0">
                        <p class="font-bold text-sm truncate">{{ p.name }}</p>
                        <p class="text-xs text-muted-foreground">{{ p.email }}</p>
                      </div>
                      @if (p.score !== undefined) {
                        <span class="font-black text-teal-600 text-sm">{{ p.score }} pts</span>
                      }
                      <select [value]="p.status" (change)="updateParticipantStatus(p, $any($event.target).value)"
                              class="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-border bg-white outline-none cursor-pointer"
                              [ngClass]="{'text-teal-600': p.status==='registered','text-yellow-600': p.status==='winner','text-red-500': p.status==='disqualified'}">
                        <option value="registered">Registered</option>
                        <option value="winner">Winner</option>
                        <option value="disqualified">Disqualified</option>
                      </select>
                      <button (click)="removeParticipant(p.id)" class="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                        <lucide-icon [name]="Trash2" [size]="13"></lucide-icon>
                      </button>
                    </div>
                      <div class="ml-12 flex flex-col gap-1">
                        @if (p.phone || p.motivation) {
                          <div class="flex items-center gap-3 text-xs bg-muted/30 border border-border/50 rounded-xl px-3 py-2">
                             @if (p.phone) {
                               <span class="text-muted-foreground">📞 {{ p.phone }}</span>
                             }
                             @if (p.motivation) {
                               <span class="text-muted-foreground italic line-clamp-1" [title]="p.motivation">💬 "{{ p.motivation }}"</span>
                             }
                          </div>
                        }
                        @if (p.submissionUrl) {
                          <div class="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2">
                            <span class="text-[10px] font-black text-teal-700 uppercase tracking-widest">📎</span>
                            <a [href]="p.submissionUrl" target="_blank"
                               class="text-xs text-teal-600 hover:underline truncate flex-1">{{ p.submissionUrl }}</a>
                            @if (p.submittedAt) {
                              <span class="text-[10px] text-muted-foreground whitespace-nowrap">{{ p.submittedAt | slice:0:10 }}</span>
                            }
                          </div>
                        }
                      </div>
                  } @empty {
                    <p class="text-center text-muted-foreground py-8 text-sm">No participants yet.</p>
                  }
                </div>
              }

              <!-- Leaderboard -->
              @if (activeTab() === 'Leaderboard') {
                <div class="p-6 space-y-3">
                  @for (p of leaderboard(); track p.id; let i = $index) {
                    <div class="flex items-center gap-4 p-4 rounded-2xl"
                         [ngClass]="i===0?'bg-yellow-50 border border-yellow-200':i===1?'bg-gray-50 border border-gray-200':i===2?'bg-orange-50 border border-orange-200':'border border-border'">
                      <div class="w-8 text-center font-black text-lg"
                           [ngClass]="i===0?'text-yellow-500':i===1?'text-gray-400':i===2?'text-orange-400':'text-muted-foreground'">
                        {{ i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1) }}
                      </div>
                      <div class="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs shrink-0">{{ p.name.charAt(0) }}</div>
                      <div class="flex-1">
                        <p class="font-bold text-sm">{{ p.name }}</p>
                        <p class="text-xs text-muted-foreground">{{ p.email }}</p>
                      </div>
                      <div class="text-right">
                        <p class="font-black text-teal-600">{{ p.score ?? '—' }} pts</p>
                        <input type="number" [value]="p.score ?? ''" (change)="setScore(p, $any($event.target).value)"
                               placeholder="Score" class="text-xs w-16 px-2 py-1 rounded-lg border border-border text-center font-medium outline-none focus:ring-2 focus:ring-teal-600/20 mt-1">
                      </div>
                    </div>
                  } @empty {
                    <p class="text-center text-muted-foreground py-8 text-sm">No scored participants yet.</p>
                  }
                </div>
              }

              <!-- Rounds -->
              @if (activeTab() === 'Rounds') {
                <div class="p-6 space-y-4">
                  <button (click)="addRound()" class="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
                    <lucide-icon [name]="Plus" [size]="14"></lucide-icon> Add Round
                  </button>
                  @for (round of (selected()!.rounds||[]); track round.name; let i = $index) {
                    <div class="p-5 rounded-2xl border border-border space-y-3">
                      <div class="flex items-center justify-between">
                        <input [(ngModel)]="round.name" (change)="validateAndSaveRounds()" placeholder="Round name"
                               class="font-bold text-sm bg-transparent outline-none flex-1 focus:bg-muted/30 rounded-lg px-2 py-1">
                        <div class="flex items-center gap-2">
                          <select [(ngModel)]="round.status" (change)="validateAndSaveRounds()"
                                  class="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-border bg-white outline-none"
                                  [ngClass]="{'text-teal-600':round.status==='active','text-muted-foreground':round.status==='pending','text-blue-600':round.status==='done'}">
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="done">Done</option>
                          </select>
                          <button (click)="removeRound(i)" class="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg">
                            <lucide-icon [name]="Trash2" [size]="13"></lucide-icon>
                          </button>
                        </div>
                      </div>
                      <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-1">
                          <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Start</label>
                          <input [(ngModel)]="round.startDate" type="datetime-local" (change)="validateAndSaveRounds()"
                                 [min]="round.status === 'pending' ? todayLocalString() : null"
                                 [ngClass]="{'border-red-500 ring-red-500/10': (round.endDate && round.startDate && round.startDate >= round.endDate) || (round.status === 'pending' && isDateInPast(round.startDate))}"
                                 class="w-full text-sm px-3 py-2 rounded-xl border border-border bg-muted/20 outline-none focus:ring-2 focus:ring-teal-600/20">
                        </div>
                        <div class="space-y-1">
                          <label class="text-[9px] font-black uppercase tracking-widest text-muted-foreground">End</label>
                          <input [(ngModel)]="round.endDate" type="datetime-local" (change)="validateAndSaveRounds()"
                                 [min]="round.startDate || (round.status === 'pending' ? todayLocalString() : null)"
                                 [ngClass]="{'border-red-500 ring-red-500/10': (round.endDate && round.startDate && round.endDate <= round.startDate) || (round.status === 'pending' && isDateInPast(round.endDate))}"
                                 class="w-full text-sm px-3 py-2 rounded-xl border border-border bg-muted/20 outline-none focus:ring-2 focus:ring-teal-600/20">
                        </div>
                      </div>
                      @if (round.endDate && round.startDate && round.endDate <= round.startDate) {
                        <p class="text-[10px] text-red-500 font-bold px-1">End time must be after start time.</p>
                      } @else if (round.status === 'pending' && (isDateInPast(round.startDate) || isDateInPast(round.endDate))) {
                        <p class="text-[10px] text-red-500 font-bold px-1">Round dates cannot be in the past.</p>
                      }
                    </div>
                  } @empty {
                    <p class="text-center text-muted-foreground py-8 text-sm">No rounds defined yet.</p>
                  }
                </div>
              }

              <!-- Rules -->
              @if (activeTab() === 'Rules') {
                <div class="p-6 space-y-4">
                  <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Competition Rules</label>
                  <textarea [(ngModel)]="rulesText" rows="10" placeholder="Enter rules, one per line…"
                            class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 font-medium text-sm focus:ring-2 focus:ring-teal-600/20 outline-none resize-none leading-relaxed"></textarea>
                  <button (click)="saveRules()" class="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-teal-600/20 active:scale-95">
                    Save Rules
                  </button>
                </div>
              }

              <!-- News Feed (Admin) -->
              @if (activeTab() === 'News') {
                <div class="p-6 space-y-6">

                  <!-- Post form -->
                  <div class="bg-muted/30 rounded-2xl border border-border p-5 space-y-3">
                    <p class="text-xs font-black uppercase tracking-widest text-muted-foreground">New Announcement</p>
                    <input [(ngModel)]="newAnnouncementTitle" placeholder="Title *"
                           class="w-full px-4 py-3 rounded-xl border border-border bg-white font-medium text-sm focus:ring-2 focus:ring-teal-600/20 outline-none">
                    <textarea [(ngModel)]="newAnnouncementContent" rows="3" placeholder="Content *"
                              class="w-full px-4 py-3 rounded-xl border border-border bg-white font-medium text-sm focus:ring-2 focus:ring-teal-600/20 outline-none resize-none"></textarea>
                    <div class="flex items-center gap-3 flex-wrap">
                      <select [(ngModel)]="newAnnouncementType"
                              class="px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-teal-600/20">
                        <option value="INFO">ℹ️ Info</option>
                        <option value="REMINDER">⏰ Reminder</option>
                        <option value="RESULT">🏆 Result</option>
                        <option value="ALERT">🚨 Alert</option>
                      </select>
                      <button (click)="postAnnouncement()"
                              [disabled]="!newAnnouncementTitle || !newAnnouncementContent || isPostingAnnouncement()"
                              class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all active:scale-95">
                        {{ isPostingAnnouncement() ? 'Posting…' : 'Post' }}
                      </button>
                    </div>
                  </div>

                  <!-- Existing announcements -->
                  @if (competitionAnnouncements().length === 0) {
                    <p class="text-center text-muted-foreground py-8 text-sm">No announcements posted yet.</p>
                  }
                  <div class="space-y-3">
                    @for (a of competitionAnnouncements(); track a.id) {
                      <div class="flex gap-3 p-4 rounded-2xl border"
                           [ngClass]="{
                             'bg-blue-50 border-blue-200':    a.type === 'INFO',
                             'bg-yellow-50 border-yellow-200': a.type === 'REMINDER',
                             'bg-teal-50 border-teal-200':    a.type === 'RESULT',
                             'bg-red-50 border-red-200':      a.type === 'ALERT'
                           }">
                        <span class="text-xl shrink-0">{{ a.type === 'INFO' ? 'ℹ️' : a.type === 'REMINDER' ? '⏰' : a.type === 'RESULT' ? '🏆' : '🚨' }}</span>
                        <div class="flex-1">
                          <p class="font-black text-sm">{{ a.title }}</p>
                          <p class="text-xs text-foreground/70 mt-1">{{ a.content }}</p>
                          <p class="text-[10px] text-muted-foreground mt-1.5">{{ a.createdAt | date:'MMM d, y · HH:mm' }}</p>
                        </div>
                        <button (click)="deleteAnnouncement(a.id)" class="p-1.5 hover:bg-red-100 hover:text-red-500 rounded-lg transition-colors">
                          <lucide-icon [name]="Trash2" [size]="13"></lucide-icon>
                        </button>
                      </div>
                    }
                  </div>

                </div>
              }

            </div>
          } @else {
            <div class="h-80 bg-white rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <lucide-icon [name]="Trophy" [size]="40" class="opacity-20"></lucide-icon>
              <p class="font-bold">Select a competition to manage it</p>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Add Participant Modal -->
    @if (showParticipantModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="showParticipantModal.set(false)"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 space-y-5 border border-border">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-lg">Add Participant</h3>
            <button (click)="showParticipantModal.set(false)" class="p-2 hover:bg-muted rounded-xl">
              <lucide-icon [name]="X" [size]="18"></lucide-icon>
            </button>
          </div>
          <div class="space-y-3">
            <input [(ngModel)]="newParticipantName" placeholder="Full name *"
                   class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
            <input [(ngModel)]="newParticipantEmail" placeholder="Email address *"
                   class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
            <input [(ngModel)]="newParticipantPhone" placeholder="Phone number"
                   class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
            <textarea [(ngModel)]="newParticipantMotivation" placeholder="Motivation..." rows="2"
                   class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none resize-none"></textarea>
          </div>
          <div class="flex gap-3">
            <button (click)="addParticipant()" [disabled]="!newParticipantName || !newParticipantEmail"
                    class="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all active:scale-95">Add</button>
            <button (click)="showParticipantModal.set(false)" class="px-5 py-3 border border-border rounded-2xl font-bold hover:bg-muted">Cancel</button>
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
            <h2 class="text-xl font-bold">{{ isEditing() ? 'Edit Competition' : 'New Competition' }}</h2>
            <button (click)="closeModal()" class="p-2 rounded-xl hover:bg-muted"><lucide-icon [name]="X" [size]="20"></lucide-icon></button>
          </div>
          <form (ngSubmit)="save()" class="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Title *</label>
              <input [(ngModel)]="form.title" name="title" required placeholder="Competition name"
                     [ngClass]="{'border-red-500 ring-red-500/10': form.title && form.title.length < 5}"
                     class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
              @if (form.title && form.title.length < 5) {
                <p class="text-[10px] text-red-500 font-bold px-1">Title must be at least 5 characters.</p>
              }
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Description *</label>
              <textarea [(ngModel)]="form.description" name="description" rows="2" placeholder="Brief description…"
                        [ngClass]="{'border-red-500 ring-red-500/10': form.description && form.description.length < 20}"
                        class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none resize-none"></textarea>
              @if (form.description && form.description.length < 20) {
                <p class="text-[10px] text-red-500 font-bold px-1">Description must be at least 20 characters.</p>
              }
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Category *</label>
                <select [(ngModel)]="form.category" name="category" required
                        class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
                  <option value="" disabled selected>Select a category</option>
                  <option value="Speaking">🗣️ Speaking</option>
                  <option value="Skills Test">🛠️ Skills Test</option>
                  <option value="Thinking">🧠 Thinking</option>
                  <option value="Coding">💻 Coding</option>
                  <option value="Design">🎨 Design</option>
                  <option value="Debate">⚖️ Debate</option>
                  <option value="Science">🔬 Science</option>
                  <option value="Math">📐 Math</option>
                  <option value="Writing">✍️ Writing</option>
                  <option value="Innovation">🚀 Innovation</option>
                  <option value="Robotics">🤖 Robotics</option>
                  <option value="Arts & Crafts">🎭 Arts & Crafts</option>
                  <option value="Business">💼 Business & Pitching</option>
                  <option value="Other">✨ Other</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Status *</label>
                <select [(ngModel)]="form.status" name="status"
                        class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Start Date &amp; Time *
                </label>
                <input [(ngModel)]="form.startDate" name="startDate" required type="datetime-local"
                       [min]="!isEditing() ? todayLocalString() : null"
                       [ngClass]="{'border-red-500 ring-red-500/10': form.startDate && !isEditing() && isDateInPast(form.startDate)}"
                       class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
                @if (form.startDate && !isEditing() && isDateInPast(form.startDate)) {
                  <p class="text-[10px] text-red-500 font-bold px-1">Start date cannot be in the past.</p>
                }
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  End Date (Deadline) *
                </label>
                <input [(ngModel)]="form.deadline" name="deadline" required type="datetime-local"
                       [min]="form.startDate || (!isEditing() ? todayLocalString() : null)"
                       [ngClass]="{'border-red-500 ring-red-500/10': !isDeadlineValid()}"
                       class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
                @if (form.deadline && form.startDate && form.deadline <= form.startDate) {
                  <p class="text-[10px] text-red-500 font-bold px-1">Deadline must be after start date.</p>
                } @else if (form.deadline && !isEditing() && isDateInPast(form.deadline)) {
                  <p class="text-[10px] text-red-500 font-bold px-1">Deadline cannot be in the past.</p>
                }
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Prize *</label>
                <input [(ngModel)]="form.prize" name="prize" required placeholder="e.g. $5,000 + Scholarship"
                       class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Max Participants</label>
                <input [(ngModel)]="form.maxParticipants" name="maxParticipants" type="number" placeholder="50"
                       [ngClass]="{'border-red-500 ring-red-500/10': form.maxParticipants && form.maxParticipants < 1}"
                       class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
                @if (form.maxParticipants && form.maxParticipants < 1) {
                  <p class="text-[10px] text-red-500 font-bold px-1">Minimum 1 participant.</p>
                }
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Tags</label>
              <input [(ngModel)]="tagsInputString" name="tags"
                     placeholder="speaking, fluency"
                     class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase tracking-widest text-muted-foreground">Image URL</label>
              <input [(ngModel)]="form.image" name="image" placeholder="/images/event-1.jpg"
                     class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 font-medium focus:ring-2 focus:ring-teal-600/20 outline-none">
            </div>
            <div class="flex gap-3 pt-4 border-t border-border">
              <button type="submit" [disabled]="!isFormValid()"
                      class="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-lg shadow-teal-600/20 active:scale-95">
                {{ isEditing() ? 'Save Changes' : 'Create' }}
              </button>
              <button type="button" (click)="closeModal()" class="px-6 py-3 border border-border rounded-2xl font-bold hover:bg-muted">Cancel</button>
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
            <h3 class="text-xl font-bold mb-2">Delete Competition?</h3>
            <p class="text-muted-foreground text-sm">"<strong>{{ deleteTarget()!.title }}</strong>" will be permanently removed.</p>
          </div>
          <div class="flex gap-3">
            <button (click)="doDelete()" class="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all active:scale-95">Delete</button>
            <button (click)="deleteTarget.set(null)" class="flex-1 py-3 border border-border rounded-2xl font-bold hover:bg-muted">Cancel</button>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminCompetitionsComponent implements OnInit, OnDestroy {
  data = inject(DataService);

  readonly Trophy = Trophy; readonly Plus = Plus; readonly Search = Search;
  readonly Pencil = Pencil; readonly Trash2 = Trash2; readonly X = X;
  readonly CheckCircle2 = CheckCircle2; readonly Clock = Clock;
  readonly AlertTriangle = AlertTriangle; readonly Users = Users;
  readonly Tag = Tag; readonly Medal = Medal; readonly Star = Star; readonly Flag = Flag;

  tabs = ['Overview', 'Participants', 'Leaderboard', 'Rounds', 'Rules', 'News'];
  activeTab    = signal('Overview');
  selected     = signal<Competition | null>(null);
  searchQuery  = '';
  showModal    = signal(false);
  isEditing    = signal(false);
  editId       = signal<number | string | null>(null);
  deleteTarget = signal<Competition | null>(null);
  showParticipantModal = signal(false);
  newParticipantName  = '';
  newParticipantEmail = '';
  newParticipantPhone = '';
  newParticipantMotivation = '';
  rulesText = '';
  tagsInputString = '';
  form: Omit<Competition, 'id'> = EMPTY_COMP();

  // News Feed
  competitionAnnouncements = signal<Announcement[]>([]);
  newAnnouncementTitle   = '';
  newAnnouncementContent = '';
  newAnnouncementType    = 'INFO';
  isPostingAnnouncement  = signal(false);

  countdown = signal<{ label: string; value: string }[]>([]);
  private countdownInterval?: ReturnType<typeof setInterval>;

  stats = computed(() => {
    const all = this.data.competitions();
    const totalP = all.reduce((s, c) => s + (c.participants?.length ?? 0), 0);
    return [
      { label: 'Total',        value: all.length,                                  bg: 'bg-teal-50',   color: 'text-teal-600',   icon: this.Trophy },
      { label: 'Ongoing',      value: all.filter(c => c.status === 'ongoing').length, bg: 'bg-teal-50',   color: 'text-teal-600',   icon: this.CheckCircle2 },
      { label: 'Upcoming',     value: all.filter(c => c.status === 'upcoming').length, bg: 'bg-orange-50', color: 'text-orange-500', icon: this.Clock },
      { label: 'Participants', value: totalP,                                       bg: 'bg-purple-50', color: 'text-purple-600', icon: this.Users },
    ];
  });

  leaderboard = computed(() =>
    [...(this.selected()?.participants ?? [])]
      .filter(p => p.status !== 'disqualified')
      .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
  );

  ngOnInit() {}
  ngOnDestroy() { clearInterval(this.countdownInterval); }

  filtered() {
    const q = this.searchQuery.toLowerCase();
    return q
      ? this.data.competitions().filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
      : this.data.competitions();
  }

  select(comp: Competition) {
    this.selected.set(comp);
    this.activeTab.set('Overview');
    this.rulesText = comp.rules ?? '';
    this.startCountdown(comp.deadline);
    this.loadAnnouncements(comp.id);
  }

  loadAnnouncements(competitionId: number | string) {
    if (Number(competitionId) > 9_999_999_999) return;
    this.data.getAnnouncements(competitionId).subscribe(list => {
      this.competitionAnnouncements.set(list);
    });
  }

  private startCountdown(deadlineStr: string) {
    clearInterval(this.countdownInterval);
    if (!deadlineStr) { this.countdown.set([]); return; }
    const tick = () => {
      const diff = new Date(deadlineStr).getTime() - Date.now();
      if (diff <= 0 || isNaN(diff)) {
        this.countdown.set([{label:'Days',value:'00'},{label:'Hrs',value:'00'},{label:'Min',value:'00'},{label:'Sec',value:'00'}]);
        return;
      }
      const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
      this.countdown.set([
        { label: 'Days', value: pad(diff / 86400000) },
        { label: 'Hrs',  value: pad((diff % 86400000) / 3600000) },
        { label: 'Min',  value: pad((diff % 3600000) / 60000) },
        { label: 'Sec',  value: pad((diff % 60000) / 1000) },
      ]);
    };
    tick();
    this.countdownInterval = setInterval(tick, 1000);
  }

  formatDeadline(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  miniCountdown(iso: string): string {
    if (!iso) return '';
    const diff = new Date(iso).getTime() - Date.now();
    if (diff <= 0) return 'Closed';
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d left`;
    const hrs = Math.floor(diff / 3600000);
    if (hrs > 0) return `${hrs}h left`;
    return `${Math.floor(diff / 60000)}min left`;
  }

  // ── CRUD ──
  openCreate() { this.form = EMPTY_COMP(); this.tagsInputString = ''; this.isEditing.set(false); this.editId.set(null); this.showModal.set(true); }
  openEdit(comp: Competition) {
    const { id, ...rest } = comp;
    this.form = { ...rest, tags: [...(rest.tags??[])], participants: [...(rest.participants??[])], rounds: [...(rest.rounds??[])] };
    this.tagsInputString = (this.form.tags || []).join(', ');
    this.editId.set(id); this.isEditing.set(true); this.showModal.set(true);
  }
  closeModal() { this.showModal.set(false); }

  isDateInPast(iso: string) {
    if (!iso) return false;
    return new Date(iso).getTime() < Date.now();
  }

  todayLocalString() {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().slice(0, 16);
  }

  isDeadlineValid() {
    if (!this.form.deadline) return false;
    if (this.form.startDate && this.form.deadline <= this.form.startDate) return false;
    if (!this.isEditing() && this.isDateInPast(this.form.deadline)) return false;
    return true;
  }

  isFormValid() {
    return this.form.title && this.form.title.length >= 5 &&
           this.form.description && this.form.description.length >= 20 &&
           this.form.prize &&
           this.form.startDate &&
           (this.isEditing() || !this.isDateInPast(this.form.startDate)) &&
           this.isDeadlineValid() &&
           (!this.form.maxParticipants || this.form.maxParticipants >= 1);
  }

  save() {
    this.form.tags = this.tagsInputString.split(',').map(t => t.trim()).filter(Boolean);
    if (!this.isFormValid()) return;
    if (!this.form.slug)
      this.form.slug = this.form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (this.isEditing() && this.editId() !== null) {
      const updated = { id: this.editId()!, ...this.form };
      this.data.updateCompetition(updated);
      this.selected.set(updated);
      this.startCountdown(updated.deadline);
    } else {
      this.data.addCompetition({ id: Date.now(), ...this.form });
    }
    this.closeModal();
  }

  confirmDelete(comp: Competition) { this.deleteTarget.set(comp); }
  doDelete() {
    if (!this.deleteTarget()) return;
    if (this.selected()?.id === this.deleteTarget()!.id) { this.selected.set(null); clearInterval(this.countdownInterval); }
    this.data.deleteCompetition(this.deleteTarget()!.id);
    this.deleteTarget.set(null);
  }

  toggleResults() {
    if (!this.selected()) return;
    const updated = { ...this.selected()!, resultsPublished: !this.selected()!.resultsPublished };
    this.data.updateCompetition(updated); this.selected.set(updated);
  }

  // ── Participants ──
  openAddParticipant() {
    this.newParticipantName = '';
    this.newParticipantEmail = '';
    this.newParticipantPhone = '';
    this.newParticipantMotivation = '';
    this.showParticipantModal.set(true);
  }
  addParticipant() {
    if (!this.selected() || !this.newParticipantName || !this.newParticipantEmail) return;
    const newP: Participant = {
      id: Date.now(),
      name: this.newParticipantName,
      email: this.newParticipantEmail,
      phone: this.newParticipantPhone,
      motivation: this.newParticipantMotivation,
      registeredAt: new Date().toISOString().slice(0,10),
      status: 'registered'
    };
    const updated = { ...this.selected()!, participants: [...(this.selected()!.participants??[]), newP] };
    this.data.updateCompetition(updated); this.selected.set(updated);
    this.showParticipantModal.set(false);
  }
  updateParticipantStatus(p: Participant, status: Participant['status']) {
    if (!this.selected()) return;
    const participants = (this.selected()!.participants??[]).map(x => x.id === p.id ? { ...x, status } : x);
    const updated = { ...this.selected()!, participants };
    this.data.updateCompetition(updated); this.selected.set(updated);
  }
  removeParticipant(id: number | string) {
    if (!this.selected()) return;
    const participants = (this.selected()!.participants??[]).filter(p => p.id !== id);
    const updated = { ...this.selected()!, participants };
    this.data.updateCompetition(updated); this.selected.set(updated);
  }
  setScore(p: Participant, value: string) {
    const score = parseInt(value, 10);
    if (isNaN(score) || !this.selected()) return;
    const participants = (this.selected()!.participants??[]).map(x => x.id === p.id ? { ...x, score } : x);
    const updated = { ...this.selected()!, participants };
    this.data.updateCompetition(updated); this.selected.set(updated);
  }

  // ── Rounds ──
  addRound() {
    if (!this.selected()) return;
    const rounds: CompetitionRound[] = [...(this.selected()!.rounds??[]), { name: 'New Round', startDate: '', endDate: '', status: 'pending' }];
    const updated = { ...this.selected()!, rounds };
    this.data.updateCompetition(updated); this.selected.set(updated);
  }
  removeRound(index: number) {
    if (!this.selected()) return;
    const rounds = (this.selected()!.rounds??[]).filter((_,i) => i !== index);
    const updated = { ...this.selected()!, rounds };
    this.data.updateCompetition(updated); this.selected.set(updated);
  }
  validateAndSaveRounds() {
    if (!this.selected()) return;
    let hasInvalid = false;
    this.selected()!.rounds?.forEach(r => {
      if (r.status === 'pending') {
        if (this.isDateInPast(r.startDate)) { r.startDate = ''; hasInvalid = true; }
        if (this.isDateInPast(r.endDate)) { r.endDate = ''; hasInvalid = true; }
      }
      if (r.startDate && r.endDate && r.startDate >= r.endDate) {
        r.endDate = ''; hasInvalid = true;
      }
    });
    if (!hasInvalid) {
      this.data.updateCompetition({ ...this.selected()! });
    }
  }
  saveRules() {
    if (!this.selected()) return;
    const updated = { ...this.selected()!, rules: this.rulesText };
    this.data.updateCompetition(updated); this.selected.set(updated);
  }

  // ── News Feed ──
  postAnnouncement() {
    const comp = this.selected();
    if (!comp || !this.newAnnouncementTitle || !this.newAnnouncementContent) return;
    this.isPostingAnnouncement.set(true);
    this.data.postAnnouncement(comp.id, this.newAnnouncementTitle, this.newAnnouncementContent, this.newAnnouncementType)
      .subscribe(res => {
        this.isPostingAnnouncement.set(false);
        if (res) {
          this.competitionAnnouncements.update(list => [res, ...list]);
          this.newAnnouncementTitle   = '';
          this.newAnnouncementContent = '';
          this.newAnnouncementType    = 'INFO';
        }
      });
  }

  deleteAnnouncement(id: number) {
    this.data.deleteAnnouncement(id).subscribe(() => {
      this.competitionAnnouncements.update(list => list.filter(a => a.id !== id));
    });
  }
}
