import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DataService, AdminClubFormData, Club } from '../../services/data.service';
import {
    Users,
    Plus,
    Search,
    MoreHorizontal,
    Mail,
    UserPlus
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-admin-clubs',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <h1 class="text-3xl font-extrabold tracking-tight">Manage <span class="text-teal-600 underline decoration-2 underline-offset-4">Clubs</span></h1>
          <p class="text-muted-foreground">Manage student clubs and community engagement.</p>
        </div>
        <button (click)="onCreateClub()" class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-teal-600/20 active:scale-95 group">
          <lucide-icon [name]="Plus" [size]="18" class="group-hover:rotate-90 transition-transform"></lucide-icon>
          Create New Club
        </button>
      </div>

      <!-- Search -->
      <div class="flex justify-end">
        <input
          [(ngModel)]="searchTerm"
          (ngModelChange)="currentPage = 1"
          type="text"
          placeholder="Search clubs..."
          class="w-full md:w-72 px-3 py-2 rounded-xl border border-border text-sm"
        />
      </div>

      <!-- Club Form -->
      <div *ngIf="formVisible" class="bg-white border border-border rounded-3xl shadow-sm p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-extrabold">
            {{ formMode === 'create' ? 'Create new club' : 'Edit club' }}
          </h2>
          <button type="button" class="text-sm text-muted-foreground hover:text-foreground" (click)="closeForm()">
            Close
          </button>
        </div>
        <form (ngSubmit)="submitForm(clubForm)" #clubForm="ngForm" class="grid gap-4 md:grid-cols-2">
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-muted-foreground mb-1">Name</label>
            <input
              [(ngModel)]="formData.name"
              name="name"
              required
              minlength="3"
              #nameCtrl="ngModel"
              class="w-full px-3 py-2 rounded-xl border border-border text-sm"
            />
            <p *ngIf="submitted && nameCtrl.invalid" class="mt-1 text-[11px] text-rose-600">
              Name is required (min. 3 characters).
            </p>
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-muted-foreground mb-1">Description</label>
            <textarea
              [(ngModel)]="formData.description"
              name="description"
              rows="3"
              required
              minlength="10"
              #descCtrl="ngModel"
              class="w-full px-3 py-2 rounded-xl border border-border text-sm"
            ></textarea>
            <p *ngIf="submitted && descCtrl.invalid" class="mt-1 text-[11px] text-rose-600">
              Description is required (minimum 10 characters).
            </p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-foreground mb-1">Status</label>
            <select
              [(ngModel)]="formData.status"
              name="status"
              required
              #statusCtrl="ngModel"
              class="w-full px-3 py-2 rounded-xl border border-border text-sm"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <p *ngIf="submitted && statusCtrl.invalid" class="mt-1 text-[11px] text-rose-600">
              Status is required.
            </p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-foreground mb-1">Professor (optional)</label>
            <select
              [(ngModel)]="formData.professorId"
              name="professorId"
              class="w-full px-3 py-2 rounded-xl border border-border text-sm"
            >
              <option [ngValue]="null">— No professor —</option>
              <option *ngFor="let prof of data.professors()" [ngValue]="prof.id">
                {{ prof.name }}
              </option>
            </select>
          </div>
          <div class="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" class="px-4 py-2 rounded-xl border border-border text-sm font-medium" (click)="closeForm()">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-bold">
              {{ formMode === 'create' ? 'Save club' : 'Update club' }}
            </button>
          </div>
        </form>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div *ngFor="let club of pagedClubs()" class="bg-white rounded-3xl border border-border shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div class="relative h-40">
                <img [src]="club.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div class="absolute bottom-4 left-4 text-white">
                    <h3 class="font-bold text-lg">{{ club.name }}</h3>
                    <p class="text-xs text-white/80">{{ club.members || 0 }} Active Members</p>
                </div>
                <div class="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all">
                  <button (click)="onEditClub(club)" class="p-2 bg-white/70 backdrop-blur-md rounded-xl text-emerald-700 hover:bg-emerald-500/90 hover:text-white" title="Edit club">
                    ✏️
                  </button>
                  <button (click)="onDeleteClub(club)" class="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-rose-500/80 transition-all" title="Delete club">
                    🗑️
                  </button>
                </div>
            </div>
            <div class="p-6 space-y-4">
                <p class="text-sm text-muted-foreground line-clamp-2">{{ club.description }}</p>
                <div class="flex items-center justify-between pt-4 border-t border-border">
                    <div class="flex -space-x-2">
                        <div *ngFor="let i of [1,2,3,4]" class="w-8 h-8 rounded-lg border-2 border-white bg-teal-50 flex items-center justify-center text-[10px] font-bold text-teal-600 shadow-sm">
                            AD
                        </div>
                        <div class="w-8 h-8 rounded-lg border-2 border-white bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shadow-sm">
                            +{{ (club.members || 0) > 4 ? (club.members || 0) - 4 : 0 }}
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="p-2 hover:bg-teal-50 text-teal-600 rounded-lg transition-all" title="Message Center">
                            <lucide-icon [name]="Mail" [size]="16"></lucide-icon>
                        </button>
                        <button class="p-2 hover:bg-teal-50 text-teal-600 rounded-lg transition-all" title="Invite Members">
                            <lucide-icon [name]="UserPlus" [size]="16"></lucide-icon>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
      <div class="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
        <span>Page {{ currentPage }} / {{ totalPages }}</span>
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1 rounded-lg border border-border disabled:opacity-50"
            (click)="goToPage(currentPage - 1)"
            [disabled]="currentPage === 1"
          >
            Prev
          </button>
          <button
            class="px-3 py-1 rounded-lg border border-border disabled:opacity-50"
            (click)="goToPage(currentPage + 1)"
            [disabled]="currentPage === totalPages"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminClubsComponent {
    data = inject(DataService);
    readonly Users = Users;
    readonly Plus = Plus;
    readonly Search = Search;
    readonly MoreHorizontal = MoreHorizontal;
    readonly Mail = Mail;
    readonly UserPlus = UserPlus;

    formVisible = false;
    formMode: 'create' | 'edit' = 'create';
    editingId: number | string | null = null;
    formData: AdminClubFormData = {
        name: '',
        description: '',
        status: 'ACTIVE',
        professorId: null
    };

    submitted = false;

    searchTerm = '';
    currentPage = 1;
    pageSize = 6;

    onCreateClub() {
        this.formMode = 'create';
        this.editingId = null;
        this.formData = {
            name: '',
            description: '',
            status: 'ACTIVE',
            professorId: null
        };
        this.formVisible = true;
    }

    onEditClub(club: Club) {
        this.formMode = 'edit';
        this.editingId = club.id ?? null;
        this.formData = {
            name: club.name,
            description: club.description,
            status: 'ACTIVE',
            professorId: null
        };
        this.formVisible = true;
    }

    onDeleteClub(club: any) {
        if (!club.id) return;
        const confirmDelete = confirm(`Delete club "${club.name}"?`);
        if (!confirmDelete) return;
        this.data.deleteClub(club.id);
    }

    submitForm(form: NgForm) {
        this.submitted = true;
        if (form.invalid) return;
        if (this.formMode === 'create') {
            this.data.createClub(this.formData);
        } else if (this.editingId != null) {
            this.data.updateClub(this.editingId, this.formData);
        }
        this.formVisible = false;
        this.submitted = false;
    }

    closeForm() {
        this.formVisible = false;
        this.submitted = false;
    }

    private filteredClubs(): Club[] {
        const term = this.searchTerm.trim().toLowerCase();
        const list = this.data.clubs();
        if (!term) return list;
        return list.filter(club =>
            (club.name ?? '').toLowerCase().includes(term) ||
            (club.description ?? '').toLowerCase().includes(term)
        );
    }

    get totalPages(): number {
        const total = this.filteredClubs().length;
        return Math.max(1, Math.ceil(total / this.pageSize));
    }

    pagedClubs(): Club[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredClubs().slice(start, start + this.pageSize);
    }

    goToPage(page: number) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
    }
}
