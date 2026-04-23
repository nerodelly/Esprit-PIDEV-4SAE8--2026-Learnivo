import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';
import { PaginationComponent } from '../components/ui/pagination.component';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, PaginationComponent],
  templateUrl: './clubs.component.html',
})
export class ClubsComponent {
  readonly ArrowRightIcon = ArrowRight;

  clubs = [
    {
      id: 1,
      title: "English Conversation Club",
      icon: "💬",
      description: "Practice speaking with peers in a fun and supportive environment through interactive discussions.",
      image: "/images/club-1.jpg",
      slug: "english-conversation-club",
    },
    {
      id: 2,
      title: "Book & Storytelling Club",
      icon: "📚",
      description: "Improve reading skills and vocabulary by exploring books, short stories, and creative storytelling.",
      image: "/images/training-1.jpg",
      slug: "book-storytelling-club",
    },
    {
      id: 3,
      title: "Drama & Roleplay Club",
      icon: "🎭",
      description: "Boost confidence and pronunciation by acting out real-life scenarios and fun roleplays.",
      image: "/images/training-2.jpg",
      slug: "drama-roleplay-club",
    },
    {
      id: 4,
      title: "Writing & Grammar Club",
      icon: "✍️",
      description: "Enhance your writing skills with engaging exercises, feedback, and grammar tips.",
      image: "/images/training-3.jpg",
      slug: "writing-grammar-club",
    },
  ];

  currentPage = signal(1);

  onPageChange(page: number) {
    this.currentPage.set(page);
  }
}
