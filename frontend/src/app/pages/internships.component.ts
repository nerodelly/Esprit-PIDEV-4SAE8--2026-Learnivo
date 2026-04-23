import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, BriefcaseBusiness, Building2, FileText, FileCheck2, BadgeCheck } from 'lucide-angular';
import {
  InternshipApiService,
  Internship,
  InternshipOffer,
  InternshipApplication,
  InternshipApplicationPayload,
  InternshipDocument,
  InternshipDocumentPayload,
  InternshipDocumentType,
  InternshipEvaluation,
  ChatMessage
} from '../services/internship-api.service';

type InternshipViewTab = 'internships' | 'offers' | 'applications' | 'documents' | 'evaluations' | 'chat';

@Component({
  selector: 'app-internships',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
  <section class="mx-auto max-w-7xl px-4 py-10 lg:px-8 space-y-8">
    <div class="space-y-2">
      <h1 class="text-3xl font-extrabold tracking-tight">Internship <span class="text-teal-600 underline decoration-2 underline-offset-4">Space</span></h1>
      <p class="text-muted-foreground">Toutes les données du backend internship sont visibles ici pour les étudiants.</p>
    </div>

    <div *ngIf="errorMessage()" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
      {{ errorMessage() }}
    </div>
    <div *ngIf="successMessage()" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
      {{ successMessage() }}
    </div>

    <div *ngIf="activeTab() === 'internships'" class="rounded-3xl border border-border bg-white p-6 space-y-4">
      <h2 class="text-lg font-extrabold">Inscription à un stage</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select [(ngModel)]="applicationForm.internshipId" class="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 outline-none md:col-span-2">
          <option [ngValue]="0">Choisir un stage</option>
          <option *ngFor="let internship of internships()" [ngValue]="internship.id" [disabled]="isInternshipClosedOrFull(internship.id ?? 0)">
            {{ internship.name }} (max: {{ internship.maxNumber }}) {{ isInternshipClosedOrFull(internship.id ?? 0) ? ' - complet (acceptés)' : '' }}
          </option>
        </select>
        <input [(ngModel)]="applicationForm.firstName" maxlength="120" placeholder="Prénom" class="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 outline-none" />
        <input [(ngModel)]="applicationForm.lastName" maxlength="120" placeholder="Nom" class="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 outline-none" />
        <input [(ngModel)]="applicationForm.age" type="number" min="16" max="100" placeholder="Âge" class="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 outline-none md:col-span-2" />
        <div class="md:col-span-2 space-y-2">
          <input type="file" accept=".pdf,application/pdf" (change)="onApplicationPdfSelected($event)" [disabled]="uploadingCv() || submittingApplication()" class="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 outline-none" />
          <p *ngIf="uploadingCv()" class="text-xs text-muted-foreground">Upload du PDF en cours...</p>
          <p *ngIf="selectedCvFileName()" class="text-xs text-emerald-700">PDF sélectionné: {{ selectedCvFileName() }}</p>
        </div>
        <textarea [(ngModel)]="applicationForm.motivation" maxlength="2000" placeholder="Votre motivation" class="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 outline-none md:col-span-2 min-h-28"></textarea>
      </div>
      <button (click)="submitApplication()" [disabled]="uploadingCv() || submittingApplication() || !!validateApplicationForm()" class="inline-flex items-center rounded-2xl bg-teal-600 px-6 py-3 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">
        {{ submittingApplication() ? 'Envoi en cours...' : 'S’inscrire au stage' }}
      </button>
    </div>

    <div *ngIf="activeTab() === 'documents'" class="rounded-3xl border border-border bg-white p-6 space-y-4">
      <h2 class="text-lg font-extrabold">Ajouter un document</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select [(ngModel)]="documentForm.type" class="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 outline-none">
          <option *ngFor="let type of documentTypes" [value]="type">{{ type }}</option>
        </select>
        <select [(ngModel)]="documentForm.applicationId" class="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 outline-none">
          <option [ngValue]="0">Choisir une candidature</option>
          <option *ngFor="let application of applications()" [ngValue]="application.id">#{{ application.id }} - {{ application.firstName }} {{ application.lastName }}</option>
        </select>
        <div class="md:col-span-2 space-y-2">
          <input type="file" accept=".pdf,application/pdf" (change)="onDocumentPdfSelected($event)" [disabled]="uploadingDocumentPdf() || submittingDocument()" class="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 outline-none" />
          <p *ngIf="uploadingDocumentPdf()" class="text-xs text-muted-foreground">Upload du document PDF en cours...</p>
          <p *ngIf="selectedDocumentFileName()" class="text-xs text-emerald-700">PDF sélectionné: {{ selectedDocumentFileName() }}</p>
        </div>
        <textarea [(ngModel)]="documentForm.comment" maxlength="1000" placeholder="Commentaire (optionnel)" class="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 outline-none md:col-span-2 min-h-24"></textarea>
      </div>
      <button (click)="submitDocument()" [disabled]="uploadingDocumentPdf() || submittingDocument() || !!validateDocumentForm()" class="inline-flex items-center rounded-2xl bg-teal-600 px-6 py-3 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">
        {{ submittingDocument() ? 'Envoi en cours...' : 'Ajouter le document' }}
      </button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-6 gap-4">
      <button (click)="activeTab.set('internships')" [ngClass]="tabClass('internships')" class="rounded-2xl border p-4 text-left transition-all">
        <div class="mb-1 flex items-center gap-2 font-bold text-sm"><lucide-icon [name]="BriefcaseBusiness" [size]="16"></lucide-icon>Internships</div>
        <p class="text-xs">{{ internships().length }} lignes</p>
      </button>
      <button (click)="activeTab.set('offers')" [ngClass]="tabClass('offers')" class="rounded-2xl border p-4 text-left transition-all">
        <div class="mb-1 flex items-center gap-2 font-bold text-sm"><lucide-icon [name]="Building2" [size]="16"></lucide-icon>Offers</div>
        <p class="text-xs">{{ offers().length }} lignes</p>
      </button>
      <button (click)="activeTab.set('applications')" [ngClass]="tabClass('applications')" class="rounded-2xl border p-4 text-left transition-all">
        <div class="mb-1 flex items-center gap-2 font-bold text-sm"><lucide-icon [name]="FileText" [size]="16"></lucide-icon>Applications</div>
        <p class="text-xs">{{ applications().length }} lignes</p>
      </button>
      <button (click)="activeTab.set('documents')" [ngClass]="tabClass('documents')" class="rounded-2xl border p-4 text-left transition-all">
        <div class="mb-1 flex items-center gap-2 font-bold text-sm"><lucide-icon [name]="FileCheck2" [size]="16"></lucide-icon>Documents</div>
        <p class="text-xs">{{ documents().length }} lignes</p>
      </button>
      <button (click)="activeTab.set('evaluations')" [ngClass]="tabClass('evaluations')" class="rounded-2xl border p-4 text-left transition-all">
        <div class="mb-1 flex items-center gap-2 font-bold text-sm"><lucide-icon [name]="BadgeCheck" [size]="16"></lucide-icon>Evaluations</div>
        <p class="text-xs">{{ evaluations().length }} lignes</p>
      </button>
      <button (click)="openClientChatTab()" [ngClass]="tabClass('chat')" class="rounded-2xl border p-4 text-left transition-all">
        <div class="mb-1 flex items-center gap-2 font-bold text-sm"><lucide-icon [name]="FileText" [size]="16"></lucide-icon>Chat</div>
        <p class="text-xs">{{ chatMessages().length }} messages<span *ngIf="chatUnreadCount() > 0"> • {{ chatUnreadCount() }} nouveau(x)</span></p>
      </button>
    </div>

    <div class="rounded-3xl border border-border bg-white p-6">
      <div class="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {{ activeTab() }} • {{ currentCount() }} résultats
      </div>

      <div *ngIf="activeTab() === 'internships'" class="space-y-3">
        <div *ngFor="let item of internships()" class="rounded-2xl border border-border p-4">
          <p class="font-bold text-sm">{{ item.name }}</p>
          <p class="text-xs text-muted-foreground mt-1">{{ item.startDate }} → {{ item.endDate }}</p>
          <p class="text-xs text-muted-foreground mt-1">Capacité max: {{ item.maxNumber }}</p>
          <div class="mt-2 space-y-1">
            <div class="flex items-center justify-between text-xs font-semibold">
              <span>{{ getParticipantCount(item.id ?? 0) }}/{{ item.maxNumber }} stagiaires</span>
              <span>{{ getOccupancyPercent(item.id ?? 0) | number: '1.0-0' }}% • {{ getRemainingSlots(item.id ?? 0) }} restant(s)</span>
            </div>
            <div class="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
              <div class="h-full rounded-full bg-teal-600 transition-all" [style.width.%]="getOccupancyPercent(item.id ?? 0)"></div>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-1">{{ item.objectives || 'Aucun objectif' }}</p>
          <span class="inline-flex mt-2 rounded-full px-2.5 py-1 text-[10px] font-bold" [ngClass]="isInternshipClosedOrFull(item.id ?? 0) ? 'bg-rose-100 text-rose-700' : 'bg-teal-50 text-teal-700'">
            {{ isInternshipClosedOrFull(item.id ?? 0) ? 'COMPLET' : item.status }}
          </span>
        </div>
      </div>

      <div *ngIf="activeTab() === 'offers'" class="space-y-3">
        <div *ngFor="let item of offers()" class="rounded-2xl border border-border p-4">
          <p class="font-bold text-sm">{{ item.titre }}</p>
          <p class="text-xs text-muted-foreground mt-1">{{ item.company }} • {{ item.location }}</p>
          <p class="text-xs mt-2">Deadline: {{ item.deadline }} • Status: {{ item.status }}</p>
        </div>
      </div>

      <div *ngIf="activeTab() === 'applications'" class="space-y-3">
        <div *ngFor="let item of applications()" class="rounded-2xl border border-border p-4">
          <p class="font-bold text-sm">{{ getInternshipName(item.internshipId) }}</p>
          <p class="text-xs text-muted-foreground mt-1">{{ item.firstName }} {{ item.lastName }} • {{ item.age }} ans</p>
          <p class="font-bold text-sm">{{ item.status }}</p>
          <p class="text-xs text-muted-foreground mt-1">Applied at: {{ item.appliedAt }}</p>
          <p class="text-xs mt-2">{{ item.motivation || 'Aucune motivation' }}</p>
        </div>
      </div>

      <div *ngIf="activeTab() === 'documents'" class="space-y-3">
        <div *ngFor="let item of documents()" class="rounded-2xl border border-border p-4">
          <p class="text-xs text-muted-foreground">Application #{{ item.applicationId }}</p>
          <p class="font-bold text-sm">{{ item.type }}</p>
          <p class="text-xs text-muted-foreground mt-1">{{ item.url || 'Sans URL' }}</p>
          <p class="text-xs mt-2">Validé: {{ item.isValidated ? 'Oui' : 'Non' }}</p>
        </div>
      </div>

      <div *ngIf="activeTab() === 'evaluations'" class="space-y-3">
        <div *ngFor="let item of evaluations()" class="rounded-2xl border border-border p-4">
          <p class="font-bold text-sm">Note: {{ item.score }}/20</p>
          <p class="text-xs text-muted-foreground mt-1">{{ item.feedback || 'Aucun feedback' }}</p>
          <p class="text-xs mt-2">Evaluated at: {{ item.evaluatedAt }}</p>
        </div>
      </div>

      <div *ngIf="activeTab() === 'chat'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select [ngModel]="chatApplicationId()" (ngModelChange)="onClientChatApplicationChange($event)" class="rounded-2xl border border-border bg-muted/20 px-4 py-3 outline-none md:col-span-2">
            <option [ngValue]="0">Choisir une candidature</option>
            <option *ngFor="let application of applications()" [ngValue]="application.id">#{{ application.id }} - {{ application.firstName }} {{ application.lastName }}</option>
          </select>
          <button (click)="connectClientChat()" [disabled]="chatApplicationId() <= 0" class="rounded-2xl bg-teal-600 px-4 py-3 text-white text-sm font-bold hover:bg-teal-700 disabled:opacity-50">
            Ouvrir le chat
          </button>
        </div>
        <div class="rounded-2xl border border-border bg-muted/10 p-4 h-80 overflow-y-auto space-y-3">
          <p *ngIf="chatMessages().length === 0" class="text-xs text-muted-foreground">Aucun message pour ce salon.</p>
          <div *ngFor="let message of chatMessages()" class="rounded-xl px-3 py-2 text-sm" [ngClass]="message.senderRole === 'CLIENT' ? 'bg-teal-50 border border-teal-200 ml-8' : 'bg-white border border-border mr-8'">
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-xs">{{ message.senderName }} ({{ message.senderRole }})</span>
              <span class="text-[10px] text-muted-foreground">{{ message.sentAt | date:'short' }}</span>
            </div>
            <p class="mt-1 whitespace-pre-wrap">{{ message.content }}</p>
          </div>
        </div>
        <div class="space-y-3">
          <textarea [ngModel]="chatDraft()" (ngModelChange)="chatDraft.set($event)" maxlength="2000" placeholder="Écrire un message à l’admin..." class="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 outline-none min-h-24"></textarea>
          <div class="flex items-center justify-between">
            <p class="text-xs" [ngClass]="chatConnected() ? 'text-emerald-700' : 'text-amber-700'">
              {{ chatConnected() ? 'Chat connecté en temps réel' : 'Chat non connecté' }}
            </p>
            <button (click)="sendClientChatMessage()" [disabled]="chatSending() || !chatDraft().trim() || chatApplicationId() <= 0" class="rounded-2xl bg-slate-800 px-5 py-2 text-white text-sm font-bold hover:bg-slate-900 disabled:opacity-50">
              {{ chatSending() ? 'Envoi...' : 'Envoyer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
})
export class InternshipsComponent implements OnInit, OnDestroy {
  private readonly internshipApi = inject(InternshipApiService);

  readonly BriefcaseBusiness = BriefcaseBusiness;
  readonly Building2 = Building2;
  readonly FileText = FileText;
  readonly FileCheck2 = FileCheck2;
  readonly BadgeCheck = BadgeCheck;

  readonly activeTab = signal<InternshipViewTab>('offers');
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly submittingApplication = signal(false);
  readonly uploadingCv = signal(false);
  readonly selectedCvFileName = signal('');
  readonly submittingDocument = signal(false);
  readonly uploadingDocumentPdf = signal(false);
  readonly selectedDocumentFileName = signal('');
  readonly documentTypes: InternshipDocumentType[] = ['AGREEMENT', 'REPORT', 'CERTIFICATE'];

  readonly internships = signal<Internship[]>([]);
  readonly offers = signal<InternshipOffer[]>([]);
  readonly applications = signal<InternshipApplication[]>([]);
  readonly documents = signal<InternshipDocument[]>([]);
  readonly evaluations = signal<InternshipEvaluation[]>([]);
  readonly chatMessages = signal<ChatMessage[]>([]);
  readonly chatConnected = signal(false);
  readonly chatSending = signal(false);
  readonly chatApplicationId = signal(0);
  readonly chatDraft = signal('');
  readonly chatUnreadCount = signal(0);
  private chatEventSource: EventSource | null = null;
  applicationForm = {
    internshipId: 0,
    firstName: '',
    lastName: '',
    age: 18,
    cvUrl: '',
    motivation: ''
  };
  documentForm = {
    type: 'AGREEMENT' as InternshipDocumentType,
    url: '',
    comment: '',
    applicationId: 0
  };

  readonly currentCount = computed(() => {
    const tab = this.activeTab();
    if (tab === 'internships') return this.internships().length;
    if (tab === 'offers') return this.offers().length;
    if (tab === 'applications') return this.applications().length;
    if (tab === 'documents') return this.documents().length;
    if (tab === 'evaluations') return this.evaluations().length;
    return this.chatMessages().length;
  });

  ngOnInit(): void {
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.closeClientChatStream();
  }

  tabClass(tab: InternshipViewTab): string {
    return this.activeTab() === tab
      ? 'border-teal-200 bg-teal-50 text-teal-700'
      : 'border-border bg-white hover:border-teal-200';
  }

  openClientChatTab(): void {
    this.activeTab.set('chat');
    this.chatUnreadCount.set(0);
    this.ensureBrowserNotificationPermission();
  }

  loadAll(): void {
    this.internshipApi.getInternships().subscribe({
      next: data => this.internships.set(data),
      error: () => this.errorMessage.set('Erreur de chargement des internships')
    });
    this.internshipApi.getOffers().subscribe({
      next: data => this.offers.set(data),
      error: () => this.errorMessage.set('Erreur de chargement des offers')
    });
    this.internshipApi.getApplications().subscribe({
      next: data => {
        const normalizedApplications = data.map(item => ({
          ...item,
          firstName: item.firstName ?? '',
          lastName: item.lastName ?? '',
          age: Number(item.age ?? 0),
          internshipId: Number(item.internship?.id ?? item.internshipId ?? 0)
        }));
        this.applications.set(normalizedApplications);
        const selectedApplicationId = this.normalizeId(this.chatApplicationId());
        const selectedExists = normalizedApplications.some(item => this.normalizeId(item.id) === selectedApplicationId);
        if (!selectedExists) {
          const fallbackApplicationId = this.normalizeId(normalizedApplications[0]?.id);
          this.chatApplicationId.set(fallbackApplicationId);
          this.chatMessages.set([]);
          this.closeClientChatStream();
          this.chatConnected.set(false);
        }
      },
      error: () => this.errorMessage.set('Erreur de chargement des applications')
    });
    this.internshipApi.getDocuments().subscribe({
      next: data => this.documents.set(data.map(item => ({
        ...item,
        applicationId: Number(item.application?.id ?? item.applicationId ?? 0)
      }))),
      error: () => this.errorMessage.set('Erreur de chargement des documents')
    });
    this.internshipApi.getEvaluations().subscribe({
      next: data => this.evaluations.set(data),
      error: () => this.errorMessage.set('Erreur de chargement des evaluations')
    });
  }

  submitApplication(): void {
    const validationError = this.validateApplicationForm();
    if (validationError) {
      this.errorMessage.set(validationError);
      return;
    }
    this.submittingApplication.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    const form = this.applicationForm;
    const payload: InternshipApplicationPayload = {
      appliedAt: new Date().toISOString().slice(0, 19),
      status: 'PENDING',
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      age: Number(form.age),
      cvUrl: form.cvUrl.trim(),
      motivation: form.motivation.trim(),
      internship: {
        id: form.internshipId
      }
    };
    this.internshipApi.createApplication(payload).subscribe({
      next: () => {
        this.successMessage.set('Votre candidature a été envoyée. Elle sera prise en compte dans le stage après validation de l’admin.');
        this.applicationForm = {
          internshipId: 0,
          firstName: '',
          lastName: '',
          age: 18,
          cvUrl: '',
          motivation: ''
        };
        this.selectedCvFileName.set('');
        this.activeTab.set('applications');
        this.loadAll();
        this.submittingApplication.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.buildApplicationSubmitErrorMessage(error));
        this.submittingApplication.set(false);
      }
    });
  }

  validateApplicationForm(): string | null {
    const form = this.applicationForm;
    if (!form.internshipId || form.internshipId <= 0) {
      return 'Veuillez choisir un stage';
    }
    if (this.isInternshipClosedOrFull(form.internshipId)) {
      return 'Ce stage est complet ou déjà complété';
    }
    if (!form.cvUrl.trim()) {
      return 'Le CV PDF est obligatoire';
    }
    if (!form.firstName.trim()) {
      return 'Le prénom est obligatoire';
    }
    if (!form.lastName.trim()) {
      return 'Le nom est obligatoire';
    }
    if (form.firstName.length > 120 || form.lastName.length > 120) {
      return 'Le nom et le prénom ne doivent pas dépasser 120 caractères';
    }
    if (!Number.isInteger(Number(form.age)) || Number(form.age) < 16 || Number(form.age) > 100) {
      return 'L’âge doit être un nombre entre 16 et 100';
    }
    if (form.cvUrl.length > 500) {
      return 'Le CV URL ne doit pas dépasser 500 caractères';
    }
    if (!form.motivation.trim()) {
      return 'La motivation est obligatoire';
    }
    if (form.motivation.length > 2000) {
      return 'La motivation ne doit pas dépasser 2000 caractères';
    }
    return null;
  }

  onApplicationPdfSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.uploadingCv.set(true);
    this.errorMessage.set('');
    this.internshipApi.uploadApplicationCv(file).subscribe({
      next: response => {
        this.applicationForm.cvUrl = response.url;
        this.selectedCvFileName.set(file.name);
        this.uploadingCv.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors de l’upload du CV PDF');
        this.uploadingCv.set(false);
      }
    });
  }

  isInternshipClosedOrFull(internshipId: number): boolean {
    const normalizedInternshipId = this.normalizeId(internshipId);
    if (normalizedInternshipId <= 0) {
      return false;
    }
    const internship = this.internships().find(item => this.normalizeId(item.id) === normalizedInternshipId);
    if (!internship) {
      return false;
    }
    if (internship.status === 'COMPLETED') {
      return true;
    }
    const participantCount = this.getParticipantCount(normalizedInternshipId);
    return participantCount >= internship.maxNumber;
  }

  getParticipantCount(internshipId: number): number {
    const normalizedInternshipId = this.normalizeId(internshipId);
    if (normalizedInternshipId <= 0) {
      return 0;
    }
    return this.applications().filter(item => this.normalizeId(item.internshipId) === normalizedInternshipId && item.status === 'ACCEPTED').length;
  }

  getRemainingSlots(internshipId: number): number {
    const normalizedInternshipId = this.normalizeId(internshipId);
    const internship = this.internships().find(item => this.normalizeId(item.id) === normalizedInternshipId);
    if (!internship) {
      return 0;
    }
    return Math.max(internship.maxNumber - this.getParticipantCount(normalizedInternshipId), 0);
  }

  getOccupancyPercent(internshipId: number): number {
    const normalizedInternshipId = this.normalizeId(internshipId);
    const internship = this.internships().find(item => this.normalizeId(item.id) === normalizedInternshipId);
    if (!internship || internship.maxNumber <= 0) {
      return 0;
    }
    const occupancy = (this.getParticipantCount(normalizedInternshipId) / internship.maxNumber) * 100;
    return Math.min(100, Math.max(0, occupancy));
  }

  private normalizeId(value: number | string | null | undefined): number {
    const normalized = Number(value ?? 0);
    return Number.isFinite(normalized) ? normalized : 0;
  }

  onClientChatApplicationChange(applicationId: number): void {
    this.chatApplicationId.set(this.normalizeId(applicationId));
    this.chatMessages.set([]);
    this.chatDraft.set('');
    this.closeClientChatStream();
    this.chatConnected.set(false);
  }

  connectClientChat(): void {
    const roomId = this.resolveClientRoomId();
    if (!roomId) {
      this.errorMessage.set('Veuillez choisir une candidature pour ouvrir le chat');
      return;
    }
    this.loadClientChatHistory(roomId);
    this.closeClientChatStream();
    this.ensureBrowserNotificationPermission();
    const eventSource = this.internshipApi.createChatEventSource(roomId);
    eventSource.onopen = () => this.chatConnected.set(true);
    eventSource.onmessage = event => {
      if (!event.data) {
        return;
      }
      try {
        const incomingMessage = JSON.parse(event.data) as ChatMessage;
        const wasAdded = this.appendClientChatMessage(incomingMessage);
        if (wasAdded) {
          this.handleClientIncomingMessageNotification(incomingMessage);
        }
      } catch {
        return;
      }
    };
    eventSource.onerror = () => this.chatConnected.set(false);
    this.chatEventSource = eventSource;
    this.successMessage.set('Chat connecté');
    this.errorMessage.set('');
  }

  sendClientChatMessage(): void {
    const roomId = this.resolveClientRoomId();
    const content = this.chatDraft().trim();
    if (!roomId) {
      this.errorMessage.set('Veuillez choisir une candidature pour envoyer un message');
      return;
    }
    if (!content) {
      return;
    }
    const currentApplication = this.applications().find(item => this.normalizeId(item.id) === this.normalizeId(this.chatApplicationId()));
    const senderName = currentApplication
      ? `${currentApplication.firstName} ${currentApplication.lastName}`.trim()
      : 'Client';
    this.chatSending.set(true);
    this.internshipApi.sendChatMessage(roomId, {
      senderRole: 'CLIENT',
      senderName: senderName || 'Client',
      content
    }).subscribe({
      next: message => {
        this.appendClientChatMessage(message);
        this.chatDraft.set('');
        this.chatSending.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors de l’envoi du message');
        this.chatSending.set(false);
      }
    });
  }

  private resolveClientRoomId(): string {
    const applicationId = this.normalizeId(this.chatApplicationId());
    if (applicationId <= 0) {
      return '';
    }
    return `application-${applicationId}`;
  }

  private loadClientChatHistory(roomId: string): void {
    this.internshipApi.getChatMessages(roomId).subscribe({
      next: messages => this.chatMessages.set(messages),
      error: () => this.errorMessage.set('Erreur de chargement de l’historique du chat')
    });
  }

  private appendClientChatMessage(message: ChatMessage): boolean {
    let wasAdded = false;
    this.chatMessages.update(currentMessages => {
      const alreadyExists = currentMessages.some(item => item.id === message.id);
      if (alreadyExists) {
        return currentMessages;
      }
      wasAdded = true;
      return [...currentMessages, message];
    });
    return wasAdded;
  }

  private handleClientIncomingMessageNotification(message: ChatMessage): void {
    if (message.senderRole === 'CLIENT') {
      return;
    }
    const shouldCountAsUnread = this.activeTab() !== 'chat' || document.hidden;
    if (shouldCountAsUnread) {
      this.chatUnreadCount.update(count => count + 1);
    }
    this.successMessage.set(`Nouveau message de ${message.senderName}`);
    this.showBrowserNotification('Nouveau message admin', message.content);
  }

  private ensureBrowserNotificationPermission(): void {
    if (typeof Notification === 'undefined') {
      return;
    }
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  private showBrowserNotification(title: string, body: string): void {
    if (typeof Notification === 'undefined') {
      return;
    }
    if (Notification.permission !== 'granted') {
      return;
    }
    new Notification(title, { body });
  }

  private closeClientChatStream(): void {
    if (this.chatEventSource) {
      this.chatEventSource.close();
      this.chatEventSource = null;
    }
  }

  submitDocument(): void {
    const validationError = this.validateDocumentForm();
    if (validationError) {
      this.errorMessage.set(validationError);
      return;
    }
    this.submittingDocument.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    const payload: InternshipDocumentPayload = {
      type: this.documentForm.type,
      url: this.documentForm.url.trim(),
      uploadedAt: new Date().toISOString().slice(0, 19),
      comment: this.documentForm.comment.trim(),
      isValidated: false,
      application: {
        id: this.documentForm.applicationId
      }
    };
    this.internshipApi.createDocument(payload).subscribe({
      next: () => {
        this.successMessage.set('Document ajouté avec succès');
        this.documentForm = {
          type: 'AGREEMENT',
          url: '',
          comment: '',
          applicationId: 0
        };
        this.selectedDocumentFileName.set('');
        this.loadAll();
        this.submittingDocument.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors de l’ajout du document');
        this.submittingDocument.set(false);
      }
    });
  }

  validateDocumentForm(): string | null {
    if (!this.documentForm.type) {
      return 'Le type du document est obligatoire';
    }
    if (!this.documentForm.url.trim()) {
      return 'Le fichier PDF du document est obligatoire';
    }
    if (!this.documentForm.applicationId || this.documentForm.applicationId <= 0) {
      return 'Veuillez choisir une candidature';
    }
    if (this.documentForm.url.length > 500) {
      return 'Le lien du document ne doit pas dépasser 500 caractères';
    }
    if (this.documentForm.comment.length > 1000) {
      return 'Le commentaire ne doit pas dépasser 1000 caractères';
    }
    return null;
  }

  onDocumentPdfSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.uploadingDocumentPdf.set(true);
    this.errorMessage.set('');
    this.internshipApi.uploadDocumentPdf(file).subscribe({
      next: response => {
        this.documentForm.url = response.url;
        this.selectedDocumentFileName.set(file.name);
        this.uploadingDocumentPdf.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors de l’upload du document PDF');
        this.uploadingDocumentPdf.set(false);
      }
    });
  }

  getInternshipName(internshipId: number): string {
    const internship = this.internships().find(item => item.id === internshipId);
    return internship?.name ?? `Stage #${internshipId}`;
  }

  private buildApplicationSubmitErrorMessage(error: HttpErrorResponse): string {
    const backendError = error.error;
    if (typeof backendError === 'string' && backendError.trim()) {
      return backendError.trim();
    }
    if (backendError && typeof backendError === 'object') {
      const message = backendError.message;
      if (typeof message === 'string' && message.trim()) {
        return message.trim();
      }
      const errorField = backendError.error;
      if (typeof errorField === 'string' && errorField.trim()) {
        return errorField.trim();
      }
    }
    return 'Impossible d’envoyer la candidature pour le moment';
  }
}
