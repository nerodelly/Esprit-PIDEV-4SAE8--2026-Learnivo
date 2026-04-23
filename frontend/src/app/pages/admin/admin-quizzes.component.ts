import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  ExternalLink,
  ArrowUpDown,
  FileQuestion,
  Layers3,
  BarChart3
} from 'lucide-angular';
import { DataService, Quiz } from '../../services/data.service';

@Component({
  selector: 'app-admin-quizzes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="space-y-1">
          <h1 class="text-3xl font-extrabold tracking-tight">
            Manage <span class="text-teal-600 underline decoration-2 underline-offset-4">Quizzes</span>
          </h1>
          <p class="text-muted-foreground">Add, review, and monitor quizzes independently from courses.</p>
        </div>
        <a
          routerLink="/admin/quizzes/new"
          class="group inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-6 py-3 font-bold text-white shadow-lg shadow-teal-600/20 transition-all hover:scale-105 hover:bg-teal-700 active:scale-95"
        >
          <lucide-icon [name]="Plus" [size]="18" class="transition-transform group-hover:rotate-90"></lucide-icon>
          Add Quiz
        </a>
      </div>

      <div class="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm md:flex-row">
        <div class="relative w-full flex-1">
          <lucide-icon [name]="Search" [size]="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search quizzes by title, course, or category..."
            class="w-full rounded-xl border-none bg-muted/30 py-3 pl-12 pr-4 text-sm transition-all focus:ring-2 focus:ring-teal-600"
          />
        </div>
        <div class="flex w-full items-center gap-3 md:w-auto">
          <div class="flex w-full items-center gap-2 rounded-xl border border-border px-4 py-3 md:w-auto">
            <lucide-icon [name]="ArrowUpDown" [size]="16" class="text-muted-foreground"></lucide-icon>
            <select
              [ngModel]="sortOption()"
              (ngModelChange)="onSortChange($event)"
              class="w-full bg-transparent text-sm font-medium outline-none md:min-w-44"
            >
              <option value="title-asc">Sort: Title A-Z</option>
              <option value="title-desc">Sort: Title Z-A</option>
              <option value="category-asc">Sort: Category A-Z</option>
              <option value="category-desc">Sort: Category Z-A</option>
            </select>
          </div>
          <button
            (click)="exportCurrentResults()"
            class="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium transition-all hover:bg-muted/50 md:w-auto"
          >
            <lucide-icon [name]="Download" [size]="16"></lucide-icon>
            Export
          </button>
        </div>
      </div>

      <div class="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th class="px-6 py-4">Quiz</th>
                <th class="px-6 py-4">Course</th>
                <th class="px-6 py-4">Difficulty</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Publication</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngFor="let quiz of paginatedQuizzes()" class="group transition-colors hover:bg-muted/20">
                <td class="px-6 py-5">
                  <div class="flex items-center gap-4">
                    <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shadow-sm">
                      <lucide-icon [name]="FileQuestion" [size]="20"></lucide-icon>
                    </div>
                    <div>
                      <p class="text-sm font-bold">{{ quiz.title }}</p>
                      <p class="text-xs text-muted-foreground">{{ quiz.duration }} • {{ quiz.questions }} questions • {{ quiz.passScore }}% pass</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div>
                    <p class="text-sm font-medium text-foreground">{{ quiz.course }}</p>
                    <span class="mt-2 inline-flex rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-teal-600">
                      {{ quiz.category }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <p class="text-sm font-medium">{{ quiz.difficulty }}</p>
                </td>
                <td class="px-6 py-5">
                  <div class="flex items-center gap-2">
                    <span class="h-2 w-2 rounded-full"
                      [class.bg-emerald-500]="quiz.status === 'Published'"
                      [class.bg-amber-500]="quiz.status === 'Draft'"
                      [class.bg-slate-400]="quiz.status === 'Archived'"></span>
                    <span class="text-xs font-medium"
                      [class.text-emerald-600]="quiz.status === 'Published'"
                      [class.text-amber-600]="quiz.status === 'Draft'"
                      [class.text-slate-500]="quiz.status === 'Archived'">
                      {{ quiz.status }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <p class="text-sm font-medium text-foreground">
                    {{ quiz.publishAt ? formatPublishAt(quiz.publishAt) : 'Immediate' }}
                  </p>
                  @if (quiz.status === 'Published') {
                    <p class="text-xs text-muted-foreground">
                      {{ isScheduled(quiz.publishAt) ? 'Scheduled' : 'Available now' }}
                    </p>
                  }
                </td>
                <td class="px-6 py-5 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <a [routerLink]="['/admin/quizzes', quiz.id, 'edit']"
                      class="rounded-lg p-2 transition-all hover:bg-teal-50 hover:text-teal-600" title="Edit">
                      <lucide-icon [name]="Edit2" [size]="16"></lucide-icon>
                    </a>
                    <button (click)="deleteQuiz(quiz.id)"
                      class="rounded-lg p-2 transition-all hover:bg-rose-50 hover:text-rose-600" title="Delete">
                      <lucide-icon [name]="Trash2" [size]="16"></lucide-icon>
                    </button>
                    <a [routerLink]="['/admin/quizzes', quiz.id, 'edit']"
                      class="rounded-lg p-2 transition-all hover:bg-muted" title="View">
                      <lucide-icon [name]="ExternalLink" [size]="16"></lucide-icon>
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between border-t border-border bg-muted/5 p-6">
          <p class="text-xs font-medium text-muted-foreground">
            Showing <span class="text-foreground">{{ startItem() }}</span> to
            <span class="text-foreground">{{ endItem() }}</span> of
            <span class="text-foreground">{{ filteredQuizzes().length }}</span> results
          </p>
          <div class="flex items-center gap-2">
            <button
              (click)="goToPreviousPage()"
              class="rounded-xl border border-border px-4 py-2 text-xs font-bold shadow-sm transition-all hover:bg-white disabled:opacity-50"
              [disabled]="currentPage() === 1"
            >
              Previous
            </button>
            <span class="px-2 text-xs font-medium text-muted-foreground">
              Page {{ currentPage() }} / {{ totalPages() }}
            </span>
            <button
              (click)="goToNextPage()"
              class="rounded-xl border border-border px-4 py-2 text-xs font-bold shadow-sm transition-all hover:bg-white disabled:opacity-50"
              [disabled]="currentPage() === totalPages()"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-3xl border border-border bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total quizzes</p>
              <p class="mt-1 text-2xl font-extrabold text-foreground">{{ data.quizzes().length }}</p>
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <lucide-icon [name]="FileQuestion" [size]="18"></lucide-icon>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-border bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visible results</p>
              <p class="mt-1 text-2xl font-extrabold text-foreground">{{ filteredQuizzes().length }}</p>
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <lucide-icon [name]="Layers3" [size]="18"></lucide-icon>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-border bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Average questions</p>
              <p class="mt-1 text-2xl font-extrabold text-foreground">{{ averageQuestions() }}</p>
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <lucide-icon [name]="BarChart3" [size]="18"></lucide-icon>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-border bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Difficulty levels</p>
              <p class="mt-1 text-2xl font-extrabold text-foreground">{{ difficultyBreakdown().length }}</p>
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <lucide-icon [name]="ArrowUpDown" [size]="18"></lucide-icon>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-foreground">Quiz analytics</h2>
            <p class="text-sm text-muted-foreground">Static pie chart of quiz difficulty across the full catalog.</p>
          </div>
          <div class="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {{ difficultyBreakdown().length }} difficulty levels
          </div>
        </div>

        <div class="mt-6 flex flex-col gap-8 lg:flex-row lg:items-center">
          <div class="relative mx-auto flex h-64 w-64 items-center justify-center">
            <svg viewBox="0 0 220 220" class="h-64 w-64 -rotate-90 drop-shadow-sm">
              <circle cx="110" cy="110" r="70" fill="none" stroke="#e5e7eb" stroke-width="28"></circle>
              @for (segment of pieSegments(); track segment.label) {
              <circle
                cx="110"
                cy="110"
                r="70"
                fill="none"
                [attr.stroke]="segment.color"
                stroke-width="28"
                stroke-linecap="butt"
                [attr.stroke-dasharray]="segment.dashArray"
                [attr.stroke-dashoffset]="segment.dashOffset"
              ></circle>
              }
            </svg>
            <div class="absolute flex flex-col items-center justify-center text-center">
              <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Difficulty</p>
              <p class="text-3xl font-extrabold text-foreground">{{ difficultyBreakdown().length }}</p>
            </div>
          </div>

          <div class="flex-1 space-y-3">
            @for (segment of difficultyBreakdown(); track segment.label) {
            <div class="flex items-center justify-between gap-4 rounded-2xl bg-muted/30 px-4 py-3">
              <div class="flex items-center gap-3">
                <span class="h-3 w-3 rounded-full" [style.background]="segment.color"></span>
                <div>
                  <p class="text-sm font-semibold text-foreground">{{ segment.label }}</p>
                  <p class="text-xs text-muted-foreground">{{ segment.count }} quiz(es)</p>
                </div>
              </div>
              <p class="text-sm font-bold text-foreground">{{ segment.percent }}%</p>
            </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminQuizzesComponent {
  data = inject(DataService);
  readonly pageSize = 4;
  searchQuery = signal('');
  currentPage = signal(1);
  sortOption = signal<'title-asc' | 'title-desc' | 'category-asc' | 'category-desc'>('title-asc');
  private readonly chartColors = ['#0f766e', '#2563eb', '#f59e0b', '#e11d48', '#7c3aed', '#16a34a', '#ea580c'];

  filteredQuizzes = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    let result = !query
      ? [...this.data.quizzes()]
      : this.data.quizzes().filter((quiz: Quiz) =>
          quiz.title.toLowerCase().includes(query) ||
          quiz.course.toLowerCase().includes(query) ||
          quiz.category.toLowerCase().includes(query)
        );

    switch (this.sortOption()) {
      case 'title-desc':
        result.sort((a: Quiz, b: Quiz) => b.title.localeCompare(a.title));
        break;
      case 'category-desc':
        result.sort((a: Quiz, b: Quiz) => b.category.localeCompare(a.category));
        break;
      case 'category-asc':
        result.sort((a: Quiz, b: Quiz) => a.category.localeCompare(b.category));
        break;
      default:
        result.sort((a: Quiz, b: Quiz) => a.title.localeCompare(b.title));
    }

    return result;
  });

  difficultyBreakdown = computed(() => {
    const total = this.data.quizzes().length || 1;
    const counts = new Map<string, number>();

    for (const quiz of this.data.quizzes()) {
      counts.set(quiz.difficulty, (counts.get(quiz.difficulty) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count], index) => ({
        label,
        count,
        percent: Math.round((count / total) * 100),
        color: this.chartColors[index % this.chartColors.length]
      }));
  });

  pieSegments = computed(() => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const total = this.data.quizzes().length || 1;
    let offset = 0;

    return this.difficultyBreakdown().map((segment) => {
      const length = (segment.count / total) * circumference;
      const item = {
        ...segment,
        dashArray: `${length} ${circumference - length}`,
        dashOffset: -offset
      };
      offset += length;
      return item;
    });
  });

  averageQuestions = computed(() => {
    if (this.data.quizzes().length === 0) return 0;
    const total = this.data.quizzes().reduce((sum: number, item: Quiz) => sum + item.questions, 0);
    return Math.round((total / this.data.quizzes().length) * 10) / 10;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredQuizzes().length / this.pageSize)));

  paginatedQuizzes = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize;
    return this.filteredQuizzes().slice(start, start + this.pageSize);
  });

  startItem = computed(() => {
    if (this.filteredQuizzes().length === 0) return 0;
    return (Math.min(this.currentPage(), this.totalPages()) - 1) * this.pageSize + 1;
  });

  endItem = computed(() => {
    if (this.filteredQuizzes().length === 0) return 0;
    return this.startItem() + this.paginatedQuizzes().length - 1;
  });

  readonly Plus = Plus;
  readonly Search = Search;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly Download = Download;
  readonly ExternalLink = ExternalLink;
  readonly ArrowUpDown = ArrowUpDown;
  readonly FileQuestion = FileQuestion;
  readonly Layers3 = Layers3;
  readonly BarChart3 = BarChart3;

  onSearchChange(value: string) {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  onSortChange(value: 'title-asc' | 'title-desc' | 'category-asc' | 'category-desc') {
    this.sortOption.set(value);
    this.currentPage.set(1);
  }

  goToPreviousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  goToNextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  exportCurrentResults() {
    const results = this.filteredQuizzes();
    const printWindow = window.open('', '_blank', 'width=1100,height=800');

    if (!printWindow) {
      this.data.addNotification({
        title: 'Export blocked',
        message: 'The browser blocked the export window. Allow pop-ups and try again.',
        href: '/admin/quizzes'
      });
      return;
    }

    const rows = results.map((quiz) => `
      <tr>
        <td>${this.escapeHtml(quiz.title)}</td>
        <td>${this.escapeHtml(quiz.course)}</td>
        <td>${this.escapeHtml(quiz.category)}</td>
        <td>${this.escapeHtml(quiz.difficulty)}</td>
        <td>${quiz.questions}</td>
        <td>${quiz.passScore}%</td>
        <td>${this.escapeHtml(quiz.status)}</td>
      </tr>
    `).join('');

    const queryLabel = this.searchQuery().trim() || 'No search filter';
    const sortLabel = this.getSortLabel();
    const exportedAt = new Date().toLocaleString();

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Quizzes Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
            h1 { margin: 0 0 8px; font-size: 28px; }
            .meta { margin-bottom: 24px; color: #475569; font-size: 14px; }
            .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 24px; }
            .card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px; }
            .card strong { display: block; font-size: 12px; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px 12px; vertical-align: top; text-align: left; }
            th { background: #f8fafc; font-size: 12px; text-transform: uppercase; color: #475569; }
            .empty { margin-top: 24px; padding: 18px; border: 1px dashed #cbd5e1; border-radius: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <h1>Quizzes Export</h1>
          <div class="meta">Exported on ${this.escapeHtml(exportedAt)}</div>
          <div class="summary">
            <div class="card"><strong>Search</strong><span>${this.escapeHtml(queryLabel)}</span></div>
            <div class="card"><strong>Sort</strong><span>${this.escapeHtml(sortLabel)}</span></div>
            <div class="card"><strong>Results</strong><span>${results.length} quiz(es)</span></div>
          </div>
          ${results.length === 0 ? `
            <div class="empty">No quizzes match the current search and sort settings.</div>
          ` : `
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Questions</th>
                  <th>Pass score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          `}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();

    this.data.addNotification({
      title: 'PDF export ready',
      message: `${results.length} filtered quiz(es) prepared for PDF export.`,
      href: '/admin/quizzes'
    });
  }

  async deleteQuiz(id: number | string) {
    const quiz = this.data.quizzes().find(item => item.id === id);
    try {
      await this.data.deleteQuiz(id);
      if (this.currentPage() > this.totalPages()) {
        this.currentPage.set(this.totalPages());
      }
      if (quiz) {
        this.data.addNotification({
          title: 'Quiz deleted',
          message: `"${quiz.title}" was removed from the quiz catalog.`,
          href: '/admin/quizzes'
        });
      }
    } catch {
      this.data.addNotification({
        title: 'Delete failed',
        message: 'The quiz could not be deleted because the backend is unavailable.',
        href: '/admin/quizzes'
      });
    }
  }

  private getSortLabel() {
    switch (this.sortOption()) {
      case 'title-desc':
        return 'Title Z-A';
      case 'category-asc':
        return 'Category A-Z';
      case 'category-desc':
        return 'Category Z-A';
      default:
        return 'Title A-Z';
    }
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  formatPublishAt(value: string) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  }

  isScheduled(value: string | null | undefined) {
    if (!value) {
      return false;
    }

    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime()) && parsed.getTime() > Date.now();
  }
}
