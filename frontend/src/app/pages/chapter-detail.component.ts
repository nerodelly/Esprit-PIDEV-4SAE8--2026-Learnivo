import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Play } from 'lucide-angular';

@Component({
  selector: 'app-chapter-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './chapter-detail.component.html',
})
export class ChapterDetailComponent implements OnInit {
  readonly PlayIcon = Play;

  tabs = ["About", "Content", "Annexes", "Forum"];
  activeTab = signal('About');

  params = signal<{ slug: string; chapterId: string } | null>(null);

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.params.set({
        slug: params['slug'],
        chapterId: params['chapterId']
      });
    });
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }
}
