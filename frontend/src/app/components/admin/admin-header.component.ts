import { Component, inject } from '@angular/core';
import { Search, Bell, LogOut, Search as SearchIcon } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <header class="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="relative hidden md:block">
          <lucide-icon [name]="SearchIcon" [size]="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></lucide-icon>
          <input type="text" placeholder="Global search..." 
                 class="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#009689]/20 focus:border-[#009689] outline-none transition-all w-72">
        </div>
      </div>

      <div class="flex items-center gap-6">
        <!-- Notifications -->
        <button class="relative p-2 text-gray-400 hover:text-[#009689] hover:bg-teal-50 rounded-xl transition-all">
          <lucide-icon [name]="Bell" [size]="20"></lucide-icon>
          <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div class="h-6 w-px bg-gray-200"></div>
        
        <!-- User Profile & Logout -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3 pr-2">
            <div class="text-right hidden sm:block">
              <p class="text-sm font-bold text-gray-900 leading-tight">{{ user?.name || 'Admin User' }}</p>
              <p class="text-[10px] font-semibold text-[#009689] uppercase tracking-wider">{{ user?.role || 'SYSTEM ADMIN' }}</p>
            </div>
            <!-- Dynamic Profile Picture -->
            <img [src]="avatarUrl" alt="Profile" 
                 class="w-10 h-10 rounded-xl border-2 border-[#009689]/10 p-0.5 object-cover bg-teal-50">
          </div>

          <button (click)="logout()" 
                  class="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 font-bold text-xs">
            <lucide-icon [name]="LogOut" [size]="16"></lucide-icon>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  `
})
export class AdminHeaderComponent {
  private authService = inject(AuthService);
  
  readonly SearchIcon = Search;
  readonly Bell = Bell;
  readonly LogOut = LogOut;

  get user() {
    return this.authService.getCurrentUser();
  }

  get avatarUrl() {
    const email = this.user?.email || 'admin@learnivo.com';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}&backgroundColor=c0aede`;
  }

  logout() {
    if (confirm('Are you sure you want to log out of the admin panel?')) {
      this.authService.logout();
    }
  }
}
