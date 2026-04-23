import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { TrainingsComponent } from './pages/trainings.component';
import { TrainingDetailComponent } from './pages/training-detail.component';
import { ChapterDetailComponent } from './pages/chapter-detail.component';
import { ClubsComponent } from './pages/clubs.component';
import { ClubDetailComponent } from './pages/club-detail.component';
import { EventsComponent } from './pages/events.component';
import { EventDetailComponent } from './pages/event-detail.component';
import { CertificateComponent } from './pages/certificate.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'trainings', component: TrainingsComponent },
    { path: 'trainings/:slug', component: TrainingDetailComponent },
    { path: 'trainings/:slug/:chapterId', component: ChapterDetailComponent },
    { path: 'clubs', component: ClubsComponent },
    { path: 'clubs/:slug', component: ClubDetailComponent },
    { path: 'events', component: EventsComponent },
    { path: 'events/:slug', component: EventDetailComponent },
    { path: 'certificate', component: CertificateComponent },
];
