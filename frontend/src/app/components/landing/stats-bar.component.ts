import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-bar.component.html',
})
export class StatsBarComponent {
  stats = [
    { value: '200K+', label: 'Students' },
    { value: '10K+', label: 'Hours of training' },
    { value: '50+', label: 'Instructors' },
    { value: '80K+', label: 'Success stories' },
  ];
}
