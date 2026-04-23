import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Menu, X, User, Phone, Globe } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  mobileOpen = false;

  readonly MenuIcon = Menu;
  readonly XIcon = X;
  readonly UserIcon = User;
  readonly PhoneIcon = Phone;
  readonly GlobeIcon = Globe;

  navLinks = [
    { href: '/', label: 'About' },
    { href: '/trainings', label: 'Training' },
    { href: '/clubs', label: 'Clubs' },
    { href: '/events', label: 'Events' },
  ];

  constructor(public router: Router) { }

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
  }

  isCurrentRoute(href: string): boolean {
    return this.router.url === href;
  }
}
