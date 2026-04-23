import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Play, ChevronDown, ChevronRight, Square, CheckSquare } from 'lucide-angular';
import { DataService, Training } from '../services/data.service';

@Component({
  selector: 'app-training-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './training-detail.component.html',
})
export class TrainingDetailComponent implements OnInit {
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);

  readonly PlayIcon = Play;
  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronRightIcon = ChevronRight;
  readonly SquareIcon = Square;
  readonly CheckSquareIcon = CheckSquare;

  training = signal<Training | null>(null);
  expandedChapter = signal<number>(0);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      const found = this.dataService.trainings().find(t => t.slug === slug);
      this.training.set(found || this.dataService.trainings()[0]);
    });
  }

  toggleChapter(index: number) {
    if (this.expandedChapter() === index) {
      this.expandedChapter.set(-1);
    } else {
      this.expandedChapter.set(index);
    }
  }
}
