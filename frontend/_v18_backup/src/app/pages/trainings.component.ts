import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, ArrowRight } from 'lucide-angular';
import { PaginationComponent } from '../components/ui/pagination.component';

@Component({
  selector: 'app-trainings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule, PaginationComponent],
  templateUrl: './trainings.component.html',
})
export class TrainingsComponent {
  readonly SearchIcon = Search;
  readonly ArrowRightIcon = ArrowRight;

  allTrainings = [
    {
      id: 1,
      title: "Speak Fluent English in 30 Days - No Boring Grammar Rules!",
      description: "Struggling to speak confidently? This course ditches complex grammar drills and focuses on real-world conversations. Learn the phrases, pronunciation hacks, and confidence tricks that native speak...",
      type: "Blended training",
      level: "Beginner",
      price: 350,
      image: "/images/training-1.jpg",
      slug: "speak-fluent-english",
      action: "Purchase",
    },
    {
      id: 2,
      title: "The Ultimate English Writing Masterclass: From Beginner to Pro!",
      description: "Want to write like a pro? Whether it's emails, essays, or creative stories, this course teaches you the secrets of powerful writing - structure, vocabulary, and style - so your words stand out every time.",
      type: "Live classes",
      level: "Mid-level",
      price: 369,
      image: "/images/training-2.jpg",
      slug: "english-writing-masterclass",
      action: "Book your place",
    },
    {
      id: 3,
      title: "Accent Makeover: Sound Like a Native in Just Weeks!",
      description: "Tired of being misunderstood? Learn pronunciation hacks, rhythm, and intonation that will instantly improve your accent. Whether it's American, British, or neutral English, this course will help you speak...",
      type: "Live classes",
      level: "Advanced",
      price: 1400,
      image: "/images/training-3.jpg",
      slug: "accent-makeover",
      action: "Purchase",
    },
    {
      id: 4,
      title: "Master English for Work: Speak, Write & Impress Like a Pro!",
      description: "Want to ace interviews, meetings, and emails in English? This course gives you business communication skills to sound professional and confident - so you can land jobs, close deals, and sta...",
      type: "Blended training",
      level: "Beginner",
      price: 450,
      image: "/images/event-1.jpg",
      slug: "master-english-for-work",
      action: "Purchase",
    },
  ];

  search = signal('');
  typeFilter = signal('All');
  levelFilters = signal<string[]>([]);
  priceRange = signal(2000);
  currentPage = signal(1);

  types = ["All", "Blended", "Live"];
  levels = ["Beginner", "Mid-level", "Advanced"];

  filteredTrainings = computed(() => {
    return this.allTrainings.filter((t) => {
      if (this.search() && !t.title.toLowerCase().includes(this.search().toLowerCase())) return false;
      if (this.typeFilter() === "Blended" && t.type !== "Blended training") return false;
      if (this.typeFilter() === "Live" && t.type !== "Live classes") return false;
      if (this.levelFilters().length > 0 && !this.levelFilters().includes(t.level)) return false;
      if (t.price > this.priceRange()) return false;
      return true;
    });
  });

  toggleLevel(level: string) {
    const currentFilters = this.levelFilters();
    if (currentFilters.includes(level)) {
      this.levelFilters.set(currentFilters.filter((l) => l !== level));
    } else {
      this.levelFilters.set([...currentFilters, level]);
    }
  }

  resetFilters() {
    this.search.set('');
    this.typeFilter.set('All');
    this.levelFilters.set([]);
    this.priceRange.set(2000);
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }
}
