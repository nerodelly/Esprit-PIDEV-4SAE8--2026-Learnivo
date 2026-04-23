import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-clubs-section',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './clubs-section.component.html',
})
export class ClubsSectionComponent {
  readonly ArrowRightIcon = ArrowRight;

  clubs = [
    { id: 1, name: 'English Conversation Club', image: '/images/club-1.jpg', slug: 'english-conversation-club' },
    { id: 2, name: 'Book & Storytelling Club', image: '/images/training-1.jpg', slug: 'book-storytelling-club' },
    { id: 3, name: 'Drama & Roleplay Club', image: '/images/training-2.jpg', slug: 'drama-roleplay-club' },
    { id: 4, name: 'Writing & Grammar Club', image: '/images/training-3.jpg', slug: 'writing-grammar-club' },
  ];
}
