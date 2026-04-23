import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { AdminHeaderComponent } from './admin-header.component';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [RouterOutlet, SidebarComponent, AdminHeaderComponent],
    template: `
    <div class="min-h-screen bg-[#f8fafc]">
      <app-sidebar></app-sidebar>
      <div class="pl-64 flex flex-col min-h-screen">
        <app-admin-header></app-admin-header>
        <main class="flex-1 p-8">
            <div class="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <router-outlet></router-outlet>
            </div>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent { }
