import { Component, inject } from '@angular/core';
import { DataService } from '../../services/data.service';
import {
  GraduationCap,
  Users,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  TrendingDown,
  ArrowDownRight
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-extrabold tracking-tight">Dashboard <span class="text-teal-600 underline decoration-2 underline-offset-4">Overview</span></h1>
        <p class="text-muted-foreground">Welcome back! Here's what's happening on your platform today.</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div routerLink="/admin/trainings" class="bg-white p-6 rounded-2xl border border-border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
          <div class="space-y-1">
            <p class="text-sm text-muted-foreground font-medium">Total Trainings</p>
            <h3 class="text-3xl font-bold">{{ data.trainings().length }}</h3>
            <div class="flex items-center gap-1 text-xs text-teal-600 font-bold">
                <lucide-icon [name]="ArrowUpRight" [size]="12"></lucide-icon>
                <span>+12.5%</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all">
            <lucide-icon [name]="GraduationCap" [size]="24"></lucide-icon>
          </div>
        </div>

        <div routerLink="/admin/clubs" class="bg-white p-6 rounded-2xl border border-border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
          <div class="space-y-1">
            <p class="text-sm text-muted-foreground font-medium">Active Clubs</p>
            <h3 class="text-3xl font-bold">{{ data.clubs().length }}</h3>
            <div class="flex items-center gap-1 text-xs text-teal-600 font-bold">
                <lucide-icon [name]="ArrowUpRight" [size]="12"></lucide-icon>
                <span>+5.2%</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
            <lucide-icon [name]="Users" [size]="24"></lucide-icon>
          </div>
        </div>

        <div routerLink="/admin/events" class="bg-white p-6 rounded-2xl border border-border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
          <div class="space-y-1">
            <p class="text-sm text-muted-foreground font-medium">Upcoming Events</p>
            <h3 class="text-3xl font-bold">{{ upcomingEventsCount }}</h3>
            <div class="flex items-center gap-1 text-xs text-rose-600 font-bold">
                <lucide-icon [name]="ArrowDownRight" [size]="12"></lucide-icon>
                <span>-2.1%</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all">
            <lucide-icon [name]="Calendar" [size]="24"></lucide-icon>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
          <div class="space-y-1">
            <p class="text-sm text-muted-foreground font-medium">Growth Rate</p>
            <h3 class="text-3xl font-bold">24.5%</h3>
            <div class="flex items-center gap-1 text-xs text-teal-600 font-bold">
                <lucide-icon [name]="ArrowUpRight" [size]="12"></lucide-icon>
                <span>+1.2%</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
            <lucide-icon [name]="TrendingUp" [size]="24"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Trainings -->
        <div class="bg-white rounded-3xl border border-border shadow-sm overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
            <div class="p-6 border-b border-border flex items-center justify-between bg-white">
                <h3 class="font-bold text-lg tracking-tight">Recent <span class="text-teal-600 decoration-teal-600/30 underline decoration-2 underline-offset-4">Trainings</span></h3>
                <button routerLink="/admin/trainings" class="text-xs font-bold text-teal-600 hover:text-teal-700 underline decoration-teal-600/30 underline-offset-4">View All</button>
            </div>
            <div class="divide-y divide-border">
                <div *ngFor="let training of data.trainings().slice(0, 3)" class="p-5 flex items-center gap-4 hover:bg-muted/30 transition-colors group">
                    <img [src]="training.image" class="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:rotate-3 transition-transform">
                    <div class="flex-1 min-w-0">
                        <p class="font-bold text-sm truncate">{{ training.title }}</p>
                        <p class="text-xs text-muted-foreground">{{ training.category }} • {{ training.instructor }}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-bold text-teal-600">{{ training.price }}</p>
                        <p class="text-[10px] text-muted-foreground">{{ training.duration }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Latest Clubs -->
        <div class="bg-white rounded-3xl border border-border shadow-sm overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
            <div class="p-6 border-b border-border flex items-center justify-between bg-white">
                <h3 class="font-bold text-lg tracking-tight">Active <span class="underline decoration-2 underline-offset-4 decoration-teal-600/30">Clubs</span></h3>
                <button routerLink="/admin/clubs" class="text-xs font-bold text-teal-600 hover:text-teal-700 underline decoration-teal-600/30 underline-offset-4">Explore</button>
            </div>
            <div class="divide-y divide-border">
                <div *ngFor="let club of data.clubs().slice(0, 3)" class="p-5 flex items-center gap-4 hover:bg-muted/30 transition-colors group">
                    <img [src]="club.image" class="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform">
                    <div class="flex-1 min-w-0">
                        <p class="font-bold text-sm truncate">{{ club.name }}</p>
                        <p class="text-xs text-muted-foreground">{{ club.members || 0 }} members active</p>
                    </div>
                    <lucide-icon [name]="ArrowUpRight" [size]="16" class="text-teal-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0"></lucide-icon>
                </div>
            </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  data = inject(DataService);

  get upcomingEventsCount() {
    return this.data.events().filter(e => e.type === 'next').length;
  }

  readonly GraduationCap = GraduationCap;
  readonly Users = Users;
  readonly Calendar = Calendar;
  readonly TrendingUp = TrendingUp;
  readonly ArrowUpRight = ArrowUpRight;
  readonly TrendingDown = TrendingDown;
  readonly ArrowDownRight = ArrowDownRight;
}
