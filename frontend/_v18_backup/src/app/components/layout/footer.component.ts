import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  socialLinks = [
    { label: 'X', href: '#' },
    { label: 'IG', href: '#' },
    { label: 'in', href: '#' },
    { label: 'f', href: '#' },
  ];

  usefulLinks = [
    { label: 'Trainings', href: '/trainings' },
    { label: 'Events', href: '/events' },
    { label: 'Clubs', href: '/clubs' },
    { label: 'Feedbacks', href: '#' },
    { label: 'Instructors', href: '#' },
  ];
}
