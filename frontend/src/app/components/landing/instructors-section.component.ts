import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-instructors-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instructors-section.component.html',
})
export class InstructorsSectionComponent {
  instructors = [
    {
      name: 'John Richards',
      title: 'Senior English Instructor',
      image: '/images/instructor-1.jpg',
    },
    {
      name: 'Emma Martinez',
      title: 'Communication Specialist',
      image: '/images/instructor-2.jpg',
    },
    {
      name: 'Alex Turner',
      title: 'IELTS & TOEFL Expert',
      image: '/images/instructor-3.jpg',
    },
  ];
}
