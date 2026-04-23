import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule, Calendar, Clock, MapPin, CheckSquare, Play } from 'lucide-angular';
import { DataService, PlatformEvent } from '../services/data.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './event-detail.component.html',
})
export class EventDetailComponent implements OnInit {
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);

  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly MapPinIcon = MapPin;
  readonly CheckSquareIcon = CheckSquare;
  readonly PlayIcon = Play;

  event = signal<PlatformEvent | null>(null);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      const found = this.dataService.events().find(e => e.slug === slug);
      this.event.set(found || this.dataService.events()[0]);
    });
  }
}
