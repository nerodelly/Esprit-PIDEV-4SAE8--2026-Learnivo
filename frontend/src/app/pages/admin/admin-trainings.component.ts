import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataService, Training } from '../../services/data.service';
import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Filter,
    Download,
    ExternalLink
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-admin-trainings',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
    template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <h1 class="text-3xl font-extrabold tracking-tight">Manage <span class="text-teal-600 underline decoration-2 underline-offset-4">Trainings</span></h1>
          <p class="text-muted-foreground">Add, edit, or remove training programs from the platform.</p>
        </div>
        <a routerLink="/admin/courses/create" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-teal-600/20 active:scale-95 group no-underline">
          <lucide-icon [name]="Plus" [size]="18" class="group-hover:rotate-90 transition-transform"></lucide-icon>
          Add New Training
        </a>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white p-4 rounded-2xl border border-border flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div class="relative flex-1 w-full">
          <lucide-icon [name]="Search" [size]="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
          <input type="text" placeholder="Search trainings by title, category, or instructor..."
                 [(ngModel)]="searchTerm"
                 (ngModelChange)="currentPage = 1"
                 class="w-full pl-12 pr-4 py-3 bg-muted/30 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-600 transition-all">
        </div>
        <div class="flex items-center gap-3 w-full md:w-auto">
          <button class="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-muted/50 transition-all font-medium text-sm w-full md:w-auto justify-center">
            <lucide-icon [name]="Filter" [size]="16"></lucide-icon>
            Filters
          </button>
          <button (click)="exportTrainings()" class="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-muted/50 transition-all font-medium text-sm w-full md:w-auto justify-center">
            <lucide-icon [name]="Download" [size]="16"></lucide-icon>
            Export
          </button>
        </div>
      </div>

      <!-- Trainings Table -->
      <div class="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th class="px-6 py-4">Training</th>
                <th class="px-6 py-4">Category</th>
                <th class="px-6 py-4">Instructor</th>
                <th class="px-6 py-4">Price</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngFor="let training of pagedTrainings()" class="hover:bg-muted/20 transition-colors group">
                <td class="px-6 py-5">
                  <div class="flex items-center gap-4">
                    <img [src]="training.image" class="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform">
                    <div>
                      <p class="font-bold text-sm">{{ training.title }}</p>
                      <p class="text-xs text-muted-foreground">{{ training.duration }} • {{ training.chapters }} chapters</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5 truncate">
                  <span class="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-bold uppercase tracking-wide border border-teal-100">
                    {{ training.category }}
                  </span>
                </td>
                <td class="px-6 py-5">
                  <p class="text-sm font-medium">{{ training.instructor }}</p>
                </td>
                <td class="px-6 py-5">
                  <p class="text-sm font-bold text-teal-600">{{ training.price }}</p>
                </td>
                <td class="px-6 py-5">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span class="text-xs font-medium text-emerald-600">Active</span>
                    </div>
                </td>
                <td class="px-6 py-5 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <a [routerLink]="['/admin/courses/edit', training.id]" class="p-2 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-all" title="Edit">
                      <lucide-icon [name]="Edit2" [size]="16"></lucide-icon>
                    </a>
                    <button (click)="onDeleteTraining(training)" class="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all" title="Delete">
                      <lucide-icon [name]="Trash2" [size]="16"></lucide-icon>
                    </button>
                    <button class="p-2 hover:bg-muted rounded-lg transition-all">
                      <lucide-icon [name]="ExternalLink" [size]="16"></lucide-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="p-6 border-t border-border flex items-center justify-between bg-muted/5">
          <p class="text-xs text-muted-foreground font-medium">Showing <span class="text-foreground">{{ startItem }}</span> to <span class="text-foreground">{{ endItem }}</span> of <span class="text-foreground">{{ filteredTotal }}</span> results</p>
          <div class="flex items-center gap-2">
            <button class="px-4 py-2 rounded-xl border border-border text-xs font-bold disabled:opacity-50 hover:bg-white transition-all shadow-sm"
                    [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">Previous</button>
            <button class="px-4 py-2 rounded-xl border border-border text-xs font-bold hover:bg-white transition-all shadow-sm"
                    [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">Next</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminTrainingsComponent {
    data = inject(DataService);

    readonly Plus = Plus;
    readonly Search = Search;
    readonly MoreVertical = MoreVertical;
    readonly Edit2 = Edit2;
    readonly Trash2 = Trash2;
    readonly Filter = Filter;
    readonly Download = Download;
    readonly ExternalLink = ExternalLink;

    searchTerm = '';
    currentPage = 1;
    pageSize = 5;

    onDeleteTraining(training: Training) {
        if (!training.id) return;
        const confirmDelete = confirm(`Delete training "${training.title}"?`);
        if (!confirmDelete) return;
        this.data.deleteTraining(training.id);
    }

    exportTrainings() {
        const trainings = this.data.trainings();
        const csv = ['Title,Category,Instructor,Price,Level'];
        trainings.forEach(t => {
            csv.push(`"${t.title}","${t.category}","${t.instructor}","${t.price}","${t.level}"`);
        });
        const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'trainings.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    private filteredTrainings(): Training[] {
        const term = this.searchTerm.trim().toLowerCase();
        const list = this.data.trainings();
        if (!term) return list;
        return list.filter(t =>
            (t.title ?? '').toLowerCase().includes(term) ||
            (t.category ?? '').toLowerCase().includes(term) ||
            (t.instructor ?? '').toLowerCase().includes(term)
        );
    }

    get filteredTotal(): number { return this.filteredTrainings().length; }
    get totalPages(): number { return Math.max(1, Math.ceil(this.filteredTotal / this.pageSize)); }
    get startItem(): number { return this.filteredTotal === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
    get endItem(): number { return Math.min(this.currentPage * this.pageSize, this.filteredTotal); }

    pagedTrainings(): Training[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredTrainings().slice(start, start + this.pageSize);
    }

    goToPage(page: number) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
    }
}
