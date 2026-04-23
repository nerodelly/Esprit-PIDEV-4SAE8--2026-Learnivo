import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-clubs-section',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './clubs-section.component.html',
})
export class ClubsSectionComponent {
  data = inject(DataService);
  readonly ArrowRightIcon = ArrowRight;

  get clubs() {
    return this.data.clubs().slice(0, 3);
  }
}
