import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { NotificationService } from './notification.service';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Training {
  id: number | string; title: string; description: string; type: TrainingType;
  level: string; price: number; image: string; slug: string; action: string;
  instructor?: string; category?: string; chapters?: number; duration?: string;
  banner?: string; aiScore?: number; status?: TrainingStatus;
  chaptersData?: { name: string; number: number; sections: { name: string; completed: boolean }[] }[];
}
export interface Club {
  id: number | string; name: string; icon: string; description: string;
  image: string; slug: string; members?: number; images?: string[];
}
export interface PlatformEvent {
  id: number | string; title: string; description: string; date: string;
  location: string; time: string; image: string; badge: string; slug: string;
  type?: 'past' | 'next'; overview?: string; expectations?: string[]; album?: string[];
}
export interface Participant {
  id: number | string; name: string; email: string;
  phone?: string; motivation?: string;
  registeredAt: string;
  score?: number; errorsCount?: number; status: 'registered' | 'disqualified' | 'winner';
  submissionUrl?: string; submissionNotes?: string; submittedAt?: string;
}
export interface CompetitionRound {
  name: string; startDate: string; endDate: string;
  status: 'pending' | 'active' | 'done';
}
export interface Competition {
  id: number | string; title: string; description: string; image: string;
  slug: string; status: 'upcoming' | 'ongoing' | 'completed';
  startDate?: string; deadline: string; prize: string; category: string; tags?: string[];
  maxParticipants?: number; participants?: Participant[];
  rounds?: CompetitionRound[]; rules?: string; resultsPublished?: boolean;
}
export interface VoteStats {
  likes: number; dislikes: number; score: number; userVote: 'LIKE' | 'DISLIKE' | null;
}
export interface Announcement {
  id: number; competitionId: number; title: string; content: string;
  type: 'INFO' | 'REMINDER' | 'RESULT' | 'ALERT'; createdAt: string;
}
export interface CompetitionRanking {
  competitionId: number; title: string; category: string; prize: string;
  image: string; slug: string; status: string; likes: number; dislikes: number;
  score: number; participantCount: number; rank: number;
}
export interface ExerciseTask {
  question: string; options: string[]; correctIndex: number; explanation: string;
}
export interface Exercise {
  id: number; title: string; category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string; points: number; icon: string; estimatedMinutes: number;
  tasks: ExerciseTask[];
}
export interface RecommendationProfile {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  dominantCategory: string;
  historyCategories: string[];
  weakestCategory: string | null;
  strengths: string[];
  accuracy: number;
  totalScore: number;
  totalErrors: number;
  participatedCount: number;
  completedCount: number;
  recommendedCompetitions: Competition[];
  recommendedExercises: Exercise[];
  recommendedContent: (Training & { aiScore: number })[];
}
export interface AttendanceRecord { date: string; attendees: (string | number)[]; }
export interface EnrolledStudent { id: number | string; name: string; email: string; enrolledAt: string; }
export interface ClassMaterial { title: string; url: string; type: 'pdf' | 'video' | 'link' | 'slide'; }
export interface PlatformClass {
  id: number | string; title: string; instructor: string; day: string;
  time: string; duration: string; level: string; type: string; link?: string;
  status: 'active' | 'cancelled' | 'full'; maxCapacity?: number;
  enrolled?: EnrolledStudent[]; attendance?: AttendanceRecord[];
  materials?: ClassMaterial[]; recurring?: boolean; notes?: string;
}

// ─── Extra interfaces from merged branches ───────────────────────────────────

export type TrainingType = 'Blended course' | 'Live classes';
export type TrainingStatus = 'Published' | 'Draft';

export interface TrainingChapter {
  name: string; number: number; pdfUrl?: string;
  sections: { name: string; completed: boolean }[];
}

export interface Student { id: number | string; name: string; email: string; }
export interface Professor { id: number | string; name: string; email: string; }

export interface ClubMembership {
  id: number | string; joinedAt: string; status: string;
  clubId: number | string | null; studentId: number | string | null;
}

export interface EventRegistration {
  id: number | string; registeredAt: string; status: string;
  eventId: number | string | null | undefined;
  studentId: number | string | null | undefined;
  studentName?: string; eventTitle?: string; eventStartTime?: string;
}

export interface NextEventInfo { eventId: number; title: string; startTime: string; }

export interface AdminStudentFormData { name: string; email: string; }
export interface AdminProfessorFormData { name: string; email: string; }
export interface AdminClubMembershipFormData {
  status: string; clubId: number | null; studentId: number | null; joinedAt?: string;
}
export interface AdminEventRegistrationFormData {
  status: string; eventId: number | null; studentId: number | null;
}
export interface AdminEventFormData {
  title: string; description: string; location: string; status: string;
  start: string; end: string; maxParticipants?: number;
  clubName?: string | null; publishAt?: string | null;
}
export interface AdminClubFormData {
  name: string; description: string; status: string; professorId?: number | null;
}

export interface Quiz {
  id: number | string; title: string; course: string; category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: number; duration: string; passScore: number;
  status: 'Draft' | 'Published' | 'Archived';
  publishAt?: string | null;
  items: QuizQuestion[];
}

export interface QuizQuestion {
  id: string; text: string; options: string[];
  correctAnswer: number; explanation: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  weight?: number;
}

export interface AdminNotification {
  id: number; title: string; message: string;
  createdAt: string; read: boolean; href?: string;
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────

function toClass(b: any): PlatformClass {
  return {
    id: b.id,
    title:       b.title       ?? b.titre      ?? '',
    instructor:  b.instructor  ?? b.instructeur ?? '',
    day:         b.day         ?? b.jour        ?? 'Monday',
    time:        b.time        ?? b.heure       ?? '',
    duration:    b.duration    ?? b.duree       ?? '',
    level:       b.level       ?? b.niveau      ?? '',
    type:        b.type        ?? 'Live Class',
    link:        b.link        ?? b.lien        ?? '',
    status:      (b.status     ?? b.statut      ?? 'active').toLowerCase(),
    maxCapacity: b.maxCapacity ?? b.capaciteMax ?? 20,
    recurring:   b.recurring   ?? b.recurrent   ?? true,
    notes:       b.notes       ?? '',
    enrolled:  (b.enrolled  ?? b.inscrits  ?? []).map((s: any) => ({ id: s.id, name: s.name ?? s.nom ?? '', email: s.email ?? '', enrolledAt: s.enrolledAt ?? s.dateInscription ?? '' })),
    attendance: (b.attendance ?? b.presences ?? []).map((r: any) => ({ date: r.date, attendees: r.attendees ?? r.presents ?? [] })),
    materials:  (b.materials  ?? b.materiaux ?? []).map((m: any) => ({ title: m.title ?? m.titre ?? '', url: m.url ?? '', type: m.type ?? 'link' })),
  };
}

function fromClass(c: Omit<PlatformClass, 'id'>): any {
  return {
    title: c.title, instructor: c.instructor, day: c.day, time: c.time,
    duration: c.duration, level: c.level, type: c.type, link: c.link,
    status: c.status?.toUpperCase(), maxCapacity: c.maxCapacity,
    recurring: c.recurring, notes: c.notes,
  };
}

function toComp(b: any): Competition {
  return {
    id:               b.id,
    title:            b.title         ?? b.titre      ?? b.nom ?? '',
    description:      b.description   ?? '',
    image:            b.image         ?? '/images/event-1.jpg',
    slug:             b.slug          ?? String(b.id),
    status:           (b.status       ?? b.statut     ?? 'upcoming').toLowerCase(),
    deadline:         b.deadline      ?? b.dateFin    ?? '',
    prize:            b.prize         ?? b.recompense ?? '',
    category:         b.category      ?? b.categorie  ?? '',
    tags:             b.tags          ?? [],
    startDate:        b.startDate     ?? '',
    maxParticipants:  b.maxParticipants ?? 0,
    resultsPublished: b.resultsPublished ?? b.resultatsPublies ?? false,
    rules:            b.rules         ?? b.regles     ?? '',
    rounds: (b.rounds ?? []).map((r: any) => ({
      name: r.name ?? r.nom ?? '',
      startDate: r.startDate ?? r.dateDebut ?? '',
      endDate: r.endDate ?? r.dateFin ?? '',
      status: (r.status ?? 'pending').toLowerCase()
    })),
    participants: (b.participants ?? []).map((p: any) => ({
      id: p.id, name: p.name ?? p.nom ?? '', email: p.email ?? '',
      phone: p.phone, motivation: p.motivation,
      registeredAt: p.registeredAt ?? p.dateInscription ?? '',
      score: p.score, errorsCount: p.errorsCount,
      status: (p.status ?? p.statut ?? 'registered').toLowerCase(),
      submissionUrl: p.submissionUrl ?? null,
      submissionNotes: p.submissionNotes ?? null,
      submittedAt: p.submittedAt ?? null,
    })),
  };
}

function fromComp(c: Omit<Competition, 'id'>): any {
  return {
    title: c.title, description: c.description, image: c.image, slug: c.slug,
    status: c.status?.toUpperCase(), startDate: c.startDate, deadline: c.deadline,
    prize: c.prize, category: c.category, tags: c.tags, maxParticipants: c.maxParticipants,
    rules: c.rules, resultsPublished: c.resultsPublished, rounds: c.rounds,
    participants: c.participants,
  };
}

function toTraining(b: any): Training {
  return {
    id: b.id,
    title: b.title,
    description: b.description,
    type: b.type,
    level: b.level,
    price: b.price ?? 350,
    image: b.image ?? '/images/training-1.jpg',
    slug: b.slug,
    action: b.action ?? 'Purchase',
    instructor: b.instructor,
    category: b.category,
    chapters: b.chapters,
    duration: b.duration,
    banner: b.banner ?? '/images/course-banner.jpg',
    aiScore: b.aiScore,
    chaptersData: (b.chaptersData ?? []).map((c: any) => ({
      name: c.name,
      number: c.number,
      sections: (c.sections ?? []).map((s: any) => ({ name: s.name, completed: s.completed }))
    }))
  };
}

function toClub(b: any): Club {
  return {
    id: b.id,
    name: b.name,
    description: b.description,
    image: b.image ?? '/images/club-1.jpg',
    icon: b.icon ?? '💬',
    slug: b.slug ?? b.id.toString(),
    members: b.members ?? 0
  };
}

function toEvent(b: any): PlatformEvent {
  return {
    id: b.id,
    title: b.title,
    description: b.description,
    date: b.startTime ? new Date(b.startTime).toLocaleDateString() : '',
    location: b.location,
    time: b.startTime ? new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    image: b.image ?? '/images/event-1.jpg',
    badge: b.status === 'PUBLISHED' ? 'Next event' : 'Past event',
    slug: b.id.toString(),
    type: b.status === 'PUBLISHED' ? 'next' : 'past'
  };
}

// ─── API URLs ─────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8081/api';
const CLASS_API = API_BASE;
const COMP_API  = API_BASE;

// ─── Service ──────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private http: HttpClient, private notification: NotificationService) {
    this.loadClasses();
    this.loadCompetitions();
    this.loadTrainings();
    this.loadClubs();
    this.loadEvents();
    this.loadStudents();
    this.loadProfessors();
    this.loadClubMemberships();
    this.loadEventRegistrations();
  }

  classes      = signal<PlatformClass[]>([]);
  competitions = signal<Competition[]>([]);
  trainings    = signal<Training[]>([]);
  clubs        = signal<Club[]>([]);
  events       = signal<PlatformEvent[]>([]);

  private _students    = signal<Student[]>([]);
  private _professors  = signal<Professor[]>([]);
  private _clubMemberships   = signal<ClubMembership[]>([]);
  private _eventRegistrations = signal<EventRegistration[]>([]);
  private _quizzes     = signal<Quiz[]>([]);
  private _notifications = signal<AdminNotification[]>([]);

  students(): Student[] { return this._students(); }
  professors(): Professor[] { return this._professors(); }
  clubMemberships(): ClubMembership[] { return this._clubMemberships(); }
  eventRegistrations(): EventRegistration[] { return this._eventRegistrations(); }
  quizzes(): Quiz[] { return this._quizzes(); }
  notifications(): AdminNotification[] { return this._notifications(); }

  exercises = signal<Exercise[]>([
    {
      id: 1, title: 'HTML Mastery: Semantic Layouts', category: 'Coding', difficulty: 'Beginner',
      description: 'Practice building accessible web structures using header, nav, section, and footer elements.', points: 50, icon: '🌐', estimatedMinutes: 10,
      tasks: [
        { question: 'Which element is best for navigation links?', options: ['<nav>', '<div>', '<section>', '<ul>'], correctIndex: 0, explanation: '<nav> is the semantically correct element for navigation blocks.' },
        { question: 'Where does the main title go?', options: ['<h2>', '<h3>', '<h1>', '<h4>'], correctIndex: 2, explanation: '<h1> represents the primary heading of the page.' }
      ]
    },
    {
      id: 2, title: 'JavaScript Essentials: Arrays', category: 'Coding', difficulty: 'Intermediate',
      description: 'Explore map, filter, and reduce to transform data like a pro.', points: 100, icon: '📜', estimatedMinutes: 15,
      tasks: [
        { question: 'What does map() return?', options: ['A new array', 'A single value', 'Nothing', 'A boolean'], correctIndex: 0, explanation: 'map() creates a new array with the results of calling a function on every element.' },
        { question: 'Filter odd numbers from [1,2,3]?', options: ['[1,3]', '[2]', '[1,2,3]', '[]'], correctIndex: 0, explanation: 'Filter returns only elements that satisfy the condition (x % 2 !== 0).' }
      ]
    },
    {
      id: 13, title: 'Python: List Comprehensions', category: 'Coding', difficulty: 'Intermediate',
      description: 'Master concise and powerful list creation in Python.', points: 85, icon: '🐍', estimatedMinutes: 7,
      tasks: [
        { question: 'Correct syntax for list comprehension?', options: ['[x for x in list]', '{x in list}', '(x for x in list)', '[for x in list: x]'], correctIndex: 0, explanation: '[expression for item in iterable] is the standard syntax.' },
        { question: 'Filter even numbers from "nums"?', options: ['[x for x in nums if x%2==0]', '[x if x%2==0 in nums]', '[x for x in nums while x%2==0]', 'nums.filter(even)'], correctIndex: 0, explanation: 'The "if" clause at the end filters items.' }
      ]
    },
    {
      id: 14, title: 'Binary Search Mastery', category: 'Coding', difficulty: 'Advanced',
      description: 'Implement and optimize search in sorted datasets.', points: 150, icon: '🔍', estimatedMinutes: 10,
      tasks: [
        { question: 'Time complexity of Binary Search?', options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'], correctIndex: 2, explanation: 'Each step halves the search space — log₂(n).' },
        { question: 'Binary search requires the data to be?', options: ['Linked List', 'Sorted', 'Shuffled', 'Small'], correctIndex: 1, explanation: 'Binary search only works on sorted collections.' }
      ]
    },
    {
      id: 15, title: 'Biology: Cellular Respiration', category: 'Science', difficulty: 'Intermediate',
      description: 'Trace the path of energy from glucose to ATP.', points: 90, icon: '🧬', estimatedMinutes: 8,
      tasks: [
        { question: 'Where does Glycolysis occur?', options: ['Mitochondria', 'Cytoplasm', 'Nucleus', 'Ribosome'], correctIndex: 1, explanation: 'Glycolysis happens in the cytosol (cytoplasm).' },
        { question: 'Main byproduct of respiration?', options: ['Oxygen', 'Glucose', 'Carbon Dioxide', 'Nitrogen'], correctIndex: 2, explanation: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP.' }
      ]
    },
    {
      id: 16, title: 'Advanced Genetics: DNA Replication', category: 'Science', difficulty: 'Advanced',
      description: 'Test your knowledge of helicase, polymerase, and Okazaki fragments.', points: 180, icon: '🧬', estimatedMinutes: 12,
      tasks: [
        { question: 'Enzyme that "unwinds" DNA?', options: ['Ligase', 'Helicase', 'Polymerase', 'Primase'], correctIndex: 1, explanation: 'Helicase breaks hydrogen bonds to unzip the double helix.' },
        { question: 'Replication occurs in what direction?', options: ['3\' to 5\'', '5\' to 3\'', 'Inward', 'Outward'], correctIndex: 1, explanation: 'DNA Polymerase only adds nucleotides to the 3\' end, so it grows 5\' → 3\'.' }
      ]
    },
    {
      id: 17, title: 'Mental Math: Multiplication Hacks', category: 'Math', difficulty: 'Beginner',
      description: 'Learn and apply shortcuts for large multiplication.', points: 40, icon: '🧠', estimatedMinutes: 4,
      tasks: [
        { question: 'Shortcut for multiplying by 11 (e.g., 23×11)?', options: ['Add a zero', 'Add the digits (2+3=5) and put in middle: 253', 'Multiply by 10 and subtract', 'Double the number'], correctIndex: 1, explanation: 'For 2-digit numbers: sum of digits in the middle leads to the answer.' }
      ]
    },
    {
      id: 18, title: 'Calculus: Derivatives 101', category: 'Math', difficulty: 'Advanced',
      description: 'Foundations of rates of change and tangent lines.', points: 160, icon: '📈', estimatedMinutes: 10,
      tasks: [
        { question: 'Derivative of x²?', options: ['x', '2x', 'x²', '2'], correctIndex: 1, explanation: 'Power rule: d/dx(x^n) = n*x^(n-1).' },
        { question: 'Derivative of a constant?', options: ['1', 'x', '0', 'Infinity'], correctIndex: 2, explanation: 'Rate of change of a constant is always zero.' }
      ]
    },
    {
      id: 19, title: 'Robotics 101: Sensors', category: 'Robotics', difficulty: 'Beginner',
      description: 'Identify and use ultrasonic and IR sensors.', points: 50, icon: '📡', estimatedMinutes: 5,
      tasks: [
        { question: 'Sensor used to measure distance via sound?', options: ['Infrared', 'Ultrasonic', 'Gyroscope', 'Light sensor'], correctIndex: 1, explanation: 'Ultrasonic triggers sound pulses and measures echo time.' }
      ]
    },
    {
      id: 20, title: 'Intermediate Arduino: PWM Control', category: 'Robotics', difficulty: 'Intermediate',
      description: 'Control LED brightness and motor speed with Pulse Width Modulation.', points: 100, icon: '🔌', estimatedMinutes: 8,
      tasks: [
        { question: 'PWM stands for?', options: ['Power Wave Management', 'Pulse Width Modulation', 'Programmed Wire Method', 'Peak Wave Mode'], correctIndex: 1, explanation: 'PWM controls output by varying the pulse width.' }
      ]
    },
    {
      id: 21, title: 'Art History: Renaissance Masters', category: 'Arts', difficulty: 'Beginner',
      description: 'Explore the works of Da Vinci, Michelangelo, and Raphael.', points: 45, icon: '🎨', estimatedMinutes: 6,
      tasks: [
        { question: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Van Gogh', 'Leonardo da Vinci', 'Donatello'], correctIndex: 2, explanation: 'Da Vinci painted the Mona Lisa in the early 16th century.' }
      ]
    },
    {
      id: 22, title: 'Advanced Digital Art: Layer Blending', category: 'Arts', difficulty: 'Advanced',
      description: 'Master Multiply, Screen, and Overlay modes for lighting.', points: 130, icon: '🖌️', estimatedMinutes: 10,
      tasks: [
        { question: 'Blending mode that darkens colors?', options: ['Screen', 'Overlay', 'Multiply', 'Add'], correctIndex: 2, explanation: 'Multiply multiplies pixel values, resulting in darker output.' }
      ]
    },
    {
      id: 23, title: 'Public Speaking: Body Language', category: 'Skills', difficulty: 'Intermediate',
      description: 'Use gestures and posture to command the room.', points: 70, icon: '🧍', estimatedMinutes: 6,
      tasks: [
        { question: 'Open palms generally signify?', options: ['Defensiveness', 'Honesty and openness', 'Aggression', 'Boredom'], correctIndex: 1, explanation: 'Showing palms is a universal sign of transparency.' }
      ]
    },
    {
      id: 24, title: 'Financial Literacy: Compound Interest', category: 'Skills', difficulty: 'Advanced',
      description: 'Calculate and understand the power of long-term investing.', points: 140, icon: '💰', estimatedMinutes: 9,
      tasks: [
        { question: 'Compound interest difference from simple?', options: ['Only on principal', 'Interest on interest', 'Fixed amount every year', 'Government tax'], correctIndex: 1, explanation: 'Compound interest builds on previous interest earned.' }
      ]
    },
    {
      id: 25, title: 'Intro to Physics: Kinematics', category: 'Physics', difficulty: 'Beginner',
      description: 'Velocity, acceleration, and displacement basics.', points: 55, icon: '🏎️', estimatedMinutes: 6,
      tasks: [
        { question: 'Speed with direction is called?', options: ['Mass', 'Momentum', 'Velocity', 'Acceleration'], correctIndex: 2, explanation: 'Velocity is a vector — speed + direction.' }
      ]
    },
    {
      id: 26, title: 'Optics: Reflection & Refraction', category: 'Physics', difficulty: 'Intermediate',
      description: 'Study how light behaves at mirrors and lenses.', points: 95, icon: '👓', estimatedMinutes: 8,
      tasks: [
        { question: 'Light bending when entering water?', options: ['Reflection', 'Refraction', 'Diffraction', 'Absorption'], correctIndex: 1, explanation: 'Refraction is bending due to change in speed.' }
      ]
    },
    {
      id: 27, title: 'Music Composition: Chord Progressions', category: 'Music', difficulty: 'Intermediate',
      description: 'Build emotion with I-IV-V and ii-V-I patterns.', points: 80, icon: '🎹', estimatedMinutes: 8,
      tasks: [
        { question: 'The "V" chord in C Major is?', options: ['F', 'G', 'Am', 'Dm'], correctIndex: 1, explanation: 'C(I)-D(ii)-E(iii)-F(IV)-G(V).' }
      ]
    },
    {
      id: 28, title: 'Jazz Theory: Improvisation', category: 'Music', difficulty: 'Advanced',
      description: 'Learn modes and tension tones for jazz solos.', points: 190, icon: '🎷', estimatedMinutes: 15,
      tasks: [
        { question: 'Standard "ii-V-I" in C?', options: ['Dm7-G7-Cmaj7', 'C-F-G', 'Am-D7-G', 'Em-A7-D'], correctIndex: 0, explanation: 'D minor (ii), G dominant (V), C major (I).' }
      ]
    },
    {
      id: 29, title: 'Cybersecurity: Phishing Defense', category: 'Coding', difficulty: 'Beginner',
      description: 'Identify and report social engineering attacks.', points: 65, icon: '🛡️', estimatedMinutes: 5,
      tasks: [
        { question: 'Best way to verify a suspicious bank email?', options: ['Click the link', 'Reply with password', 'Check the official site directly', 'Download attachment'], correctIndex: 2, explanation: 'Always use official channels, never email links.' }
      ]
    },
    {
      id: 30, title: 'Cloud Computing: Shared Responsibility', category: 'Coding', difficulty: 'Intermediate',
      description: 'Master AWS/Azure/GCP management models.', points: 110, icon: '☁️', estimatedMinutes: 7,
      tasks: [
        { question: 'In IaaS, who manages the OS?', options: ['The Cloud Provider', 'The Customer', 'The Robot', 'Nobody'], correctIndex: 1, explanation: 'In Infrastructure as a Service, the customer manages the OS and above.' }
      ]
    }
  ]);

  // ── TRAININGS (COURSES) HTTP ───────────────────────────────────────────────

  loadTrainings(): void {
    this.http.get<any[]>(`${API_BASE}/courses`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.trainings.set(data.map(toTraining)));
  }

  // ── CLUBS HTTP ─────────────────────────────────────────────────────────────

  loadClubs(): void {
    this.http.get<any[]>(`${API_BASE}/clubs`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.clubs.set(data.map(toClub)));
  }

  createClub(payload: AdminClubFormData) {
    const body = { name: payload.name, description: payload.description, status: payload.status, professorId: payload.professorId ?? null };
    this.http.post<any>(`${API_BASE}/clubs`, body).pipe(catchError(() => of(null))).subscribe(res => {
      if (res) {
        this.notification.success('Club created successfully');
        this.loadClubs();
      } else {
        this.notification.error('Failed to create club');
      }
    });
  }

  updateClub(id: number | string, payload: AdminClubFormData) {
    const body = { name: payload.name, description: payload.description, status: payload.status, professorId: payload.professorId ?? null };
    this.http.put<any>(`${API_BASE}/clubs/${id}`, body).pipe(catchError(() => of(null))).subscribe(res => {
      if (res) {
        this.notification.success('Club updated successfully');
        this.loadClubs();
      } else {
        this.notification.error('Failed to update club');
      }
    });
  }

  deleteClub(id: number | string) {
    this.clubs.update(list => list.filter(c => c.id !== id));
    this.http.delete(`${API_BASE}/clubs/${id}`).pipe(catchError(() => of(null))).subscribe(res => {
      this.notification.success('Club deleted successfully');
      this.loadClubs();
    });
  }

  // ── EVENTS HTTP ────────────────────────────────────────────────────────────

  loadEvents(includeScheduled = false): void {
    const url = includeScheduled ? `${API_BASE}/events?includeScheduled=true` : `${API_BASE}/events`;
    this.http.get<any[]>(url).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.events.set(data.map(toEvent)));
  }

  /** Alias used by admin-events component from archived branches */
  loadEventsFromBackend(includeScheduled = false) {
    this.loadEvents(includeScheduled);
  }

  createEvent(payload: AdminEventFormData) {
    const clubVal = payload.clubName && payload.clubName.trim() !== '' && payload.clubName !== 'null' ? payload.clubName.trim() : null;
    const body = {
      title: payload.title, description: payload.description,
      startTime: payload.start, endTime: payload.end,
      location: payload.location, status: payload.status,
      maxParticipants: payload.maxParticipants && payload.maxParticipants > 0 ? payload.maxParticipants : null,
      clubName: clubVal,
      publishAt: payload.publishAt && payload.publishAt.trim() !== '' ? payload.publishAt.trim() : null
    };
    this.http.post<any>(`${API_BASE}/events`, body).pipe(catchError((err) => {
      console.error('Event creation error:', err);
      return of(null);
    })).subscribe(res => {
      if (res) {
        this.notification.success('Event created successfully');
        this.loadEvents(true);
      } else {
        this.notification.error('Failed to create event');
      }
    });
  }

  updateEvent(id: number | string, payload: AdminEventFormData) {
    const clubVal = payload.clubName && payload.clubName.trim() !== '' && payload.clubName !== 'null' ? payload.clubName.trim() : null;
    const body = {
      title: payload.title, description: payload.description,
      startTime: payload.start, endTime: payload.end,
      location: payload.location, status: payload.status,
      maxParticipants: payload.maxParticipants && payload.maxParticipants > 0 ? payload.maxParticipants : null,
      clubName: clubVal,
      publishAt: payload.publishAt && payload.publishAt.trim() !== '' ? payload.publishAt.trim() : null
    };
    this.http.put<any>(`${API_BASE}/events/${id}`, body).pipe(catchError((err) => {
      console.error('Event update error:', err);
      return of(null);
    })).subscribe(res => {
      if (res) {
        this.notification.success('Event updated successfully');
        this.loadEvents(true);
      } else {
        this.notification.error('Failed to update event');
      }
    });
  }

  deleteEvent(id: number | string) {
    this.events.update(list => list.filter(e => e.id !== id));
    this.http.delete(`${API_BASE}/events/${id}`).pipe(catchError(() => of(null))).subscribe(() => {
      this.notification.success('Event deleted successfully');
      this.loadEvents(true);
    });
  }

  // ── CLASSES HTTP ───────────────────────────────────────────────────────────

  loadClasses(): void {
    this.http.get<any[]>(`${CLASS_API}/classes`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.classes.set(data.map(toClass)));
  }

  addClass(pc: PlatformClass): void {
    this.http.post<any>(`${CLASS_API}/classes`, fromClass(pc)).pipe(
      catchError(() => of(null))
    ).subscribe(res => {
      if (res) this.classes.update(list => [...list, toClass(res)]);
    });
  }

  updateClass(pc: PlatformClass): void {
    this.classes.update(list => list.map(c => c.id === pc.id ? pc : c));
    this.http.put<any>(`${CLASS_API}/classes/${pc.id}`, fromClass(pc)).pipe(
      catchError(() => of(null))
    ).subscribe(res => {
      if (res) this.classes.update(list => list.map(c => c.id === pc.id ? toClass(res) : c));
    });
  }

  deleteClass(id: number | string): void {
    this.classes.update(list => list.filter(c => c.id !== id));
    this.http.delete(`${CLASS_API}/classes/${id}`).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  joinClass(classId: number | string, name: string, email: string): string | null {
    const cls = this.classes().find(c => c.id === classId);
    if (!cls) return 'Class not found.';
    if (cls.status === 'cancelled') return 'This class has been cancelled.';
    if ((cls.enrolled ?? []).some(s => s.email.toLowerCase() === email.toLowerCase()))
      return 'You are already enrolled in this class.';
    if ((cls.enrolled ?? []).length >= (cls.maxCapacity ?? Infinity))
      return 'Sorry, this class is full.';

    const student: EnrolledStudent = { id: Date.now(), name, email, enrolledAt: new Date().toISOString().slice(0, 10) };
    const newStatus: PlatformClass['status'] =
      (cls.enrolled ?? []).length + 1 >= (cls.maxCapacity ?? Infinity) ? 'full' : cls.status;
    const updated = { ...cls, enrolled: [...(cls.enrolled ?? []), student], status: newStatus };
    this.classes.update(list => list.map(c => c.id === classId ? updated : c));
    this.http.post(`${CLASS_API}/classes/${classId}/enroll`, { name, email }).pipe(
      catchError(() => of(null))
    ).subscribe();
    return null;
  }

  // ── COMPETITIONS HTTP ──────────────────────────────────────────────────────

  loadCompetitions(): void {
    this.http.get<any[]>(`${COMP_API}/competitions`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.competitions.set(data.map(toComp)));
  }

  addCompetition(comp: Competition): void {
    this.http.post<any>(`${COMP_API}/competitions`, fromComp(comp)).pipe(
      catchError(() => of(null))
    ).subscribe(res => {
      if (res) this.competitions.update(list => [...list, toComp(res)]);
      else this.competitions.update(list => [...list, { ...comp, id: Date.now() }]);
    });
  }

  updateCompetition(comp: Competition): void {
    this.competitions.update(list => list.map(c => c.id === comp.id ? comp : c));
    this.http.put<any>(`${COMP_API}/competitions/${comp.id}`, fromComp(comp)).pipe(
      catchError(() => of(null))
    ).subscribe(res => {
      if (res) this.competitions.update(list => list.map(c => c.id === comp.id ? toComp(res) : c));
    });
  }

  deleteCompetition(id: number | string): void {
    this.competitions.update(list => list.filter(c => c.id !== id));
    this.http.delete(`${COMP_API}/competitions/${id}`).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  registerForCompetition(competitionId: number | string, name: string, email: string, phone?: string, motivation?: string): string | null {
    const comp = this.competitions().find(c => c.id === competitionId);
    if (!comp) return 'Competition not found.';
    if (comp.status === 'completed') return 'This competition has already ended.';
    if ((comp.participants ?? []).some(p => p.email.toLowerCase() === email.toLowerCase()))
      return 'This email is already registered for this competition.';

    const newP: Participant = { id: Date.now(), name, email, phone, motivation, registeredAt: new Date().toISOString().slice(0, 10), status: 'registered' };
    const updated = { ...comp, participants: [...(comp.participants ?? []), newP] };
    this.competitions.update(list => list.map(c => c.id === competitionId ? updated : c));

    this.http.post<any>(`${COMP_API}/competitions/${competitionId}/register`, { name, email, phone, motivation }).pipe(
      catchError(() => of(null))
    ).subscribe(res => {
      if (res) {
        this.competitions.update(list => list.map(c => {
          if (c.id === competitionId) {
            const filtered = (c.participants ?? []).filter(p => p.email.toLowerCase() !== email.toLowerCase());
            return { ...c, participants: [...filtered, toComp({ participants: [res] }).participants![0]] };
          }
          return c;
        }));
      }
    });
    return null;
  }

  // ── VOTES & CLASSEMENT ─────────────────────────────────────────────────────

  voteCompetition(competitionId: number | string, email: string, voteType: 'LIKE' | 'DISLIKE') {
    return this.http.post<VoteStats>(
      `${COMP_API}/competitions/${competitionId}/vote`,
      { email, voteType }
    ).pipe(catchError(() => of(null)));
  }

  getVoteStats(competitionId: number | string, email?: string) {
    const params = email ? `?email=${encodeURIComponent(email)}` : '';
    return this.http.get<VoteStats>(
      `${COMP_API}/competitions/${competitionId}/votes${params}`
    ).pipe(catchError(() => of({ likes: 0, dislikes: 0, score: 0, userVote: null } as VoteStats)));
  }

  submitProject(competitionId: number | string, email: string, submissionUrl: string | null, submissionNotes: string | null, score?: number, errorsCount?: number) {
    return this.http.post<Participant>(
      `${COMP_API}/competitions/${competitionId}/submit`,
      { email, submissionUrl, submissionNotes, score, errorsCount }
    ).pipe(catchError(() => of(null)));
  }

  getCompetitionRanking() {
    return this.http.get<CompetitionRanking[]>(`${COMP_API}/competitions/ranking`)
      .pipe(catchError(() => of([])));
  }

  getRecommendations(email: string) {
    return this.http.get<Competition[]>(
      `${COMP_API}/competitions/recommendations?email=${encodeURIComponent(email)}`
    ).pipe(catchError(() => of([])));
  }

  // ── ANNONCES (news feed) ───────────────────────────────────────────────────

  getAnnouncements(competitionId: number | string) {
    return this.http.get<Announcement[]>(
      `${COMP_API}/competitions/${competitionId}/announcements`
    ).pipe(catchError(() => of([] as Announcement[])));
  }

  postAnnouncement(competitionId: number | string, title: string, content: string, type: string) {
    return this.http.post<Announcement>(
      `${COMP_API}/competitions/${competitionId}/announcements`,
      { title, content, type }
    ).pipe(catchError(() => of(null)));
  }

  deleteAnnouncement(announcementId: number) {
    return this.http.delete(
      `${COMP_API}/competitions/announcements/${announcementId}`
    ).pipe(catchError(() => of(null)));
  }

  // ── AI RECOMMENDATION ENGINE ───────────────────────────────────────────────

  /** Maps any competition category string to a canonical training/exercise category */
  private normalizeCategory(raw: string): string {
    const c = (raw ?? '').toLowerCase().trim();
    if (c.includes('cod') || c.includes('program') || c.includes('hack') || c.includes('dev') || c.includes('web') || c.includes('software')) return 'Coding';
    if (c.includes('physic') && !c.includes('bio'))  return 'Physics';
    if (c.includes('science') || c.includes('bio') || c.includes('chem') || c.includes('lab')) return 'Science';
    if (c.includes('math') || c.includes('algebra') || c.includes('calcul') || c.includes('statistic')) return 'Math';
    if (c.includes('robot') || c.includes(' ai ') || c.includes('machine') || c.includes('autonom') || c === 'ai') return 'Robotics';
    if (c.includes('art') || c.includes('creat') || c.includes('design') || c.includes('draw') || c.includes('paint')) return 'Arts';
    if (c.includes('music') || c.includes('song') || c.includes('instrument') || c.includes('melody')) return 'Music';
    if (c.includes('lang') || c.includes('english') || c.includes('french') || c.includes('arabic') || c.includes('writ') || c.includes('essay')) return 'Language';
    if (c.includes('skill') || c.includes('lead') || c.includes('manag') || c.includes('public') || c.includes('commun') || c.includes('debate') || c.includes('busi') || c.includes('entre') || c.includes('market') || c.includes('startup')) return 'Skills';
    return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'General';
  }

  /** Gets a full intelligent recommendation profile based on COMPLETED competition history.
   * fromComp: optional context injected directly from a just-completed competition.
   */
  getIntelligentProfile(
    email: string,
    fromComp?: { id: number | string; category: string; title: string }
  ): Observable<RecommendationProfile | null> {

    const allComps         = this.competitions();
    const allExercisesData = this.exercises();
    const allTrainingsData = this.trainings();

    // ── A: Scan localStorage for ALL competitions this email registered for ───
    // This covers locally-registered competitions not yet synced to backend.
    interface LocalEntry { compId: number | string; category: string; title: string; score: number; errors: number; status: string; }
    const localEntries: LocalEntry[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) ?? '';
        if (!key.startsWith('reg_comp_email_')) continue;
        const storedEmail = localStorage.getItem(key) ?? '';
        if (storedEmail.toLowerCase() !== email.toLowerCase()) continue;

        // Extract comp id: key = reg_comp_email_{id}
        const compId = key.replace('reg_comp_email_', '');

        // Find the competition in the loaded data
        const comp = allComps.find(c => String(c.id) === compId);
        if (!comp) continue;

        // Read its task submission
        let score  = 0;
        let errors = 0;
        try {
          const raw = localStorage.getItem(`submission_comp_${compId}`);
          if (raw) {
            const sub = JSON.parse(raw);
            if (sub.taskScore != null && sub.taskTotal != null && sub.taskTotal > 0) {
              score  = Math.round((sub.taskScore / sub.taskTotal) * 100);
              const results: any[] = sub.taskResults ?? [];
              errors = results.filter(r => !r.correct).length;
            }
          }
        } catch (_) { /* ignore */ }

        localEntries.push({
          compId: comp.id,
          category: comp.category,
          title: comp.title,
          score,
          errors,
          status: comp.status
        });
      }
    } catch (_) { /* localStorage not available */ }

    // ── B: Backend participants lookup ────────────────────────────────────────
    const backendParticipated = allComps.filter(c =>
      (c.participants ?? []).some(p => p.email.toLowerCase() === email.toLowerCase())
    );

    // ── C: Merge — union of local + backend, deduplicated by compId ──────────
    const seenIds = new Set<string | number>();
    interface AnalysisEntry { compId: number | string; category: string; title: string; score: number; errors: number; status: string; }
    const analysisPool: AnalysisEntry[] = [];

    // Add local entries first (they have real task scores)
    for (const e of localEntries) {
      seenIds.add(e.compId);
      analysisPool.push(e);
    }

    // Add backend entries (use backend score if available, or 0)
    for (const c of backendParticipated) {
      if (seenIds.has(c.id)) continue;
      const p = (c.participants ?? []).find(p => p.email.toLowerCase() === email.toLowerCase());
      let score  = p?.score       ?? 0;
      let errors = p?.errorsCount ?? 0;
      // Try localStorage fallback for this competition too
      try {
        if (score === 0) {
          const raw = localStorage.getItem(`submission_comp_${c.id}`);
          if (raw) {
            const sub = JSON.parse(raw);
            if (sub.taskScore != null && sub.taskTotal != null && sub.taskTotal > 0) {
              score  = Math.round((sub.taskScore / sub.taskTotal) * 100);
              const results: any[] = sub.taskResults ?? [];
              errors = results.filter(r => !r.correct).length;
            }
          }
        }
      } catch (_) { /* ignore */ }
      seenIds.add(c.id);
      analysisPool.push({ compId: c.id, category: c.category, title: c.title, score, errors, status: c.status });
    }

    // ── D: Inject fromComp if it's not already in the pool ───────────────────
    if (fromComp && !seenIds.has(fromComp.id)) {
      let score  = 0;
      let errors = 0;
      try {
        const raw = localStorage.getItem(`submission_comp_${fromComp.id}`);
        if (raw) {
          const sub = JSON.parse(raw);
          if (sub.taskScore != null && sub.taskTotal != null && sub.taskTotal > 0) {
            score  = Math.round((sub.taskScore / sub.taskTotal) * 100);
            const results: any[] = sub.taskResults ?? [];
            errors = results.filter(r => !r.correct).length;
          }
        }
      } catch (_) { /* ignore */ }
      analysisPool.push({ compId: fromComp.id, category: fromComp.category, title: fromComp.title, score, errors, status: 'completed' });
    }

    // ── E: Discovery mode — truly no data ────────────────────────────────────
    if (analysisPool.length === 0) {
      // If fromComp is provided, at least bootstrap the profile with that category
      const boostCat = fromComp ? this.normalizeCategory(fromComp.category) : null;
      const boostedTrainings = allTrainingsData.map(t => ({
        ...t,
        aiScore: boostCat && (t.category ?? '').toLowerCase() === boostCat.toLowerCase() ? 60 : 20
      })).sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0)).slice(0, 3);

      return of({
        level: 'Beginner',
        dominantCategory: boostCat ?? 'General',
        historyCategories: boostCat ? [boostCat] : [],
        weakestCategory: null,
        strengths: [],
        accuracy: 100,
        totalScore: 0,
        totalErrors: 0,
        participatedCount: 0,
        completedCount: 0,
        recommendedCompetitions: allComps.filter(c => c.status !== 'completed').slice(0, 3),
        recommendedExercises:    allExercisesData.filter(e =>
          boostCat ? e.category === boostCat : e.difficulty === 'Beginner'
        ).slice(0, 4),
        recommendedContent: boostedTrainings
      });
    }

    // ── F: Focus analysis on completed entries ────────────────────────────────
    const completedEntries  = analysisPool.filter(e => e.status === 'completed');
    const analysisEntries   = completedEntries.length > 0 ? completedEntries : analysisPool;

    let totalScore  = 0;
    let totalErrors = 0;
    const catFrequency: Record<string, number>   = {};
    const catErrors:    Record<string, number>   = {};
    const catScores:    Record<string, number[]> = {};

    for (const e of analysisEntries) {
      const normCat = this.normalizeCategory(e.category);
      totalScore  += e.score;
      totalErrors += e.errors;
      catFrequency[normCat] = (catFrequency[normCat] || 0)  + 1;
      catErrors[normCat]    = (catErrors[normCat]    || 0)  + e.errors;
      catScores[normCat]    = [...(catScores[normCat] || []), e.score];
    }

    // If fromComp is provided, BOOST its normalized category weight x2
    if (fromComp) {
      const boostCat = this.normalizeCategory(fromComp.category);
      catFrequency[boostCat] = (catFrequency[boostCat] || 0) + 2; 
    }

    const sortedCats        = Object.entries(catFrequency).sort((a, b) => b[1] - a[1]);
    const historyCategories = sortedCats.map(([cat]) => cat);
    const dominantCategory  = historyCategories[0] ?? 'General';

    const sortedByErrors  = Object.entries(catErrors).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const weakestCategory = sortedByErrors.length > 0 ? sortedByErrors[0][0] : null;

    const strengths = Object.entries(catScores)
      .filter(([, scores]) => scores.reduce((a, b) => a + b, 0) / scores.length >= 70)
      .map(([cat]) => cat);

    const avgScore = analysisEntries.length > 0 ? totalScore / analysisEntries.length : 0;
    const level: 'Beginner' | 'Intermediate' | 'Advanced' =
      avgScore > 80 ? 'Advanced' : avgScore > 45 ? 'Intermediate' : 'Beginner';
    const accuracy = Math.max(0, Math.min(100,
      Math.round(100 - (totalErrors / Math.max(analysisEntries.length * 5, 1)) * 100)
    ));

    // ── G: Recommended open competitions ─────────────────────────────────────
    const joinedIds   = new Set(analysisPool.map(e => e.compId));
    const openComps   = allComps.filter(c => c.status !== 'completed' && !joinedIds.has(c.id));
    const matchDom    = openComps.filter(c => this.normalizeCategory(c.category) === dominantCategory);
    const matchHist   = openComps.filter(c =>
      historyCategories.includes(this.normalizeCategory(c.category)) &&
      this.normalizeCategory(c.category) !== dominantCategory
    );
    const recommendedCompetitions = [
      ...matchDom,
      ...matchHist,
      ...openComps.filter(c => !historyCategories.includes(this.normalizeCategory(c.category)))
    ].slice(0, 4);

    // ── H: Exercises ──────────────────────────────────────────────────────────
    // 1. Primary Remedial: Weakest category matching user's current level
    const remedialExs = weakestCategory
      ? allExercisesData.filter(e =>
          e.category.toLowerCase() === weakestCategory.toLowerCase() &&
          e.difficulty === level
        )
      : [];

    // 2. Secondary Remedial (Foundation): Weakest category at lower difficulty (bridging gaps)
    const foundationExs = weakestCategory
      ? allExercisesData.filter(e =>
          e.category.toLowerCase() === weakestCategory.toLowerCase() &&
          e.difficulty !== level &&
          (level === 'Advanced' || (level === 'Intermediate' && e.difficulty === 'Beginner'))
        )
      : [];

    // 3. History Match: Other categories the user has touched, matching current level
    const historyExs  = allExercisesData.filter(e =>
      historyCategories.some(cat => cat.toLowerCase() === e.category.toLowerCase())
      && !remedialExs.find(r => r.id === e.id)
      && !foundationExs.find(f => f.id === e.id)
      && e.difficulty === level
    );

    // 4. Exploration: Level-appropriate exercises from completely new categories
    const fillerExs   = allExercisesData.filter(e =>
      e.difficulty === level
      && !remedialExs.find(r => r.id === e.id)
      && !foundationExs.find(f => f.id === e.id)
      && !historyExs.find(h => h.id === e.id)
    );

    // Combined list, prioritized by remediation, capped at 12
    const recommendedExercises = [...remedialExs, ...foundationExs, ...historyExs, ...fillerExs].slice(0, 12);

    // ── I: AI-scored training courses ─────────────────────────────────────────
    const levelMap: Record<string, string[]> = {
      Beginner:     ['Beginner'],
      Intermediate: ['Beginner', 'Mid-level', 'Intermediate'],
      Advanced:     ['Mid-level', 'Advanced']
    };
    const acceptedLevels = levelMap[level];

    const scoredTrainings = allTrainingsData.map(t => {
      let aiScore = 0;
      const tCat  = (t.category ?? '').toLowerCase();

      if (historyCategories.find(c => c.toLowerCase() === tCat)) aiScore += 50;
      if (weakestCategory && weakestCategory.toLowerCase() === tCat) aiScore += 20;
      if (acceptedLevels.includes(t.level)) aiScore += 30;
      if (dominantCategory.toLowerCase() === tCat) aiScore += 10;
      // Extra boost if training matches the just-completed competition category
      if (fromComp && this.normalizeCategory(fromComp.category).toLowerCase() === tCat) aiScore = Math.min(aiScore + 25, 100);

      return { ...t, aiScore: Math.min(aiScore, 100) };
    });

    const recommended = scoredTrainings
      .filter(t => t.aiScore > 0)
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 4);

    const finalRecommendedContent = recommended.length > 0
      ? recommended
      : scoredTrainings.sort((a, b) => b.aiScore - a.aiScore).slice(0, 3);

    return of({
      level,
      dominantCategory,
      historyCategories,
      weakestCategory,
      strengths,
      accuracy,
      totalScore,
      totalErrors,
      participatedCount: analysisPool.length,
      completedCount:    completedEntries.length,
      recommendedCompetitions,
      recommendedExercises,
      recommendedContent: finalRecommendedContent
    });
  }

  // ── CRUD trainings ────────────────────────────────────────────────────────
  addTraining(t: Training): Promise<Training> {
    const body = {
      title: t.title,
      description: t.description,
      type: t.type === 'Blended course' ? 'BLENDED_COURSE' : 'LIVE_CLASSES',
      status: t.status?.toUpperCase() ?? 'DRAFT',
      level: t.level,
      image: t.image,
      banner: t.banner ?? t.image,
      instructor: t.instructor ?? '',
      category: t.category ?? '',
      chapters: t.chapters ?? 1,
      duration: t.duration ?? '',
      chaptersData: (t.chaptersData ?? []).map(c => ({
        name: c.name,
        number: c.number,
        pdfUrl: (c as any).pdfUrl ?? '',
        sections: (c.sections ?? []).map(s => ({ name: s.name, completed: s.completed }))
      }))
    };
    return new Promise((resolve, reject) => {
      this.http.post<any>(`${API_BASE}/courses`, body).subscribe({
        next: res => {
          this.trainings.update(x => [...x, toTraining(res)]);
          this.notification.success('Course created successfully');
          resolve(toTraining(res));
        },
        error: err => reject(err)
      });
    });
  }

  updateTraining(t: Training): Promise<Training> {
    const body = {
      title: t.title,
      description: t.description,
      type: t.type === 'Blended course' ? 'BLENDED_COURSE' : 'LIVE_CLASSES',
      status: t.status?.toUpperCase() ?? 'DRAFT',
      level: t.level,
      image: t.image,
      banner: t.banner ?? t.image,
      instructor: t.instructor ?? '',
      category: t.category ?? '',
      chapters: t.chapters ?? 1,
      duration: t.duration ?? '',
      chaptersData: (t.chaptersData ?? []).map(c => ({
        name: c.name,
        number: c.number,
        pdfUrl: (c as any).pdfUrl ?? '',
        sections: (c.sections ?? []).map(s => ({ name: s.name, completed: s.completed }))
      }))
    };
    return new Promise((resolve, reject) => {
      this.http.put<any>(`${API_BASE}/courses/${t.id}`, body).subscribe({
        next: res => {
          this.trainings.update(x => x.map(i => i.id === t.id ? toTraining(res) : i));
          this.notification.success('Course updated successfully');
          resolve(toTraining(res));
        },
        error: err => reject(err)
      });
    });
  }

  deleteTraining(id: number | string): void {
    this.trainings.update(x => x.filter(i => i.id !== id));
    this.http.delete(`${API_BASE}/courses/${id}`).pipe(catchError(() => of(null))).subscribe(() => {
      this.notification.success('Course deleted successfully');
      this.loadTrainings();
    });
  }

  private notify(msg: string) { console.info('[DataService]', msg); }

  loadStudents() {
    this.http.get<Student[]>(`${API_BASE}/students`).pipe(catchError(() => of([]))).subscribe(l => this._students.set(l));
  }
  createStudent(payload: AdminStudentFormData) {
    this.http.post<Student>(`${API_BASE}/students`, payload).pipe(catchError(() => of(null))).subscribe(res => {
      if (res) this.notification.success('Student created successfully');
      else this.notification.error('Failed to create student');
      this.loadStudents();
    });
  }
  updateStudent(id: number | string, payload: AdminStudentFormData) {
    this.http.put<Student>(`${API_BASE}/students/${id}`, payload).pipe(catchError(() => of(null))).subscribe(res => {
      if (res) this.notification.success('Student updated successfully');
      else this.notification.error('Failed to update student');
      this.loadStudents();
    });
  }
  deleteStudent(id: number | string) {
    this._students.update(l => l.filter(s => s.id !== id));
    this.http.delete(`${API_BASE}/students/${id}`).pipe(catchError(() => of(null))).subscribe(() => {
      this.notification.success('Student deleted successfully');
    });
  }

  loadProfessors() {
    this.http.get<Professor[]>(`${API_BASE}/professors`).pipe(catchError(() => of([]))).subscribe(l => this._professors.set(l));
  }
  createProfessor(payload: AdminProfessorFormData) {
    this.http.post<Professor>(`${API_BASE}/professors`, payload).pipe(catchError(() => of(null))).subscribe(res => {
      if (res) this.notification.success('Professor created successfully');
      else this.notification.error('Failed to create professor');
      this.loadProfessors();
    });
  }
  updateProfessor(id: number | string, payload: AdminProfessorFormData) {
    this.http.put<Professor>(`${API_BASE}/professors/${id}`, payload).pipe(catchError(() => of(null))).subscribe(res => {
      if (res) this.notification.success('Professor updated successfully');
      else this.notification.error('Failed to update professor');
      this.loadProfessors();
    });
  }
  deleteProfessor(id: number | string) {
    this._professors.update(l => l.filter(p => p.id !== id));
    this.http.delete(`${API_BASE}/professors/${id}`).pipe(catchError(() => of(null))).subscribe(() => {
      this.notification.success('Professor deleted successfully');
    });
  }

  loadClubMemberships() {
    this.http.get<ClubMembership[]>(`${API_BASE}/club-memberships`).pipe(catchError(() => of([]))).subscribe(l => this._clubMemberships.set(l));
  }
  createClubMembership(payload: AdminClubMembershipFormData) {
    const body = {
      joinedAt: new Date().toISOString(),
      status: payload.status,
      clubId: payload.clubId,
      studentId: payload.studentId
    };
    this.http.post<ClubMembership>(`${API_BASE}/club-memberships`, body).pipe(catchError(() => of(null))).subscribe(res => {
      if (res) this.notification.success('Club membership created successfully');
      else this.notification.error('Failed to create club membership');
      this.loadClubMemberships();
    });
  }
  updateClubMembership(id: number | string, payload: AdminClubMembershipFormData) {
    const body = {
      joinedAt: new Date().toISOString(),
      status: payload.status,
      clubId: payload.clubId,
      studentId: payload.studentId
    };
    this.http.put<ClubMembership>(`${API_BASE}/club-memberships/${id}`, body).pipe(catchError(() => of(null))).subscribe(res => {
      if (res) this.notification.success('Club membership updated successfully');
      else this.notification.error('Failed to update club membership');
      this.loadClubMemberships();
    });
  }
  deleteClubMembership(id: number | string) {
    this._clubMemberships.update(l => l.filter(m => m.id !== id));
    this.http.delete(`${API_BASE}/club-memberships/${id}`).pipe(catchError(() => of(null))).subscribe(() => {
      this.notification.success('Club membership deleted successfully');
    });
  }

  loadEventRegistrations() {
    this.http.get<EventRegistration[]>(`${API_BASE}/event-registrations`).pipe(catchError(() => of([]))).subscribe(l => this._eventRegistrations.set(l));
  }
  createEventRegistration(payload: AdminEventRegistrationFormData) {
    const body = {
      registeredAt: new Date().toISOString(),
      status: payload.status,
      eventId: payload.eventId,
      studentId: payload.studentId
    };
    this.http.post<EventRegistration>(`${API_BASE}/event-registrations`, body).pipe(catchError(() => of(null))).subscribe(res => {
      if (res) this.notification.success('Event registration created successfully');
      else this.notification.error('Failed to create event registration');
      this.loadEventRegistrations();
    });
  }
  updateEventRegistration(id: number | string, payload: AdminEventRegistrationFormData) {
    const body = {
      registeredAt: new Date().toISOString(),
      status: payload.status,
      eventId: payload.eventId,
      studentId: payload.studentId
    };
    this.http.put<EventRegistration>(`${API_BASE}/event-registrations/${id}`, body).pipe(catchError(() => of(null))).subscribe(res => {
      if (res) this.notification.success('Event registration updated successfully');
      else this.notification.error('Failed to update event registration');
      this.loadEventRegistrations();
    });
  }
  deleteEventRegistration(id: number | string) {
    this._eventRegistrations.update(l => l.filter(r => r.id !== id));
    this.http.delete(`${API_BASE}/event-registrations/${id}`).pipe(catchError(() => of(null))).subscribe(() => {
      this.notification.success('Event registration deleted successfully');
    });
  }

  getNextEvent(includeScheduled = false): Observable<NextEventInfo | null> {
    const url = `${API_BASE}/events/next${includeScheduled ? '?includeScheduled=true' : ''}`;
    return this.http.get<NextEventInfo>(url).pipe(catchError(() => of(null)));
  }

  // Quiz methods (calls quiz-service via gateway)
  async addQuiz(quiz: Quiz) {
    const res = await this.http.post<Quiz>(`${API_BASE}/quizzes`, quiz).pipe(catchError(() => of(null))).toPromise();
    if (res) this._quizzes.update(l => [...l, res]);
    return res;
  }
  async updateQuiz(quiz: Quiz) {
    const res = await this.http.put<Quiz>(`${API_BASE}/quizzes/${quiz.id}`, quiz).pipe(catchError(() => of(null))).toPromise();
    if (res) this._quizzes.update(l => l.map(q => q.id === quiz.id ? res : q));
    return res;
  }
  async deleteQuiz(id: number | string) {
    await this.http.delete(`${API_BASE}/quizzes/${id}`).pipe(catchError(() => of(null))).toPromise();
    this._quizzes.update(l => l.filter(q => q.id !== id));
  }
  async getQuizById(id: number | string): Promise<Quiz | undefined> {
    return this.http.get<Quiz>(`${API_BASE}/quizzes/${id}`).pipe(catchError(() => of(undefined))).toPromise();
  }
  async getTrainingById(id: number | string) {
    return this.http.get<Training>(`${API_BASE}/courses/${id}`).pipe(catchError(() => of(undefined))).toPromise();
  }
  async uploadCourseCover(file: File): Promise<string> {
    const fd = new FormData(); fd.append('file', file);
    const r = await this.http.post<{ url: string }>(`${API_BASE}/courses/assets/cover`, fd).pipe(catchError(() => of({ url: '' }))).toPromise();
    const url = r?.url ?? '';
    return url && url.startsWith('/') ? `http://localhost:8081${url}` : url;
  }
  async uploadCourseChapterPdf(file: File): Promise<string> {
    const fd = new FormData(); fd.append('file', file);
    const r = await this.http.post<{ url: string }>(`${API_BASE}/courses/assets/chapter-pdf`, fd).pipe(catchError(() => of({ url: '' }))).toPromise();
    const url = r?.url ?? '';
    return url && url.startsWith('/') ? `http://localhost:8081${url}` : url;
  }

  addNotification(n: Omit<AdminNotification, 'id' | 'createdAt' | 'read'>) {
    const item: AdminNotification = { id: Date.now(), title: n.title, message: n.message, href: n.href, createdAt: new Date().toLocaleString(), read: false };
    this._notifications.update(l => [item, ...l]);
  }
}
