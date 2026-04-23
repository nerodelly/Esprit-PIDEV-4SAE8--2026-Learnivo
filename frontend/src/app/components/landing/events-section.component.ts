import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, Clock, ArrowRight } from 'lucide-angular';
import { DataService, PlatformEvent } from '../../services/data.service';

@Component({
  selector: 'app-events-section',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './events-section.component.html',
})
export class EventsSectionComponent {
  data = inject(DataService);

  readonly MapPinIcon = MapPin;
  readonly ClockIcon = Clock;
  readonly ArrowRightIcon = ArrowRight;

  get events() {
    return this.data.events().slice(0, 3);
  }
}
