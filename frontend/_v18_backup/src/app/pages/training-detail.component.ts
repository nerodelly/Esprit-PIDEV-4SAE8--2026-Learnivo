import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Play, ChevronDown, ChevronRight, Square, CheckSquare } from 'lucide-angular';

@Component({
  selector: 'app-training-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './training-detail.component.html',
})
export class TrainingDetailComponent implements OnInit {
  readonly PlayIcon = Play;
  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronRightIcon = ChevronRight;
  readonly SquareIcon = Square;
  readonly CheckSquareIcon = CheckSquare;

  trainingData: Record<string, any> = {
    "speak-fluent-english": {
      title: "English for adults",
      banner: "/images/course-banner.jpg",
      chapters: [
        {
          name: "Chapter Name",
          number: 1,
          sections: [
            { name: "Section name", completed: false },
            { name: "Section name", completed: false },
            { name: "Section name", completed: true },
            { name: "Resume du chapitre", completed: false },
            { name: "Quiz", completed: false },
          ],
        },
        { name: "Web Development", number: 2, sections: [] },
        { name: "Digital Marketing", number: 3, sections: [] },
        { name: "Chapter Title", number: 4, sections: [] },
        { name: "Long chapter title", number: 5, sections: [] },
      ],
    },
  };

  training = signal<any>(null);
  expandedChapter = signal<number>(0);

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      this.training.set(this.trainingData[slug] || this.trainingData['speak-fluent-english']);
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
