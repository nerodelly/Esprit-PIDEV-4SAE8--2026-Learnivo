import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';
import { DataService, Club } from '../services/data.service';

@Component({
  selector: 'app-club-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './club-detail.component.html',
})
export class ClubDetailComponent implements OnInit {
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);

  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;

  club = signal<Club | null>(null);
  currentImage = signal(0);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      const found = this.dataService.clubs().find(c => c.slug === slug);
      this.club.set(found || this.dataService.clubs()[0]);
    });
  }

  prev() {
    const club = this.club();
    if (!club || !club.images) return;
    const images = club.images;
    this.currentImage.update(i => (i > 0 ? i - 1 : images.length - 1));
  }

  next() {
    const club = this.club();
    if (!club || !club.images) return;
    const images = club.images;
    this.currentImage.update(i => (i < images.length - 1 ? i + 1 : 0));
  }

  setCurrentImage(i: number) {
    this.currentImage.set(i);
  }
}
