import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/layout/navbar.component';
import { FooterComponent } from './components/layout/footer.component';
import { NotificationToastComponent } from './components/admin/notification-toast.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, NotificationToastComponent, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  router = inject(Router);

  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
