import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Trophy, Calendar, ArrowRight, Filter, ThumbsUp, ThumbsDown, BarChart3, Star, Dna, Zap, Brain, CheckCircle2, Target, Award, XCircle, CheckCircle, BookOpen, Flame } from 'lucide-angular';
import { DataService, CompetitionRanking, Competition, RecommendationProfile, Exercise, ExerciseTask, Training } from '../services/data.service';

type Tab = 'all' | 'ranking' | 'recommended';

interface PracticeState {
  exercise: Exercise;
  currentTask: number;
  selectedAnswers: (number | null)[];
  confirmed: boolean[];
  finished: boolean;
  score: number;
}

@Component({
    selector: 'app-competitions',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
    template: `

    <!-- ── PRACTICE MODAL ──────────────────────────────────────────────── -->
    @if (practice()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="backdrop-filter:blur(8px); background:rgba(0,0,0,0.65);">
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-slideUp flex flex-col" style="max-height:90vh;">

          <!-- Modal Header -->
          <div class="px-8 py-6 flex items-start justify-between border-b border-border shrink-0"
               [style.background]="practice()!.finished ? 'linear-gradient(135deg,#0d9488,#0f766e)' : 'linear-gradient(135deg,#f97316,#ea580c)'">
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">Practice Session</p>
              <h2 class="text-xl font-black text-white">{{ practice()!.exercise.title }}</h2>
              <div class="flex items-center gap-3 mt-2">
                <span class="text-white/80 text-xs font-bold">{{ practice()!.exercise.estimatedMinutes }} min</span>
                <span class="w-1 h-1 bg-white/40 rounded-full"></span>
                <span class="text-white/80 text-xs font-bold">{{ practice()!.exercise.tasks.length }} questions</span>
                <span class="w-1 h-1 bg-white/40 rounded-full"></span>
                <span class="text-yellow-300 text-xs font-black">+{{ practice()!.exercise.points }} pts</span>
              </div>
            </div>
            <button (click)="closePractice()" class="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all shrink-0 ml-4">
              <lucide-icon [name]="XCircle" [size]="20" class="text-white"></lucide-icon>
            </button>
          </div>

          <!-- Progress bar -->
          @if (!practice()!.finished) {
            <div class="h-1.5 bg-border shrink-0">
              <div class="h-full bg-orange-500 transition-all duration-500 rounded-r-full"
                   [style.width]="((practice()!.currentTask + (practice()!.confirmed[practice()!.currentTask] ? 1 : 0)) / practice()!.exercise.tasks.length * 100) + '%'">
              </div>
            </div>
          }

          <!-- Modal Body (scrollable) -->
          <div class="overflow-y-auto flex-1 p-8">

            @if (practice()!.finished) {
              <!-- ── RESULTS SCREEN ── -->
              <div class="text-center space-y-6 py-4">
                <div class="w-28 h-28 rounded-full mx-auto flex items-center justify-center text-5xl shadow-lg"
                     [style.background]="practice()!.score >= 75 ? 'linear-gradient(135deg,#0d9488,#0f766e)' : 'linear-gradient(135deg,#f97316,#ea580c)'">
                  {{ practice()!.score >= 75 ? '🏆' : practice()!.score >= 50 ? '📈' : '💪' }}
                </div>
                <div>
                  <p class="text-5xl font-black" [class]="practice()!.score >= 75 ? 'text-teal-600' : 'text-orange-500'">{{ practice()!.score }}%</p>
                  <p class="text-muted-foreground font-bold mt-1">
                    {{ practice()!.score >= 75 ? 'Excellent! You mastered this topic.' : practice()!.score >= 50 ? 'Good effort — keep practicing!' : 'Keep going — every practice counts!' }}
                  </p>
                </div>
                <div class="grid grid-cols-3 gap-4 mt-4">
                  <div class="bg-teal-50 rounded-2xl p-4">
                    <p class="text-2xl font-black text-teal-600">{{ practice()!.selectedAnswers.filter((a, i) => a === practice()!.exercise.tasks[i].correctIndex).length }}</p>
                    <p class="text-xs font-bold text-teal-700 mt-1">Correct</p>
                  </div>
                  <div class="bg-red-50 rounded-2xl p-4">
                    <p class="text-2xl font-black text-red-500">{{ practice()!.exercise.tasks.length - practice()!.selectedAnswers.filter((a, i) => a === practice()!.exercise.tasks[i].correctIndex).length }}</p>
                    <p class="text-xs font-bold text-red-600 mt-1">Incorrect</p>
                  </div>
                  <div class="bg-amber-50 rounded-2xl p-4">
                    <p class="text-2xl font-black text-amber-600">+{{ practice()!.exercise.points }}</p>
                    <p class="text-xs font-bold text-amber-700 mt-1">Points Earned</p>
                  </div>
                </div>

                <!-- Answer review -->
                <div class="space-y-3 text-left mt-4">
                  @for (task of practice()!.exercise.tasks; track task.question; let i = $index) {
                    <div class="rounded-2xl border p-4 text-sm" [class]="practice()!.selectedAnswers[i] === task.correctIndex ? 'border-teal-200 bg-teal-50' : 'border-red-200 bg-red-50'">
                      <p class="font-bold mb-1">{{ i + 1 }}. {{ task.question }}</p>
                      <p [class]="practice()!.selectedAnswers[i] === task.correctIndex ? 'text-teal-700' : 'text-red-600'" class="text-xs font-bold">
                        {{ practice()!.selectedAnswers[i] === task.correctIndex ? '✅ Correct' : '❌ Wrong — Correct: ' + task.options[task.correctIndex] }}
                      </p>
                      <p class="text-xs text-muted-foreground italic mt-1">{{ task.explanation }}</p>
                    </div>
                  }
                </div>

                <button (click)="closePractice()" class="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black transition-all mt-4">
                  Done — Back to Dashboard
                </button>
              </div>

            } @else {
              <!-- ── QUESTION SCREEN ── -->
              @let task = practice()!.exercise.tasks[practice()!.currentTask];
              @let confirmed = practice()!.confirmed[practice()!.currentTask];
              @let selected = practice()!.selectedAnswers[practice()!.currentTask];

              <div class="space-y-6">
                <div class="flex items-center justify-between text-xs font-black text-muted-foreground uppercase tracking-widest">
                  <span>Question {{ practice()!.currentTask + 1 }} / {{ practice()!.exercise.tasks.length }}</span>
                  <span class="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">{{ practice()!.exercise.category }}</span>
                </div>

                <p class="text-xl font-black text-foreground leading-relaxed">{{ task.question }}</p>

                <div class="space-y-3">
                  @for (opt of task.options; track opt; let oi = $index) {
                    <button
                      (click)="selectAnswer(oi)"
                      [disabled]="confirmed"
                      [ngClass]="{
                        'border-orange-500 bg-orange-50 text-orange-700': !confirmed && selected === oi,
                        'border-teal-500 bg-teal-50 text-teal-700': confirmed && oi === task.correctIndex,
                        'border-red-400 bg-red-50 text-red-600': confirmed && selected === oi && oi !== task.correctIndex,
                        'border-border text-foreground hover:border-orange-300 hover:bg-orange-50/50': !confirmed && selected !== oi
                      }"
                      class="w-full text-left px-5 py-4 border-2 rounded-2xl font-bold text-sm transition-all disabled:cursor-default">
                      <span class="inline-block w-6 h-6 rounded-lg border-2 mr-3 text-center text-xs leading-5 font-black shrink-0"
                            [ngClass]="{
                              'border-orange-500 bg-orange-500 text-white': !confirmed && selected === oi,
                              'border-teal-500 bg-teal-500 text-white': confirmed && oi === task.correctIndex,
                              'border-red-400 bg-red-400 text-white': confirmed && selected === oi && oi !== task.correctIndex,
                              'border-current': !(confirmed && oi === task.correctIndex) && !(!confirmed && selected === oi) && !(confirmed && selected === oi && oi !== task.correctIndex)
                            }">
                        {{ ['A','B','C','D'][oi] }}
                      </span>
                      {{ opt }}
                    </button>
                  }
                </div>

                @if (confirmed) {
                  <div class="rounded-2xl p-4 text-sm font-medium" [class]="selected === task.correctIndex ? 'bg-teal-50 border border-teal-200 text-teal-800' : 'bg-amber-50 border border-amber-200 text-amber-800'">
                    <p class="font-black mb-1">{{ selected === task.correctIndex ? '✅ Correct!' : '💡 Not quite — here\'s why:' }}</p>
                    <p class="text-xs leading-relaxed">{{ task.explanation }}</p>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Modal Footer -->
          @if (!practice()!.finished) {
            <div class="px-8 py-5 border-t border-border flex items-center justify-between shrink-0">
              @if (!practice()!.confirmed[practice()!.currentTask]) {
                <button (click)="confirmAnswer()" [disabled]="practice()!.selectedAnswers[practice()!.currentTask] === null"
                        class="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-2xl font-black transition-all">
                  Confirm Answer
                </button>
              } @else if (practice()!.currentTask < practice()!.exercise.tasks.length - 1) {
                <button (click)="nextTask()" class="px-8 py-3 bg-foreground text-background hover:opacity-80 rounded-2xl font-black transition-all flex items-center gap-2">
                  Next Question <lucide-icon [name]="ArrowRight" [size]="16"></lucide-icon>
                </button>
              } @else {
                <button (click)="finishPractice()" class="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black transition-all flex items-center gap-2">
                  <lucide-icon [name]="Award" [size]="16"></lucide-icon>
                  See Results
                </button>
              }
              <span class="text-xs text-muted-foreground font-bold">
                {{ practice()!.confirmed.filter(b => b).length }} / {{ practice()!.exercise.tasks.length }} answered
              </span>
            </div>
          }

        </div>
      </div>
    }

    <!-- ── COURSE PREVIEW MODAL ───────────────────────────── -->
    @if (previewTraining()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4" style="backdrop-filter:blur(8px); background:rgba(0,0,0,0.70);">
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col" style="max-height:92vh;animation:slideUp 0.3s ease-out">

          <!-- Image Header -->
          <div class="relative h-56 overflow-hidden shrink-0">
            <img [src]="previewTraining()!.image" class="w-full h-full object-cover">
            <div class="absolute inset-0" style="background:linear-gradient(to top,rgba(0,0,0,0.85),transparent)"></div>
            <button (click)="previewTraining.set(null)"
                    class="absolute top-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
                    style="background:rgba(255,255,255,0.2)">
              <lucide-icon [name]="XCircle" [size]="22" class="text-white"></lucide-icon>
            </button>
            <div class="absolute bottom-4 left-6 right-6">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white" style="background:#7c3aed">Course</span>
                <span class="px-2 py-1 rounded-full text-[9px] font-black uppercase text-white" style="background:rgba(255,255,255,0.2)">{{ previewTraining()!.level }}</span>
                @if (previewTraining()!.category) {
                  <span class="px-2 py-1 rounded-full text-[9px] font-black uppercase text-white" style="background:rgba(13,148,136,0.8)">{{ previewTraining()!.category }}</span>
                }
              </div>
              <h2 class="text-xl font-black text-white leading-tight">{{ previewTraining()!.title }}</h2>
            </div>
          </div>

          <!-- Body -->
          <div class="overflow-y-auto flex-1 p-7 space-y-5">

            <!-- Description -->
            <p class="text-muted-foreground text-sm leading-relaxed">{{ previewTraining()!.description }}</p>

            <!-- AI Match Score -->
            @if (previewTraining()!.aiScore) {
              <div class="flex items-center gap-3 p-4 rounded-2xl" style="background:linear-gradient(135deg,#f0fdfa,#e6fffa);border:1px solid #99f6e4">
                <div class="text-2xl">🧠</div>
                <div>
                  <p class="font-black text-sm text-teal-700">AI Relevance Score: {{ previewTraining()!.aiScore }}/100</p>
                  <p class="text-xs text-teal-600">This course is strongly matched to your competition history and current level.</p>
                </div>
              </div>
            }

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-2xl p-4" style="background:#f8fafc;border:1px solid #e2e8f0">
                <p class="text-[10px] font-black uppercase tracking-widest" style="color:#94a3b8">Instructor</p>
                <p class="font-bold mt-1 text-sm">{{ previewTraining()!.instructor ?? 'Expert Instructor' }}</p>
              </div>
              <div class="rounded-2xl p-4" style="background:#f8fafc;border:1px solid #e2e8f0">
                <p class="text-[10px] font-black uppercase tracking-widest" style="color:#94a3b8">Duration</p>
                <p class="font-bold mt-1 text-sm">{{ previewTraining()!.duration ?? 'Self-paced' }}</p>
              </div>
              <div class="rounded-2xl p-4" style="background:#f8fafc;border:1px solid #e2e8f0">
                <p class="text-[10px] font-black uppercase tracking-widest" style="color:#94a3b8">Chapters</p>
                <p class="font-bold mt-1 text-sm">{{ previewTraining()!.chapters ?? '—' }} chapters</p>
              </div>
              <div class="rounded-2xl p-4 text-white" style="background:linear-gradient(135deg,#7c3aed,#6d28d9)">
                <p class="text-[10px] font-black uppercase tracking-widest" style="color:rgba(221,214,254,0.8)">Price</p>
                <p class="font-black text-xl mt-1">{{ previewTraining()!.price }} TND</p>
              </div>
            </div>

            <!-- What You'll Learn -->
            <div class="rounded-2xl p-5" style="background:#faf5ff;border:1px solid #e9d5ff">
              <p class="font-black text-sm text-purple-700 mb-3">🎯 What you'll gain</p>
              <div class="space-y-2">
                <div class="flex items-start gap-2 text-sm text-purple-800">
                  <span class="text-green-500 font-black shrink-0">✓</span>
                  <span>Deep understanding of {{ previewTraining()!.category ?? previewTraining()!.title.split(':')[0] }} fundamentals and advanced techniques</span>
                </div>
                <div class="flex items-start gap-2 text-sm text-purple-800">
                  <span class="text-green-500 font-black shrink-0">✓</span>
                  <span>Competition-ready practice problems and real-world applications</span>
                </div>
                <div class="flex items-start gap-2 text-sm text-purple-800">
                  <span class="text-green-500 font-black shrink-0">✓</span>
                  <span>Certificate of completion upon finishing {{ previewTraining()!.chapters ?? 'all' }} chapters</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="px-7 py-5 border-t border-border flex gap-3 shrink-0">
            <button (click)="previewTraining.set(null)"
                    class="px-5 py-3 rounded-2xl font-bold text-sm border-2 border-border hover:bg-muted/30 transition-all">
              Close
            </button>
            <a [routerLink]="['/trainings', previewTraining()!.slug]"
               (click)="previewTraining.set(null)"
               class="flex-1 py-3 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all"
               style="background:linear-gradient(135deg,#7c3aed,#6d28d9)">
              Enroll Now — {{ previewTraining()!.price }} TND
              <lucide-icon [name]="ArrowRight" [size]="16"></lucide-icon>
            </a>
          </div>

        </div>
      </div>
    }

    <!-- ── MAIN PAGE ──────────────────────────────────────────────── -->
    <div class="min-h-screen bg-background pb-20 pt-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div class="space-y-4 max-w-2xl">
            <h1 class="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Global <span class="text-teal-600 underline underline-offset-8 decoration-4">Competitions</span>
            </h1>
            <p class="text-lg text-muted-foreground leading-relaxed">
              Test your skills, compete with the best, and win life-changing prizes.
            </p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-border">
          <div class="flex items-center gap-2">
            <button (click)="activeTab.set('all')"
                    [ngClass]="activeTab() === 'all'
                      ? 'border-b-2 border-teal-600 text-teal-600'
                      : 'text-muted-foreground hover:text-foreground'"
                    class="flex items-center gap-2 px-5 py-3 font-bold text-sm transition-all -mb-px">
              <lucide-icon [name]="Trophy" [size]="16"></lucide-icon>
              All Competitions
            </button>
            <button (click)="loadRanking()"
                    [ngClass]="activeTab() === 'ranking'
                      ? 'border-b-2 border-teal-600 text-teal-600'
                      : 'text-muted-foreground hover:text-foreground'"
                    class="flex items-center gap-2 px-5 py-3 font-bold text-sm transition-all -mb-px">
              <lucide-icon [name]="BarChart3" [size]="16"></lucide-icon>
              Popularity Ranking
            </button>
            <button (click)="activeTab.set('recommended')"
                    [ngClass]="activeTab() === 'recommended'
                      ? 'border-b-2 border-teal-600 text-teal-600'
                      : 'text-muted-foreground hover:text-foreground'"
                    class="flex items-center gap-2 px-5 py-3 font-bold text-sm transition-all -mb-px">
              <lucide-icon [name]="Dna" [size]="16"></lucide-icon>
              AI Recommended
            </button>
          </div>

          @if (activeTab() === 'all') {
            <div class="flex items-center gap-2 pb-2">
              <lucide-icon [name]="Filter" [size]="16" class="text-muted-foreground"></lucide-icon>
              <select [ngModel]="selectedCategory()" (ngModelChange)="selectedCategory.set($event)"
                      class="px-4 py-2 rounded-xl border border-border bg-white font-bold text-sm text-teal-700 outline-none hover:border-teal-600 cursor-pointer shadow-sm">
                @for (cat of categories; track cat) {
                  <option [value]="cat">{{ cat === 'All' ? 'All Categories' : cat }}</option>
                }
              </select>
            </div>
          }
        </div>

        <!-- ── ALL COMPETITIONS ────────────────────────────────────────── -->
        @if (activeTab() === 'all') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (comp of filteredCompetitions; track comp.id) {
              <div class="group relative flex flex-col bg-white rounded-3xl border border-border overflow-hidden hover:shadow-2xl hover:shadow-teal-600/10 transition-all duration-500 hover:-translate-y-1">
                <div class="relative aspect-[16/10] overflow-hidden">
                  <img [src]="comp.image" [alt]="comp.title" class="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  <div class="absolute top-4 right-4">
                    <span [ngClass]="{
                      'bg-teal-600': comp.status === 'ongoing',
                      'bg-orange-500': comp.status === 'upcoming',
                      'bg-muted-foreground': comp.status === 'completed'
                    }" class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-black/20">
                      {{ comp.status }}
                    </span>
                  </div>
                </div>
                <div class="p-6 flex-1 flex flex-col">
                  <div class="flex items-center gap-2 mb-3">
                    <span class="text-xs font-bold text-teal-600 uppercase tracking-wider">{{ comp.category }}</span>
                  </div>
                  <h3 class="text-xl font-extrabold text-foreground mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">{{ comp.title }}</h3>
                  <p class="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1 italic">"{{ comp.description }}"</p>
                  <div class="grid grid-cols-2 gap-4 py-4 border-t border-border mt-auto">
                    <div class="space-y-1">
                      <span class="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Grand Prize</span>
                      <div class="flex items-center gap-1.5 text-teal-600 font-bold text-xs">
                        <lucide-icon [name]="Trophy" [size]="14"></lucide-icon>
                        {{ comp.prize }}
                      </div>
                    </div>
                    <div class="space-y-1">
                      <span class="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Deadline</span>
                      <div class="flex items-center gap-1.5 text-foreground font-bold text-xs">
                        <lucide-icon [name]="Calendar" [size]="14"></lucide-icon>
                        {{ comp.deadline }}
                      </div>
                    </div>
                  </div>
                  <a [routerLink]="['/competitions', comp.slug]"
                     class="mt-6 w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all group/btn shadow-lg shadow-teal-600/20 active:scale-[0.98]">
                    View Challenge
                    <lucide-icon [name]="ArrowRight" [size]="18" class="group-hover/btn:translate-x-1 transition-transform"></lucide-icon>
                  </a>
                </div>
              </div>
            }
          </div>
          @if (data.competitions().length === 0) {
            <div class="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-border">
              <p class="text-muted-foreground font-medium">No competitions available right now. Check back later!</p>
            </div>
          }
        }

        <!-- ── INTELLIGENT RECOMMENDATIONS ────────────────────────────────── -->
        @if (activeTab() === 'recommended') {
          <div class="space-y-10">

            <!-- Email DNA Input -->
            <div class="relative overflow-hidden rounded-[2rem] p-8 text-white" style="background:linear-gradient(135deg,#0d9488 0%,#0f766e 60%,#134e4a 100%)">
              <div class="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5"></div>
              <div class="absolute -right-4 top-16 w-24 h-24 rounded-full bg-white/5"></div>
              <div class="absolute right-32 -bottom-6 w-32 h-32 rounded-full bg-teal-400/10"></div>
              <div class="relative flex flex-col md:flex-row gap-8 items-center">
                <div class="flex-1 space-y-2">
                  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-[10px] font-black uppercase tracking-widest mb-1">
                    <lucide-icon [name]="Dna" [size]="14"></lucide-icon> Content DNA Engine v2
                  </div>
                  <h3 class="font-black text-3xl tracking-tight">Your Personalized Learning Roadmap</h3>
                  <p class="text-teal-100 text-sm leading-relaxed">We analyze your <span class="font-black text-white">history, skill gaps, category behavior, and error patterns</span> to give you the right content at the right time.</p>
                </div>
                <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                  <input type="email" [(ngModel)]="recommendEmail" placeholder="your.email@example.com"
                         class="px-6 py-4 rounded-2xl bg-white text-foreground font-bold focus:ring-4 focus:ring-teal-300/30 outline-none w-full sm:w-80 transition-all shadow-xl">
                  <button (click)="loadRecommendations()" [disabled]="!recommendEmail || recommendLoading()"
                          class="px-8 py-4 bg-white text-teal-700 hover:bg-teal-50 disabled:opacity-50 rounded-2xl font-black transition-all active:scale-[0.97] flex items-center justify-center gap-2 shadow-xl whitespace-nowrap">
                    @if (recommendLoading()) {
                      <div class="w-5 h-5 border-2 border-teal-600/30 border-t-teal-600 rounded-full animate-spin"></div>
                    } @else {
                      <lucide-icon [name]="Dna" [size]="18"></lucide-icon>
                      Analyze Profile
                    }
                  </button>
                </div>
              </div>
            </div>

            @if (recommendLoading()) {
              <div class="py-24 text-center space-y-6">
                <div class="relative w-24 h-24 mx-auto">
                  <div class="absolute inset-0 border-4 border-teal-600/20 rounded-full"></div>
                  <div class="absolute inset-0 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  <div class="absolute inset-4 border-4 border-orange-400/30 border-b-orange-400 rounded-full animate-spin" style="animation-direction:reverse;animation-duration:0.8s"></div>
                </div>
                <p class="text-teal-600 font-black uppercase tracking-[0.2em] text-sm animate-pulse">Mapping Cognitive DNA Profile...</p>
              </div>

            } @else if (recommendProfile()) {
              @let prof = recommendProfile()!;

              <!-- ── DNA STATS GRID ── -->
              <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div class="col-span-2 md:col-span-1 bg-teal-600 rounded-[2rem] p-6 text-white shadow-xl shadow-teal-600/20 flex flex-col justify-between">
                  <lucide-icon [name]="Target" [size]="24" class="text-teal-200"></lucide-icon>
                  <div class="mt-4">
                    <p class="text-[10px] font-black uppercase tracking-widest text-teal-200">Level</p>
                    <p class="text-3xl font-black mt-1">{{ prof.level }}</p>
                  </div>
                </div>
                <div class="bg-white rounded-[2rem] border border-border p-6 shadow-sm flex flex-col justify-between">
                  <lucide-icon [name]="Zap" [size]="24" class="text-amber-500"></lucide-icon>
                  <div class="mt-4">
                    <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accuracy</p>
                    <p class="text-3xl font-black mt-1">{{ prof.accuracy }}%</p>
                  </div>
                </div>
                <div class="bg-white rounded-[2rem] border border-border p-6 shadow-sm flex flex-col justify-between">
                  <lucide-icon [name]="Brain" [size]="24" class="text-purple-500"></lucide-icon>
                  <div class="mt-4">
                    <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Top Category</p>
                    <p class="text-xl font-black mt-1 line-clamp-1">{{ prof.dominantCategory }}</p>
                  </div>
                </div>
                <div class="bg-white rounded-[2rem] border border-border p-6 shadow-sm flex flex-col justify-between">
                  <lucide-icon [name]="Flame" [size]="24" class="text-red-500"></lucide-icon>
                  <div class="mt-4">
                    <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Errors</p>
                    <p class="text-3xl font-black mt-1 text-red-500">{{ prof.totalErrors }}</p>
                  </div>
                </div>
                <div class="bg-white rounded-[2rem] border border-border p-6 shadow-sm flex flex-col justify-between">
                  <lucide-icon [name]="Trophy" [size]="24" class="text-teal-600"></lucide-icon>
                  <div class="mt-4">
                    <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Competitions</p>
                    <p class="text-3xl font-black mt-1">{{ prof.participatedCount }}</p>
                    <p class="text-[10px] text-muted-foreground mt-0.5">{{ prof.completedCount }} completed</p>
                  </div>
                </div>
              </div>

              <!-- Competition History Timeline -->
              @if (prof.historyCategories.length > 0) {
                <div class="bg-white rounded-[2rem] border border-border p-6 shadow-sm">
                  <div class="flex items-center gap-3 mb-4">
                    <span class="text-xl">📊</span>
                    <div>
                      <h4 class="font-black text-base">Your Competition History</h4>
                      <p class="text-xs text-muted-foreground">Categories analyzed from your {{ prof.completedCount > 0 ? 'completed' : 'participated' }} competitions — these drive all recommendations below</p>
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    @for (cat of prof.historyCategories; track cat; let i = $index) {
                      <div class="flex items-center gap-2 px-3 py-2 rounded-2xl border-2 bg-gradient-to-r"
                           [style]="i === 0 ? 'border-color:#0d9488;background:linear-gradient(135deg,#f0fdfa,#e6fffa)' : 'border-color:#e2e8f0;background:#f8fafc'">
                        <span class="w-2 h-2 rounded-full" [style]="'background:' + categoryColor(i)"></span>
                        <span class="text-sm font-black" [style]="i === 0 ? 'color:#0d9488' : 'color:#475569'">{{ cat }}</span>
                        @if (i === 0) {
                          <span class="text-[9px] font-black uppercase tracking-widest bg-teal-600 text-white px-1.5 py-0.5 rounded-full">Dominant</span>
                        }
                        @if (cat === prof.weakestCategory) {
                          <span class="text-[9px] font-black uppercase tracking-widest bg-red-500 text-white px-1.5 py-0.5 rounded-full">Weak</span>
                        }
                        @if (prof.strengths.includes(cat)) {
                          <span class="text-[9px] font-black uppercase tracking-widest bg-green-500 text-white px-1.5 py-0.5 rounded-full">Strong</span>
                        }
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Weakness Alert + Strengths -->
              @if (prof.weakestCategory || prof.strengths.length > 0) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @if (prof.weakestCategory) {
                    <div class="flex items-start gap-4 bg-red-50 border border-red-200 rounded-2xl p-5">
                      <span class="text-3xl shrink-0">⚠️</span>
                      <div>
                        <p class="font-black text-red-700">Skill Gap Detected: <span class="underline">{{ prof.weakestCategory }}</span></p>
                        <p class="text-sm text-red-600 mt-1">You have accumulated errors in this category. Special remedial exercises have been prioritized below to fix this.</p>
                      </div>
                    </div>
                  }
                  @if (prof.strengths.length > 0) {
                    <div class="flex items-start gap-4 bg-teal-50 border border-teal-200 rounded-2xl p-5">
                      <span class="text-3xl shrink-0">🏅</span>
                      <div>
                        <p class="font-black text-teal-700">Your Strengths</p>
                        <div class="flex flex-wrap gap-2 mt-2">
                          @for (s of prof.strengths; track s) {
                            <span class="px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-black">{{ s }}</span>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- 🎯 PILLAR 1: COMPETITIONS -->
              <div class="space-y-5">
                <div class="flex items-center gap-3">
                  <span class="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-lg shrink-0">🎯</span>
                  <div>
                    <h3 class="text-2xl font-black">Next Competitions For You</h3>
                    <p class="text-sm text-muted-foreground">
                      Based on your history in
                      @for (cat of prof.historyCategories.slice(0,3); track cat; let last = $last) {
                        <strong class="text-teal-600">{{ cat }}</strong>{{ last ? '' : ', ' }}
                      }
                      &mdash; open competitions you haven't joined yet
                    </p>
                  </div>
                </div>

                @if (prof.recommendedCompetitions.length === 0) {
                  <div class="py-10 text-center bg-white rounded-3xl border-2 border-dashed border-border">
                    <p class="text-muted-foreground">No open competitions in your category yet. Check back soon!</p>
                  </div>
                } @else {
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    @for (comp of prof.recommendedCompetitions; track comp.id) {
                      <div class="group flex flex-col bg-white rounded-3xl border border-border overflow-hidden hover:shadow-2xl hover:shadow-teal-600/10 transition-all duration-500 hover:-translate-y-1">
                        <div class="relative aspect-[16/10] overflow-hidden">
                          <img [src]="comp.image" [alt]="comp.title" class="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700">
                          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                          <span class="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">DNA MATCH</span>
                          <span [ngClass]="{
                            'bg-teal-600': comp.status === 'ongoing',
                            'bg-orange-500': comp.status === 'upcoming'
                          }" class="absolute top-4 left-4 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{{ comp.status }}</span>
                        </div>
                        <div class="p-5 flex flex-col flex-1">
                          <span class="text-xs font-bold text-teal-600 mb-1">{{ comp.category }}</span>
                          <h4 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">{{ comp.title }}</h4>
                          <div class="flex items-center gap-3 text-xs font-bold text-muted-foreground mb-3 mt-auto">
                            <span class="flex items-center gap-1"><lucide-icon [name]="Trophy" [size]="12"></lucide-icon> {{ comp.prize }}</span>
                            <span class="flex items-center gap-1"><lucide-icon [name]="Calendar" [size]="12"></lucide-icon> {{ comp.deadline | slice:0:10 }}</span>
                          </div>
                          <a [routerLink]="['/competitions', comp.slug]"
                             class="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all">
                            Enter Arena <lucide-icon [name]="ArrowRight" [size]="15"></lucide-icon>
                          </a>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- 📚 PILLAR 2: EXERCISES -->
              <div class="space-y-5">
                <div class="flex items-center gap-3">
                  <span class="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-lg shrink-0">📚</span>
                  <div>
                    <h3 class="text-2xl font-black">
                      Remedial Practice Exercises
                      @if (prof.weakestCategory) {
                        <span class="ml-2 text-[10px] font-black text-red-600 uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-50 border border-red-200">⚠️ Fix: {{ prof.weakestCategory }}</span>
                      }
                    </h3>
                    <p class="text-sm text-muted-foreground">
                      Exercises matched to
                      @for (cat of prof.historyCategories.slice(0,3); track cat; let last = $last) {
                        <strong class="text-orange-600">{{ cat }}</strong>{{ last ? '' : ', ' }}
                      }
                      &mdash; click <strong>Start Practice</strong> for instant MCQ feedback
                    </p>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  @for (ex of prof.recommendedExercises; track ex.id) {
                    @let result = exerciseResult(ex.id);
                    @let done = result !== null;
                    @let mastery = done ? masteryLabel(result!.score) : null;
                    <div class="relative bg-white rounded-3xl border-2 p-6 transition-all group flex flex-col h-full shadow-sm"
                         [style]="done ? 'border-color:' + mastery!.color + '33' : ''"
                         [class]="done ? 'hover:shadow-xl' : 'border-border hover:border-orange-500/50 hover:shadow-xl'">

                      <!-- ── COMPLETED BANNER ── -->
                      @if (done) {
                        <div class="absolute top-0 left-0 right-0 rounded-t-[22px] px-4 py-2 flex items-center justify-between"
                             [style]="'background:' + mastery!.color">
                          <span class="text-white text-[10px] font-black uppercase tracking-widest">{{ mastery!.icon }} {{ mastery!.label }}</span>
                          <span class="text-white text-[10px] font-black">Completed ✓</span>
                        </div>
                        <div class="mt-6"></div>
                      }

                      <!-- Header row -->
                      <div class="flex items-center justify-between mb-4">
                        <div class="text-4xl">{{ ex.icon }}</div>
                        @if (done) {
                          <!-- Score ring -->
                          <div class="relative w-14 h-14 shrink-0">
                            <svg class="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                              <circle cx="28" cy="28" r="24" fill="none" stroke="#f1f5f9" stroke-width="5"/>
                              <circle cx="28" cy="28" r="24" fill="none" [attr.stroke]="mastery!.color" stroke-width="5"
                                      stroke-linecap="round"
                                      [style]="'stroke-dasharray:' + (2*3.14159*24) + ';stroke-dashoffset:' + (2*3.14159*24*(1-result!.score/100))">
                              </circle>
                            </svg>
                            <div class="absolute inset-0 flex items-center justify-center">
                              <span class="font-black text-sm" [style]="'color:' + mastery!.color">{{ result!.score }}%</span>
                            </div>
                          </div>
                        } @else {
                          <span [ngClass]="{
                            'bg-green-100 text-green-700': ex.difficulty === 'Beginner',
                            'bg-blue-100 text-blue-700': ex.difficulty === 'Intermediate',
                            'bg-purple-100 text-purple-700': ex.difficulty === 'Advanced'
                          }" class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                            {{ ex.difficulty }}
                          </span>
                        }
                      </div>

                      <h4 class="font-black text-base mb-1 transition-colors"
                          [class]="done ? '' : 'group-hover:text-orange-600'">{{ ex.title }}</h4>
                      <p class="text-xs text-muted-foreground italic mb-1 line-clamp-2">{{ ex.description }}</p>

                      @if (done) {
                        <!-- Result stats -->
                        <div class="flex items-center gap-3 my-2">
                          <div class="flex-1 text-center rounded-2xl py-2" style="background:#f0fdf4">
                            <p class="text-lg font-black text-green-600">{{ result!.correct }}</p>
                            <p class="text-[9px] font-black text-green-700 uppercase">Correct</p>
                          </div>
                          <div class="flex-1 text-center rounded-2xl py-2" style="background:#fef2f2">
                            <p class="text-lg font-black text-red-500">{{ result!.total - result!.correct }}</p>
                            <p class="text-[9px] font-black text-red-600 uppercase">Wrong</p>
                          </div>
                          <div class="flex-1 text-center rounded-2xl py-2" style="background:#fffbeb">
                            <p class="text-lg font-black text-amber-600">+{{ ex.points }}</p>
                            <p class="text-[9px] font-black text-amber-700 uppercase">Pts</p>
                          </div>
                        </div>
                      } @else {
                        <div class="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase mb-4">
                          <span>{{ ex.tasks.length }} questions</span>
                          <span>·</span>
                          <span>{{ ex.estimatedMinutes }} min</span>
                          <span>·</span>
                          <span class="text-amber-600">+{{ ex.points }} pts</span>
                        </div>
                      }

                      <!-- Action button -->
                      @if (done) {
                        <div class="mt-auto w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 border-2 cursor-default select-none"
                             [style]="'border-color:' + mastery!.color + '44;color:' + mastery!.color + ';background:' + mastery!.color + '0d'">
                          🔒 Results Locked
                        </div>
                      } @else {
                        <button (click)="startPractice(ex)"
                                class="mt-auto w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-[0.97]">
                          <lucide-icon [name]="Zap" [size]="14"></lucide-icon>
                          Start Practice
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- 🧠 PILLAR 3: TRAINING CONTENT -->
              <div class="space-y-5 pb-20">
                <div class="flex items-center gap-3">
                  <span class="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-lg shrink-0">🧠</span>
                  <div>
                    <h3 class="text-2xl font-black">Recommended Training Courses</h3>
                    <p class="text-sm text-muted-foreground">
                      Courses in
                      @for (cat of prof.historyCategories.slice(0,3); track cat; let last = $last) {
                        <strong class="text-purple-600">{{ cat }}</strong>{{ last ? '' : ', ' }}
                      }
                      tailored to your <strong class="text-purple-600">{{ prof.level }}</strong> level
                    </p>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  @for (t of prof.recommendedContent; track t.id) {
                    <div class="flex flex-col bg-white rounded-3xl border border-border overflow-hidden group hover:shadow-2xl transition-all duration-500">
                      <div class="relative h-44 overflow-hidden">
                        <img [src]="t.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div class="absolute top-4 left-4 flex gap-2 flex-wrap">
                          <span class="bg-purple-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase">Course</span>
                          <span class="bg-white/20 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase">{{ t.level }}</span>
                          @if (t.aiScore >= 70) {
                            <span class="bg-teal-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1">
                              🧠 {{ t.aiScore }}% match
                            </span>
                          }
                        </div>
                      </div>
                      <div class="p-5 flex flex-col flex-1">
                        <div class="flex items-center gap-2 mb-1.5">
                          @if (t.category) {
                            <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{{ t.category }}</span>
                          }
                        </div>
                        <h4 class="font-black text-base mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">{{ t.title }}</h4>
                        <p class="text-xs text-muted-foreground mb-1">by {{ t.instructor }}</p>
                        <div class="flex items-center gap-2 text-[10px] font-bold text-muted-foreground mb-4">
                          @if (t.chapters) { <span>{{ t.chapters }} ch.</span><span>·</span> }
                          @if (t.duration) { <span>{{ t.duration }}</span><span>·</span> }
                          <span class="font-black text-purple-700">{{ t.price }} TND</span>
                        </div>
                        <!-- AI Score Progress Bar -->
                        @if (t.aiScore) {
                          <div class="mb-3">
                            <div class="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                              <span>AI Match</span>
                              <span [style]="'color:' + (t.aiScore >= 70 ? '#0d9488' : t.aiScore >= 40 ? '#f97316' : '#94a3b8')">{{ t.aiScore }}%</span>
                            </div>
                            <div class="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div class="h-full rounded-full transition-all duration-700"
                                   [style]="'width:' + t.aiScore + '%;background:' + (t.aiScore >= 70 ? '#0d9488' : t.aiScore >= 40 ? '#f97316' : '#94a3b8')">
                              </div>
                            </div>
                          </div>
                        }
                        <div class="flex gap-2 mt-auto">
                          <button (click)="previewTraining.set(t)"
                                  class="flex-1 py-2.5 border-2 border-purple-200 rounded-xl text-purple-600 font-bold text-sm hover:bg-purple-50 transition-all flex items-center justify-center gap-1.5">
                            <lucide-icon [name]="BookOpen" [size]="14"></lucide-icon>
                            Preview
                          </button>
                          <a [routerLink]="['/trainings', t.slug]"
                             class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all">
                            Enroll <lucide-icon [name]="ArrowRight" [size]="14"></lucide-icon>
                          </a>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>

            } @else if (hasSearchedRecommendations) {
              <div class="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-border space-y-4">
                <div class="text-5xl mb-4">🧬</div>
                <h3 class="text-xl font-black">No DNA Record Found</h3>
                <p class="text-muted-foreground max-w-sm mx-auto text-sm">No performance history found for this email. Participate in a competition first to generate your personal learning profile!</p>
              </div>
            }
          </div>
        }

        <!-- ── POPULARITY RANKING ──────────────────────────────────────── -->
        @if (activeTab() === 'ranking') {
          <div class="space-y-4">
            @if (rankingLoading()) {
              <div class="py-20 text-center">
                <div class="animate-pulse text-teal-600 font-bold">Loading ranking...</div>
              </div>
            } @else if (ranking().length === 0) {
              <div class="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-border">
                <p class="text-muted-foreground font-medium">No votes yet. Be the first to vote!</p>
              </div>
            } @else {
              @for (item of ranking(); track item.competitionId; let i = $index) {
                <div class="flex items-center gap-6 bg-white rounded-3xl border border-border p-5 hover:shadow-xl hover:shadow-teal-600/5 transition-all duration-300 hover:-translate-y-0.5">
                  <div [ngClass]="{
                    'bg-yellow-400 text-white shadow-lg shadow-yellow-400/40': i === 0,
                    'bg-gray-300 text-white shadow-lg shadow-gray-300/40': i === 1,
                    'bg-orange-400 text-white shadow-lg shadow-orange-400/40': i === 2,
                    'bg-muted text-muted-foreground': i > 2
                  }" class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0">
                    {{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + item.rank }}
                  </div>
                  <div class="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                    <img [src]="item.image" [alt]="item.title" class="w-full h-full object-cover">
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-[10px] font-black text-teal-600 uppercase tracking-widest">{{ item.category }}</span>
                      <span [ngClass]="{
                        'bg-teal-100 text-teal-700': item.status === 'ongoing',
                        'bg-orange-100 text-orange-700': item.status === 'upcoming',
                        'bg-gray-100 text-gray-600': item.status === 'completed'
                      }" class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {{ item.status }}
                      </span>
                    </div>
                    <h3 class="font-extrabold text-foreground truncate">{{ item.title }}</h3>
                    <p class="text-xs text-muted-foreground mt-0.5">🏆 {{ item.prize }} · {{ item.participantCount }} participants</p>
                  </div>
                  <div class="flex items-center gap-4 shrink-0">
                    <div class="flex items-center gap-1.5 text-teal-600 font-bold text-sm">
                      <lucide-icon [name]="ThumbsUp" [size]="15"></lucide-icon>
                      {{ item.likes }}
                    </div>
                    <div class="flex items-center gap-1.5 text-red-500 font-bold text-sm">
                      <lucide-icon [name]="ThumbsDown" [size]="15"></lucide-icon>
                      {{ item.dislikes }}
                    </div>
                    <div class="text-right">
                      <p class="font-black text-lg" [ngClass]="item.score >= 0 ? 'text-teal-600' : 'text-red-500'">
                        {{ item.score >= 0 ? '+' : '' }}{{ item.score }}
                      </p>
                      <p class="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Score</p>
                    </div>
                  </div>
                  <a [routerLink]="['/competitions', item.slug]"
                     class="shrink-0 p-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white transition-all active:scale-95 shadow-lg shadow-teal-600/20">
                    <lucide-icon [name]="ArrowRight" [size]="18"></lucide-icon>
                  </a>
                </div>
              }
            }
          </div>
        }

      </div>
    </div>

    <style>
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .animate-slideUp { animation: slideUp 0.3s ease-out; }
    </style>
  `
})
export class CompetitionsComponent implements OnInit {
    data = inject(DataService);

    readonly Trophy = Trophy;
    readonly Calendar = Calendar;
    readonly ArrowRight = ArrowRight;
    readonly Filter = Filter;
    readonly ThumbsUp = ThumbsUp;
    readonly ThumbsDown = ThumbsDown;
    readonly BarChart3 = BarChart3;
    readonly Star = Star;
    readonly Dna = Dna;
    readonly Zap = Zap;
    readonly Brain = Brain;
    readonly CheckCircle2 = CheckCircle2;
    readonly Target = Target;
    readonly Award = Award;
    readonly XCircle = XCircle;
    readonly CheckCircle = CheckCircle;
    readonly BookOpen = BookOpen;
    readonly Flame = Flame;

    activeTab = signal<Tab>('all');
    ranking = signal<CompetitionRanking[]>([]);
    rankingLoading = signal(false);

    recommendEmail = '';
    recommendations = signal<Competition[]>([]);
    recommendProfile = signal<RecommendationProfile | null>(null);
    recommendLoading = signal(false);
    hasSearchedRecommendations = false;

    selectedCategory = signal<string>('All');

    // Practice Modal state
    practice = signal<PracticeState | null>(null);

    // Stores completed exercise results: exerciseId → { score, correct, total }
    completedExercises = signal<Record<number, { score: number; correct: number; total: number }>>({});

    // Course Preview Modal state
    previewTraining = signal<Training | null>(null);

    get categories() {
        const cats = new Set(this.data.competitions().map(c => c.category).filter(Boolean));
        return ['All', ...Array.from(cats)].sort();
    }

    get filteredCompetitions() {
        const comps = this.data.competitions();
        if (this.selectedCategory() === 'All') return comps;
        return comps.filter(c => c.category === this.selectedCategory());
    }

    private route = inject(ActivatedRoute);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const tab = params['tab'] as Tab;
            const email = params['email'] as string;
            if (tab === 'recommended' || tab === 'all' || tab === 'ranking') {
                this.activeTab.set(tab);
            }
            if (email) {
                this.recommendEmail = email;
            }
            if (tab === 'recommended' && email) {
                // Auto-load recommendations when arriving from competition detail
                setTimeout(() => this.loadRecommendations(), 150);
            }
            if (tab === 'ranking') {
                this.loadRanking();
            }
        });
    }

    loadRanking() {
        this.activeTab.set('ranking');
        if (this.ranking().length > 0) return;
        this.rankingLoading.set(true);
        this.data.getCompetitionRanking().subscribe(data => {
            this.ranking.set(data);
            this.rankingLoading.set(false);
        });
    }

    loadRecommendations() {
        if (!this.recommendEmail) return;
        this.recommendLoading.set(true);
        this.hasSearchedRecommendations = true;
        this.data.getIntelligentProfile(this.recommendEmail).subscribe(profile => {
            this.recommendProfile.set(profile);
            this.recommendations.set(profile?.recommendedCompetitions ?? []);
            this.recommendLoading.set(false);
        });
    }

    // ── Practice Modal ────────────────────────────────────────────────────────
    startPractice(exercise: Exercise) {
        this.practice.set({
            exercise,
            currentTask: 0,
            selectedAnswers: new Array(exercise.tasks.length).fill(null),
            confirmed: new Array(exercise.tasks.length).fill(false),
            finished: false,
            score: 0
        });
        document.body.style.overflow = 'hidden';
    }

    selectAnswer(optionIndex: number) {
        const p = this.practice();
        if (!p || p.confirmed[p.currentTask]) return;
        const newAnswers = [...p.selectedAnswers];
        newAnswers[p.currentTask] = optionIndex;
        this.practice.set({ ...p, selectedAnswers: newAnswers });
    }

    confirmAnswer() {
        const p = this.practice();
        if (!p || p.selectedAnswers[p.currentTask] === null) return;
        const newConfirmed = [...p.confirmed];
        newConfirmed[p.currentTask] = true;
        this.practice.set({ ...p, confirmed: newConfirmed });
    }

    nextTask() {
        const p = this.practice();
        if (!p) return;
        this.practice.set({ ...p, currentTask: p.currentTask + 1 });
    }

    finishPractice() {
        const p = this.practice();
        if (!p) return;
        const correct = p.selectedAnswers.filter((a, i) => a === p.exercise.tasks[i].correctIndex).length;
        const score = Math.round((correct / p.exercise.tasks.length) * 100);
        this.practice.set({ ...p, finished: true, score });
    }

    closePractice() {
        const p = this.practice();
        // Save result permanently if exercise was finished
        if (p?.finished) {
            const correct = p.selectedAnswers.filter((a, i) => a === p.exercise.tasks[i].correctIndex).length;
            this.completedExercises.update(map => ({
                ...map,
                [p.exercise.id]: { score: p.score, correct, total: p.exercise.tasks.length }
            }));
        }
        this.practice.set(null);
        document.body.style.overflow = '';
    }

    /** Get completed result for an exercise id, or null */
    exerciseResult(exerciseId: number): { score: number; correct: number; total: number } | null {
        return this.completedExercises()[exerciseId] ?? null;
    }

    /** Map score % to a mastery label */
    masteryLabel(score: number): { label: string; color: string; icon: string } {
        if (score >= 90) return { label: 'Expert',       color: '#0d9488', icon: '🏆' };
        if (score >= 75) return { label: 'Proficient',   color: '#10b981', icon: '🥇' };
        if (score >= 55) return { label: 'Developing',   color: '#f97316', icon: '📈' };
        return                  { label: 'Needs Work',   color: '#ef4444', icon: '💪' };
    }

    /** Returns a color for a history category badge based on its index */
    categoryColor(index: number): string {
        const palette = ['#0d9488', '#f97316', '#8b5cf6', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1'];
        return palette[index % palette.length];
    }
}
