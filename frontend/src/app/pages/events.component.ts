import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, Clock } from 'lucide-angular';
import { PaginationComponent } from '../components/ui/pagination.component';
import { DataService, PlatformEvent } from '../services/data.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, PaginationComponent],
  templateUrl: './events.component.html',
})
export class EventsComponent {
  data = inject(DataService);

  readonly MapPinIcon = MapPin;
  readonly ClockIcon = Clock;

  tabs = ["All", "Today", "Past event", "Next event"];
  activeTab = signal('All');
  currentPage = signal(1);

  filteredEvents = computed(() => {
    const tab = this.activeTab();
    const events = this.data.events();
    if (tab === "All") return events;
    if (tab === "Today") return [];
    return events.filter((e) => e.badge === tab);
  });

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }
}
