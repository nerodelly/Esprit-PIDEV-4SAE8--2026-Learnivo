import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';
import { PaginationComponent } from '../components/ui/pagination.component';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, PaginationComponent],
  templateUrl: './clubs.component.html',
})
export class ClubsComponent {
  data = inject(DataService);
  readonly ArrowRightIcon = ArrowRight;

  get clubs() {
    return this.data.clubs();
  }

  currentPage = signal(1);

  onPageChange(page: number) {
    this.currentPage.set(page);
  }
}
