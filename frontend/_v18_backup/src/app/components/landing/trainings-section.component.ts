import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-trainings-section',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './trainings-section.component.html',
})
export class TrainingsSectionComponent {
  readonly ArrowRightIcon = ArrowRight;

  trainings = [
    {
      id: 1,
      title: 'Speak Fluent English in 30 Days',
      type: 'Blended training',
      price: '350',
      image: '/images/training-1.jpg',
      slug: 'speak-fluent-english',
    },
    {
      id: 2,
      title: 'English Writing Masterclass: From Beginner to Pro!',
      type: 'Live classes',
      price: '369',
      image: '/images/training-2.jpg',
      slug: 'english-writing-masterclass',
    },
    {
      id: 3,
      title: 'Accent Makeover: Sound Like a Native',
      type: 'Live classes',
      price: '1,400',
      image: '/images/training-3.jpg',
      slug: 'accent-makeover',
    },
  ];
}
