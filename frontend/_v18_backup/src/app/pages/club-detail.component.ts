import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-club-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './club-detail.component.html',
})
export class ClubDetailComponent implements OnInit {
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;

  clubsData: Record<string, any> = {
    "english-conversation-club": {
      title: "English Conversation Club",
      icon: "💬",
      description: "Stay connected and inspired with our latest gatherings, workshops, and networking opportunities. Explore upcoming events and be part of a thriving community!",
      images: ["/images/club-1.jpg", "/images/training-1.jpg", "/images/training-2.jpg", "/images/training-3.jpg", "/images/event-1.jpg"],
    },
    "book-storytelling-club": {
      title: "Book & Storytelling Club",
      icon: "📚",
      description: "Improve reading skills and vocabulary by exploring books, short stories, and creative storytelling in an engaging group setting.",
      images: ["/images/training-1.jpg", "/images/club-1.jpg", "/images/training-3.jpg"],
    },
    "drama-roleplay-club": {
      title: "Drama & Roleplay Club",
      icon: "🎭",
      description: "Boost confidence and pronunciation by acting out real-life scenarios and fun roleplays in a supportive environment.",
      images: ["/images/training-2.jpg", "/images/event-1.jpg", "/images/club-1.jpg"],
    },
    "writing-grammar-club": {
      title: "Writing & Grammar Club",
      icon: "✍️",
      description: "Enhance your writing skills with engaging exercises, feedback, and grammar tips from experienced instructors.",
      images: ["/images/training-3.jpg", "/images/training-1.jpg", "/images/training-2.jpg"],
    },
  };

  club = signal<any>(null);
  currentImage = signal(0);

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      this.club.set(this.clubsData[slug] || this.clubsData['english-conversation-club']);
    });
  }

  prev() {
    const images = this.club().images;
    this.currentImage.update(i => (i > 0 ? i - 1 : images.length - 1));
  }

  next() {
    const images = this.club().images;
    this.currentImage.update(i => (i < images.length - 1 ? i + 1 : 0));
  }

  setCurrentImage(i: number) {
    this.currentImage.set(i);
  }
}
