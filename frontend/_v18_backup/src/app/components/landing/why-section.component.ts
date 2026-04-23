import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle, Users, Award } from 'lucide-angular';

@Component({
  selector: 'app-why-section',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './why-section.component.html',
})
export class WhySectionComponent {
  readonly CheckCircleIcon = CheckCircle;
  readonly UsersIcon = Users;
  readonly AwardIcon = Award;

  reasons = [
    {
      icon: this.CheckCircleIcon,
      title: 'Certified Trainers',
      description: 'All our instructors are certified English teachers with years of experience.',
    },
    {
      icon: this.UsersIcon,
      title: 'Fun & Interactive',
      description: 'We use innovative teaching methods that make learning English an engaging experience.',
    },
    {
      icon: this.AwardIcon,
      title: 'Proven Track Record',
      description: 'Join thousands of satisfied students who have achieved their language goals.',
    },
  ];
}
