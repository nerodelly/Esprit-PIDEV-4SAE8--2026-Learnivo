import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Settings, Save, Shield, Bell, User } from 'lucide-angular';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-extrabold tracking-tight">Platform <span class="text-teal-600 underline decoration-2 underline-offset-4">Settings</span></h1>
        <p class="text-muted-foreground">Configure global platform parameters and security settings.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Settings Nav -->
        <div class="space-y-2">
          <button class="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-border shadow-sm text-teal-600 font-bold">
            <lucide-icon [name]="Settings" [size]="18"></lucide-icon>
            General Configuration
          </button>
          <button class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all text-muted-foreground font-medium">
            <lucide-icon [name]="Shield" [size]="18"></lucide-icon>
            Security & Access
          </button>
          <button class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all text-muted-foreground font-medium">
            <lucide-icon [name]="Bell" [size]="18"></lucide-icon>
            Notifications
          </button>
        </div>

        <!-- Settings Content -->
        <div class="md:col-span-2 space-y-6">
          <div class="bg-white rounded-3xl border border-border shadow-sm p-8 space-y-6">
            <div class="space-y-4">
              <h3 class="text-lg font-bold border-b border-border pb-2">Global Parameters</h3>
              
              <div class="grid gap-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium">Platform Name</label>
                  <input type="text" value="Learnivo" class="w-full p-3 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-teal-600 outline-none transition-all">
                </div>
                
                <div class="space-y-2">
                  <label class="text-sm font-medium">Admin Email Notifications</label>
                  <input type="email" value="admin@learnivo.com" class="w-full p-3 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-teal-600 outline-none transition-all">
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3">
               <button class="px-6 py-2 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-all">Cancel</button>
               <button class="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-600/20 active:scale-95">
                 <lucide-icon [name]="Save" [size]="18"></lucide-icon>
                 Save Changes
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminSettingsComponent {
  readonly Settings = Settings;
  readonly Shield = Shield;
  readonly Bell = Bell;
  readonly User = User;
  readonly Save = Save;
}
