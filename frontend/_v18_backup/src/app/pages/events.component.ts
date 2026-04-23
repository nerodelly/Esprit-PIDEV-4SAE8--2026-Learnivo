import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, Clock } from 'lucide-angular';
import { PaginationComponent } from '../components/ui/pagination.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, PaginationComponent],
  templateUrl: './events.component.html',
})
export class EventsComponent {
  readonly MapPinIcon = MapPin;
  readonly ClockIcon = Clock;

  allEvents = [
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
      image: '/images/event-3.jpg',
      badge: 'Next event',
      slug: 'skill-up-online-workshop',
    },
    {
      id: 4,
      title: 'English Conversation Cafe',
      date: '12 Jan, 2025',
      location: 'Technopole, Sousse, Tunisia',
      time: 'from 11:00 am to 18:30 pm',
      image: '/images/event-2.jpg',
      badge: 'Past event',
      slug: 'english-conversation-cafe',
    },
    {
      id: 5,
      title: 'Accent & Pronunciation Workshop',
      date: '12 Jan, 2025',
      location: 'Technopole, Sousse, Tunisia',
      time: 'from 11:00 am to 18:30 pm',
      image: '/images/training-2.jpg',
      badge: 'Past event',
      slug: 'accent-pronunciation-workshop',
    },
    {
      id: 6,
      title: 'Enhance your professional communication skills in English',
      date: '12 Jan, 2025',
      location: 'Technopole, Sousse, Tunisia',
      time: 'from 11:00 am to 18:30 pm',
      image: '/images/training-3.jpg',
      badge: 'Past event',
      slug: 'professional-communication-skills',
    },
  ];

  tabs = ["All", "Today", "Past event", "Next event"];
  activeTab = signal('All');
  currentPage = signal(1);

  filteredEvents = computed(() => {
    const tab = this.activeTab();
    if (tab === "All") return this.allEvents;
    if (tab === "Today") return [];
    return this.allEvents.filter((e) => e.badge === tab);
  });

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }
}
