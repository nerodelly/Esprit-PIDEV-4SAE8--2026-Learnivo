import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Star } from 'lucide-angular';

@Component({
  selector: 'app-feedback-section',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './feedback-section.component.html',
})
export class FeedbackSectionComponent {
  readonly StarIcon = Star;

  feedbacks = [
    {
      name: 'Sarah Thompson',
      image: '/images/instructor-2.jpg',
      text: 'Jungle in English completely transformed my speaking skills. The interactive sessions and supportive community made all the difference. I went from being nervous to confidently presenting at work in English!',
      rating: 5,
    },
    {
      name: 'Omar Bouazizi',
      image: '/images/instructor-1.jpg',
      text: 'The workshops and clubs are incredibly well-organized. Thanks to Jungle in English, I was able to pass my IELTS with a band score of 7.5! The trainers are fantastic and very patient.',
      rating: 5,
    },
  ];

  getArray(length: number): any[] {
    return new Array(length);
  }
}
