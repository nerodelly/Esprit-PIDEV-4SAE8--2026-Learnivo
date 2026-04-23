import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Calendar,
  Settings,
  LogOut,
  ChevronRight,
  Trophy,
  Video,
  BookOpen,
  HelpCircle,
  Award,
  Briefcase,
  UserCheck,
  GanttChart,
  ClipboardList,
  MessageSquare
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <aside class="w-64 bg-white border-r border-border flex flex-col h-screen fixed top-0 left-0">
      <div class="p-6 border-b border-border flex items-center gap-3">
        <div class="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">A</span>
        </div>
        <span class="font-bold text-xl tracking-tight">Admin<span class="text-teal-600 underline decoration-2 underline-offset-4">Panel</span></span>
      </div>

      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <!-- Dashboard -->
        <a routerLink="/admin" routerLinkActive="bg-teal-50 text-teal-600" [routerLinkActiveOptions]="{exact: true}"
           class="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-300 group">
          <div class="flex items-center gap-3">
            <lucide-icon [name]="LayoutDashboard" [size]="18"></lucide-icon>
            <span class="font-medium">Dashboard</span>
          </div>
          <lucide-icon [name]="ChevronRight" [size]="14" class="opacity-0 group-hover:opacity-100 transition-opacity"></lucide-icon>
        </a>

        <!-- Courses / Trainings -->
        <p class="text-xs font-semibold text-muted-foreground px-3 pt-3 pb-1 uppercase tracking-widest">Courses</p>

        <a routerLink="/admin/trainings" routerLinkActive="bg-teal-50 text-teal-600"
           class="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-300 group">
          <div class="flex items-center gap-3">
            <lucide-icon [name]="GraduationCap" [size]="18"></lucide-icon>
            <span class="font-medium">Trainings</span>
          </div>
          <lucide-icon [name]="ChevronRight" [size]="14" class="opacity-0 group-hover:opacity-100 transition-opacity"></lucide-icon>
        </a>

        <a routerLink="/admin/quizzes" routerLinkActive="bg-teal-50 text-teal-600"
           class="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-300 group">
          <div class="flex items-center gap-3">
            <lucide-icon [name]="HelpCircle" [size]="18"></lucide-icon>
            <span class="font-medium">Quizzes</span>
          </div>
          <lucide-icon [name]="ChevronRight" [size]="14" class="opacity-0 group-hover:opacity-100 transition-opacity"></lucide-icon>
        </a>

        <a routerLink="/admin/classes" routerLinkActive="bg-teal-50 text-teal-600"
           class="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-300 group">
          <div class="flex items-center gap-3">
            <lucide-icon [name]="Video" [size]="18"></lucide-icon>
            <span class="font-medium">Classes</span>
          </div>
          <lucide-icon [name]="ChevronRight" [size]="14" class="opacity-0 group-hover:opacity-100 transition-opacity"></lucide-icon>
        </a>

        <!-- Community -->
        <p class="text-xs font-semibold text-muted-foreground px-3 pt-3 pb-1 uppercase tracking-widest">Community</p>

        <a routerLink="/admin/clubs" routerLinkActive="bg-teal-50 text-teal-600"
           class="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-300 group">
          <div class="flex items-center gap-3">
            <lucide-icon [name]="Users" [size]="18"></lucide-icon>
            <span class="font-medium">Clubs</span>
          </div>
          <lucide-icon [name]="ChevronRight" [size]="14" class="opacity-0 group-hover:opacity-100 transition-opacity"></lucide-icon>
        </a>

        <a routerLink="/admin/club-memberships" routerLinkActive="bg-teal-50 text-teal-600"
           class="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-300 group">
          <div class="flex items-center gap-3">
            <lucide-icon [name]="UserCheck" [size]="18"></lucide-icon>
            <span class="font-medium">Memberships</span>
          </div>
          <lucide-icon [name]="ChevronRight" [size]="14" class="opacity-0 group-hover:opacity-100 transition-opacity"></lucide-icon>
        </a>

        <a routerLink="/admin/events" routerLinkActive="bg-teal-50 text-teal-600"
           class="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-300 group">
          <div class="flex items-center gap-3">
            <lucide-icon [name]="Calendar" [size]="18"></lucide-icon>
            <span class="font-medium">Events</span>
          </div>
          <lucide-icon [name]="ChevronRight" [size]="14" class="opacity-0 group-hover:opacity-100 transition-opacity"></lucide-icon>
        </a>

        <a routerLink="/admin/event-registrations" routerLinkActive="bg-teal-50 text-teal-600"
           class="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-300 group">
          <div class="flex items-center gap-3">
            <lucide-icon [name]="ClipboardList" [size]="18"></lucide-icon>
            <span class="font-medium">Registrations</span>
          </div>
          <lucide-icon [name]="ChevronRight" [size]="14" class="opacity-0 group-hover:opacity-100 transition-opacity"></lucide-icon>
        </a>

        <a routerLink="/admin/competitions" routerLinkActive="bg-teal-50 text-teal-600"
           class="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-300 group">
          <div class="flex items-center gap-3">
            <lucide-icon [name]="Trophy" [size]="18"></lucide-icon>
            <span class="font-medium">Competitions</span>
          </div>
          <lucide-icon [name]="ChevronRight" [size]="14" class="opacity-0 group-hover:opacity-100 transition-opacity"></lucide-icon>
        </a>

        <!-- People -->
        <p class="text-xs font-semibold text-muted-foreground px-3 pt-3 pb-1 uppercase tracking-widest">People</p>

        <a routerLink="/admin/students" routerLinkActive="bg-teal-50 text-teal-600"
           class="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-300 group">
          <div class="flex items-center gap-3">
            <lucide-icon [name]="BookOpen" [size]="18"></lucide-icon>
            <span class="font-medium">Students</span>
          </div>
          <lucide-icon [name]="ChevronRight" [size]="14" class="opacity-0 group-hover:opacity-100 transition-opacity"></lucide-icon>
        </a>

        <a routerLink="/admin/professors" routerLinkActive="bg-teal-50 text-teal-600"
           class="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-300 group">
          <div class="flex items-center gap-3">
            <lucide-icon [name]="GanttChart" [size]="18"></lucide-icon>
            <span class="font-medium">Professors</span>
          </div>
          <lucide-icon [name]="ChevronRight" [size]="14" class="opacity-0 group-hover:opacity-100 transition-opacity"></lucide-icon>
        </a>

        <!-- Internships & Certificates -->
        <p class="text-xs font-semibold text-muted-foreground px-3 pt-3 pb-1 uppercase tracking-widest">Careers</p>

        <a routerLink="/admin/internships" routerLinkActive="bg-teal-50 text-teal-600"
           class="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-300 group">
          <div class="flex items-center gap-3">
            <lucide-icon [name]="Briefcase" [size]="18"></lucide-icon>
            <span class="font-medium">Internships</span>
          </div>
          <lucide-icon [name]="ChevronRight" [size]="14" class="opacity-0 group-hover:opacity-100 transition-opacity"></lucide-icon>
        </a>

        <a routerLink="/admin/certificates" routerLinkActive="bg-teal-50 text-teal-600"
           class="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-300 group">
          <div class="flex items-center gap-3">
            <lucide-icon [name]="Award" [size]="18"></lucide-icon>
            <span class="font-medium">Certificates</span>
          </div>
          <lucide-icon [name]="ChevronRight" [size]="14" class="opacity-0 group-hover:opacity-100 transition-opacity"></lucide-icon>
        </a>

        <!-- Support -->
        <p class="text-xs font-semibold text-muted-foreground px-3 pt-3 pb-1 uppercase tracking-widest">Support</p>

        <a routerLink="/admin/claims" routerLinkActive="bg-teal-50 text-teal-600"
           class="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-300 group">
          <div class="flex items-center gap-3">
            <lucide-icon [name]="MessageSquare" [size]="18"></lucide-icon>
            <span class="font-medium">Claims</span>
          </div>
          <lucide-icon [name]="ChevronRight" [size]="14" class="opacity-0 group-hover:opacity-100 transition-opacity"></lucide-icon>
        </a>

        <div class="pt-4 mt-4 border-t border-border">
          <a routerLink="/admin/settings" routerLinkActive="bg-teal-50 text-teal-600"
             class="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-300 group">
            <div class="flex items-center gap-3">
              <lucide-icon [name]="Settings" [size]="18"></lucide-icon>
              <span class="font-medium">Settings</span>
            </div>
          </a>
        </div>
      </nav>

      <div class="p-4 border-t border-border">
        <a routerLink="/" class="flex items-center gap-3 p-3 text-destructive hover:bg-destructive/10 rounded-xl transition-all">
          <lucide-icon [name]="LogOut" [size]="18"></lucide-icon>
          <span class="font-medium">Exit Admin</span>
        </a>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  readonly LayoutDashboard = LayoutDashboard;
  readonly GraduationCap = GraduationCap;
  readonly Users = Users;
  readonly Calendar = Calendar;
  readonly Settings = Settings;
  readonly LogOut = LogOut;
  readonly ChevronRight = ChevronRight;
  readonly Trophy = Trophy;
  readonly Video = Video;
  readonly BookOpen = BookOpen;
  readonly HelpCircle = HelpCircle;
  readonly Award = Award;
  readonly Briefcase = Briefcase;
  readonly UserCheck = UserCheck;
  readonly GanttChart = GanttChart;
  readonly ClipboardList = ClipboardList;
  readonly MessageSquare = MessageSquare;
}
