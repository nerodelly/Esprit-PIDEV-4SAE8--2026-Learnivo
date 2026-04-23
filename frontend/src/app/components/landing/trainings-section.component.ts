import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-trainings-section',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './trainings-section.component.html',
})
export class TrainingsSectionComponent {
  data = inject(DataService);
  readonly ArrowRightIcon = ArrowRight;

  get trainings() {
    return this.data.trainings().slice(0, 3);
  }
}
