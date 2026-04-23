import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './pages/home.component';
import { TrainingsComponent } from './pages/trainings.component';
import { TrainingDetailComponent } from './pages/training-detail.component';
import { ChapterDetailComponent } from './pages/chapter-detail.component';
import { ClubsComponent } from './pages/clubs.component';
import { ClubDetailComponent } from './pages/club-detail.component';
import { EventsComponent } from './pages/events.component';
import { EventDetailComponent } from './pages/event-detail.component';
import { CertificateComponent } from './pages/certificate.component';
import { CompetitionsComponent } from './pages/competitions.component';
import { CompetitionDetailComponent } from './pages/competition-detail.component';
import { ClassesComponent } from './pages/classes.component';
import { InternshipsComponent } from './pages/internships.component';
import { ClaimsComponent } from './pages/claims.component';

import { AdminLayoutComponent } from './components/admin/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { AdminTrainingsComponent } from './pages/admin/admin-trainings.component';
import { AdminClubsComponent } from './pages/admin/admin-clubs.component';
import { AdminEventsComponent } from './pages/admin/admin-events.component';
import { AdminCompetitionsComponent } from './pages/admin/admin-competitions.component';
import { AdminClassesComponent } from './pages/admin/admin-classes.component';
import { AdminSettingsComponent } from './pages/admin/admin-settings.component';
import { AdminQuizzesComponent } from './pages/admin/admin-quizzes.component';
import { AdminQuizCreateComponent } from './pages/admin/admin-quiz-create.component';
import { AdminQuizEditComponent } from './pages/admin/admin-quiz-edit.component';
import { AdminCourseCreateComponent } from './pages/admin/admin-course-create.component';
import { AdminCourseEditComponent } from './pages/admin/admin-course-edit.component';
import { AdminInternshipsComponent } from './pages/admin/admin-internships.component';
import { AdminCertificatesComponent } from './pages/admin/admin-certificates.component';
import { AdminClubMembershipsComponent } from './pages/admin/admin-club-memberships.component';
import { AdminEventRegistrationsComponent } from './pages/admin/admin-event-registrations.component';
import { AdminProfessorsComponent } from './pages/admin/admin-professors.component';
import { AdminStudentsComponent } from './pages/admin/admin-students.component';
import { AdminClaimsComponent } from './pages/admin/admin-claims.component';

export const routes: Routes = [
    // Auth handled by Keycloak
    { path: 'login', redirectTo: '', pathMatch: 'full' },
    { path: 'auth/sign-in', redirectTo: '', pathMatch: 'full' },
    { path: 'register', redirectTo: '', pathMatch: 'full' },
    { path: 'auth/register', redirectTo: '', pathMatch: 'full' },

    // Public pages
    { path: '', component: HomeComponent },
    { path: 'trainings', component: TrainingsComponent },
    { path: 'trainings/:slug', component: TrainingDetailComponent },
    { path: 'trainings/:slug/:chapterId', component: ChapterDetailComponent },
    { path: 'clubs', component: ClubsComponent },
    { path: 'clubs/:slug', component: ClubDetailComponent },
    { path: 'events', component: EventsComponent },
    { path: 'events/:slug', component: EventDetailComponent },
    { path: 'competitions', component: CompetitionsComponent },
    { path: 'competitions/:slug', component: CompetitionDetailComponent },
    { path: 'classes', component: ClassesComponent },
    { path: 'internships', component: InternshipsComponent },
    { path: 'claims', component: ClaimsComponent },
    { path: 'certificate', component: CertificateComponent },

    // Admin Routes
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] },
        children: [
            { path: '', component: AdminDashboardComponent },
            { path: 'trainings', component: AdminTrainingsComponent },
            { path: 'clubs', component: AdminClubsComponent },
            { path: 'club-memberships', component: AdminClubMembershipsComponent },
            { path: 'events', component: AdminEventsComponent },
            { path: 'event-registrations', component: AdminEventRegistrationsComponent },
            { path: 'competitions', component: AdminCompetitionsComponent },
            { path: 'classes', component: AdminClassesComponent },
            { path: 'professors', component: AdminProfessorsComponent },
            { path: 'students', component: AdminStudentsComponent },
            { path: 'quizzes', component: AdminQuizzesComponent },
            { path: 'quizzes/new', redirectTo: 'quizzes/create', pathMatch: 'full' },
            { path: 'quizzes/create', component: AdminQuizCreateComponent },
            { path: 'quizzes/:id/edit', component: AdminQuizEditComponent },
            { path: 'courses/create', component: AdminCourseCreateComponent },
            { path: 'courses/:id/edit', component: AdminCourseEditComponent },
            { path: 'internships', component: AdminInternshipsComponent },
            { path: 'certificates', component: AdminCertificatesComponent },
            { path: 'claims', component: AdminClaimsComponent },
            { path: 'settings', component: AdminSettingsComponent },
        ]
    }
];
