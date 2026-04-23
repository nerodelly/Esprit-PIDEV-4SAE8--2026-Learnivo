import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionComponent } from '../components/landing/hero-section.component';
import { StatsBarComponent } from '../components/landing/stats-bar.component';
import { TrainingsSectionComponent } from '../components/landing/trainings-section.component';
import { ClubsSectionComponent } from '../components/landing/clubs-section.component';
import { EventsSectionComponent } from '../components/landing/events-section.component';
import { WhySectionComponent } from '../components/landing/why-section.component';
import { FeedbackSectionComponent } from '../components/landing/feedback-section.component';
import { InstructorsSectionComponent } from '../components/landing/instructors-section.component';
import { ContactSectionComponent } from '../components/landing/contact-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    StatsBarComponent,
    TrainingsSectionComponent,
    ClubsSectionComponent,
    EventsSectionComponent,
    WhySectionComponent,
    FeedbackSectionComponent,
    InstructorsSectionComponent,
    ContactSectionComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent { }
