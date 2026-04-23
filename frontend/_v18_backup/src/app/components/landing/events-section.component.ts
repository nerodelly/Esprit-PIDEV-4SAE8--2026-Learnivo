import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowRight, MapPin, Clock } from 'lucide-angular';

@Component({
  selector: 'app-events-section',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './events-section.component.html',
})
export class EventsSectionComponent {
  readonly ArrowRightIcon = ArrowRight;
  readonly MapPinIcon = MapPin;
  readonly ClockIcon = Clock;

  events = [
    {
      id: 1,
      title: 'Freelancer & Entrepreneur Networking Night',
      date: '12 Jan, 2025',
      location: 'Technopole, Sousse, Tunisia',
      time: 'from 11:00 am to 18:30 pm',
      image: '/images/event-1.jpg',
      badge: 'Past event',
      slug: 'freelancer-networking-night',
    },
    {
      id: 2,
      title: 'Mastering Contracts Workshop and Publishing Industries',
      date: '12 Jan, 2025',
      location: 'Technopole, Sousse, Tunisia',
      time: 'from 11:00 am to 18:30 pm',
      image: '/images/training-1.jpg',
      badge: 'Past event',
      slug: 'mastering-contracts-workshop',
    },
    {
      id: 3,
      title: 'Skill Up: Online Workshop Series',
      date: '12 Jan, 2025',
      location: 'Technopole, Sousse, Tunisia',
      time: 'from 11:00 am to 18:30 pm',
      image: '/images/training-2.jpg',
      badge: 'Next event',
      slug: 'skill-up-online-workshop',
    },
  ];
}
