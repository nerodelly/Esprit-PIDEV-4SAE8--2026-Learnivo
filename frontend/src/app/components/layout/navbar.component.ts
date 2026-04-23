import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Menu, X, User, Phone, Globe, LogOut } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  mobileOpen = false;
  userMenuOpen = false;

  readonly MenuIcon = Menu;
  readonly XIcon = X;
  readonly UserIcon = User;
  readonly PhoneIcon = Phone;
  readonly GlobeIcon = Globe;
  readonly LogOutIcon = LogOut;

  private allNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/trainings', label: 'Training' },
    { href: '/clubs', label: 'Clubs' },
    { href: '/events', label: 'Events' },
    { href: '/competitions', label: 'Competitions' },
    { href: '/classes', label: 'Classes' },
    { href: '/internships', label: 'Internships' },
    { href: '/claims', label: 'Claims' },
    { href: '/admin', label: 'Admin Dashboard', adminOnly: true },
  ];

  constructor(
    public router: Router,
    private authService: AuthService,
    private keycloak: KeycloakService
  ) { }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get userName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || 'User';
  }

  get isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  get isProfessor(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'PROFESSOR';
  }

  get navLinks() {
    return this.allNavLinks.filter(link => {
      if (link.adminOnly && !this.isAdmin) return false;
      // You can add professor-only logic here if needed
      return true;
    });
  }

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  isCurrentRoute(href: string): boolean {
    return this.router.url === href;
  }

  logout(): void {
    this.authService.logout();
  }
}
