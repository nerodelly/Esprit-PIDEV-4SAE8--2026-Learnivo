import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    LucideAngularModule,
    BriefcaseBusiness,
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    FileText,
    ClipboardList,
    FileCheck,
    BadgeCheck,
    Users,
    TrendingUp,
    Calendar
} from 'lucide-angular';
import {
    ApplicationStatus,
    Internship,
    InternshipApiService,
    InternshipApplication,
    InternshipApplicationPayload,
    InternshipDocument,
    InternshipDocumentPayload,
    InternshipDocumentType,
    InternshipEvaluation,
    InternshipEvaluationPayload,
    ChatMessage,
    InternshipOffer,
    InternshipStatus
} from '../../services/internship-api.service';

type InternshipTab = 'internships' | 'offers' | 'applications' | 'documents' | 'evaluations' | 'chat';

@Component({
    selector: 'app-admin-internships',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight">Internship</h1>
          <p class="text-muted-foreground">Gestion complète pour le Internship.</p>
        </div>
        <div class="bg-white border border-border rounded-2xl px-4 py-3 text-xs font-bold text-muted-foreground">
          {{ totalItems() }} éléments chargés
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <button (click)="activeTab.set('internships')" [ngClass]="tabClass('internships')" class="rounded-2xl p-4 text-left transition-all border">
          <div class="flex items-center gap-2 mb-1"><lucide-icon [name]="BriefcaseBusiness" [size]="16"></lucide-icon><span class="font-bold text-sm">Internships</span></div>
          <p class="text-xs opacity-80">{{ internships().length }} lignes</p>
        </button>
        <button (click)="activeTab.set('offers')" [ngClass]="tabClass('offers')" class="rounded-2xl p-4 text-left transition-all border">
          <div class="flex items-center gap-2 mb-1"><lucide-icon [name]="FileText" [size]="16"></lucide-icon><span class="font-bold text-sm">Offers</span></div>
          <p class="text-xs opacity-80">{{ offers().length }} lignes</p>
        </button>
        <button (click)="activeTab.set('applications')" [ngClass]="tabClass('applications')" class="rounded-2xl p-4 text-left transition-all border">
          <div class="flex items-center gap-2 mb-1"><lucide-icon [name]="ClipboardList" [size]="16"></lucide-icon><span class="font-bold text-sm">Applications</span></div>
          <p class="text-xs opacity-80">{{ applications().length }} lignes</p>
        </button>
        <button (click)="activeTab.set('documents')" [ngClass]="tabClass('documents')" class="rounded-2xl p-4 text-left transition-all border">
          <div class="flex items-center gap-2 mb-1"><lucide-icon [name]="FileCheck" [size]="16"></lucide-icon><span class="font-bold text-sm">Documents</span></div>
          <p class="text-xs opacity-80">{{ documents().length }} lignes</p>
        </button>
        <button (click)="activeTab.set('evaluations')" [ngClass]="tabClass('evaluations')" class="rounded-2xl p-4 text-left transition-all border">
          <div class="flex items-center gap-2 mb-1"><lucide-icon [name]="BadgeCheck" [size]="16"></lucide-icon><span class="font-bold text-sm">Evaluations</span></div>
          <p class="text-xs opacity-80">{{ evaluations().length }} lignes</p>
        </button>
        <button (click)="openAdminChatTab()" [ngClass]="tabClass('chat')" class="rounded-2xl p-4 text-left transition-all border">
          <div class="flex items-center gap-2 mb-1"><lucide-icon [name]="FileText" [size]="16"></lucide-icon><span class="font-bold text-sm">Chat</span></div>
          <p class="text-xs opacity-80">{{ adminChatMessages().length }} messages<span *ngIf="adminChatUnreadCount() > 0"> • {{ adminChatUnreadCount() }} nouveau(x)</span></p>
        </button>
      </div>

      <div *ngIf="errorMessage()" class="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-sm font-medium">
        {{ errorMessage() }}
      </div>

      <div *ngIf="successMessage()" class="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-4 text-sm font-medium">
        {{ successMessage() }}
      </div>

      <div *ngIf="activeTab() !== 'applications'" class="bg-white rounded-3xl border border-border p-6 space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 class="text-xl font-extrabold">Statistiques Internship</h2>
            <p class="text-sm text-muted-foreground">Vue détaillée de la capacité, des candidatures et de la performance globale.</p>
          </div>
          <div class="inline-flex items-center rounded-2xl bg-teal-50 text-teal-700 px-4 py-2 text-xs font-bold">
            Taux de remplissage global: {{ internshipAnalytics().fillRate }}%
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div class="rounded-2xl border border-border bg-gradient-to-br from-teal-50 to-white p-4 flex items-start justify-between">
            <div>
              <p class="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Stages</p>
              <p class="mt-1 text-2xl font-extrabold">{{ internshipAnalytics().totalInternships }}</p>
            </div>
            <div class="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <lucide-icon [name]="BriefcaseBusiness" [size]="18"></lucide-icon>
            </div>
          </div>
          <div class="rounded-2xl border border-border bg-gradient-to-br from-cyan-50 to-white p-4 flex items-start justify-between">
            <div>
              <p class="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Capacité totale</p>
              <p class="mt-1 text-2xl font-extrabold">{{ internshipAnalytics().totalCapacity }}</p>
            </div>
            <div class="h-10 w-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center">
              <lucide-icon [name]="Users" [size]="18"></lucide-icon>
            </div>
          </div>
          <div class="rounded-2xl border border-border bg-gradient-to-br from-amber-50 to-white p-4 flex items-start justify-between">
            <div>
              <p class="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Participants acceptés</p>
              <p class="mt-1 text-2xl font-extrabold">{{ internshipAnalytics().totalParticipants }}</p>
            </div>
            <div class="h-10 w-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
              <lucide-icon [name]="TrendingUp" [size]="18"></lucide-icon>
            </div>
          </div>
          <div class="rounded-2xl border border-border bg-gradient-to-br from-emerald-50 to-white p-4 flex items-start justify-between">
            <div>
              <p class="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Places restantes</p>
              <p class="mt-1 text-2xl font-extrabold">{{ internshipAnalytics().remainingSlots }}</p>
            </div>
            <div class="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <lucide-icon [name]="Calendar" [size]="18"></lucide-icon>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="rounded-2xl border border-border p-4 space-y-2">
            <div class="flex items-center justify-between text-sm font-semibold">
              <span>Remplissage capacité</span>
              <span>{{ internshipAnalytics().fillRate }}%</span>
            </div>
            <div class="h-2.5 rounded-full bg-muted/40 overflow-hidden">
              <div class="h-full rounded-full bg-teal-600" [style.width.%]="internshipAnalytics().fillRate"></div>
            </div>
          </div>
          <div class="rounded-2xl border border-border p-4 space-y-2">
            <div class="flex items-center justify-between text-sm font-semibold">
              <span>Taux d’acceptation</span>
              <span>{{ internshipAnalytics().acceptanceRate }}%</span>
            </div>
            <div class="h-2.5 rounded-full bg-muted/40 overflow-hidden">
              <div class="h-full rounded-full bg-emerald-600" [style.width.%]="internshipAnalytics().acceptanceRate"></div>
            </div>
          </div>
          <div class="rounded-2xl border border-border p-4 space-y-2">
            <div class="flex items-center justify-between text-sm font-semibold">
              <span>Documents validés</span>
              <span>{{ internshipAnalytics().documentValidationRate }}%</span>
            </div>
            <div class="h-2.5 rounded-full bg-muted/40 overflow-hidden">
              <div class="h-full rounded-full bg-indigo-600" [style.width.%]="internshipAnalytics().documentValidationRate"></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="rounded-2xl border border-border p-4 space-y-3">
            <h3 class="text-sm font-extrabold">Répartition des statuts</h3>
            <div class="flex flex-wrap gap-2">
              <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700">PLANNED: {{ internshipAnalytics().plannedCount }}</span>
              <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-teal-100 text-teal-700">IN_PROGRESS: {{ internshipAnalytics().inProgressCount }}</span>
              <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-700">COMPLETED: {{ internshipAnalytics().completedCount }}</span>
            </div>
            <div class="text-xs text-muted-foreground">
              Note moyenne des évaluations: <span class="font-bold text-foreground">{{ internshipAnalytics().averageScore }}</span>
            </div>
          </div>
          <div class="rounded-2xl border border-border p-4 space-y-3">
            <h3 class="text-sm font-extrabold">Candidatures</h3>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="rounded-xl bg-muted/30 p-3">
                <p class="text-xs text-muted-foreground">PENDING</p>
                <p class="text-lg font-extrabold">{{ internshipAnalytics().pendingApplications }}</p>
              </div>
              <div class="rounded-xl bg-emerald-50 p-3">
                <p class="text-xs text-emerald-700">ACCEPTED</p>
                <p class="text-lg font-extrabold text-emerald-700">{{ internshipAnalytics().acceptedApplications }}</p>
              </div>
              <div class="rounded-xl bg-rose-50 p-3">
                <p class="text-xs text-rose-700">REJECTED</p>
                <p class="text-lg font-extrabold text-rose-700">{{ internshipAnalytics().rejectedApplications }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-border p-4 space-y-3">
          <h3 class="text-sm font-extrabold">Occupation par stage</h3>
          <div class="space-y-3">
            <div *ngFor="let item of internshipAnalytics().perInternship" class="rounded-xl border border-border p-3">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <div class="font-bold text-sm">{{ item.name }}</div>
                <div class="flex items-center gap-2">
                  <span [ngClass]="statusPillClass(item.status)" class="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold">{{ item.status }}</span>
                  <span class="text-xs font-semibold text-muted-foreground">{{ item.participants }}/{{ item.capacity }} • {{ item.remaining }} restant(s)</span>
                </div>
              </div>
              <div class="mt-2 h-2.5 rounded-full bg-muted/40 overflow-hidden">
                <div class="h-full rounded-full transition-all" [ngClass]="item.occupancy >= 90 ? 'bg-rose-600' : item.occupancy >= 70 ? 'bg-amber-500' : 'bg-teal-600'" [style.width.%]="item.occupancy"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="activeTab() === 'internships'" class="space-y-5">
        <div class="bg-white rounded-3xl border border-border p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="font-extrabold text-lg">{{ internshipEditId() ? 'Modifier Internship' : 'Créer Internship' }}</h2>
            <button *ngIf="internshipEditId()" (click)="resetInternshipForm()" class="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"><lucide-icon [name]="X" [size]="13"></lucide-icon>Annuler</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input [(ngModel)]="internshipForm.name" placeholder="Nom du stage" required maxlength="120" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none md:col-span-2" />
            <input [(ngModel)]="internshipForm.maxNumber" type="number" min="1" required placeholder="Nombre max de stagiaires" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none md:col-span-2" />
            <input [(ngModel)]="internshipForm.startDate" type="date" required class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none" />
            <input [(ngModel)]="internshipForm.endDate" type="date" required class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none" />
            <input [(ngModel)]="internshipForm.objectives" placeholder="Objectifs du stage" maxlength="1000" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none md:col-span-2" />
            <select [(ngModel)]="internshipForm.status" required class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none">
              <option *ngFor="let status of internshipStatuses" [value]="status">{{ status }}</option>
            </select>
          </div>
          <button (click)="saveInternship()" [disabled]="loading() || isInternshipFormInvalid()" class="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
            <lucide-icon [name]="Save" [size]="16"></lucide-icon>{{ internshipEditId() ? 'Mettre à jour' : 'Créer' }}
          </button>
        </div>

        <div class="bg-white rounded-3xl border border-border overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr><th class="p-4 text-left">Nom</th><th class="p-4 text-left">Max</th><th class="p-4 text-left">Start</th><th class="p-4 text-left">End</th><th class="p-4 text-left">Objectives</th><th class="p-4 text-left">Status</th><th class="p-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of internships()" class="border-t border-border">
                <td class="p-4">{{ row.name }}</td><td class="p-4">{{ row.maxNumber }}</td><td class="p-4">{{ row.startDate }}</td><td class="p-4">{{ row.endDate }}</td><td class="p-4">{{ row.objectives }}</td><td class="p-4">{{ row.status }}</td>
                <td class="p-4">
                  <div class="flex items-center justify-end gap-2">
                    <button (click)="editInternship(row)" class="p-2 rounded-lg hover:bg-teal-50"><lucide-icon [name]="Pencil" [size]="15"></lucide-icon></button>
                    <button (click)="removeInternship(row)" class="p-2 rounded-lg hover:bg-red-50 hover:text-red-600"><lucide-icon [name]="Trash2" [size]="15"></lucide-icon></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="activeTab() === 'offers'" class="space-y-5">
        <div class="bg-white rounded-3xl border border-border p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="font-extrabold text-lg">{{ offerEditId() ? 'Modifier Offer' : 'Créer Offer' }}</h2>
            <button *ngIf="offerEditId()" (click)="resetOfferForm()" class="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"><lucide-icon [name]="X" [size]="13"></lucide-icon>Annuler</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input [(ngModel)]="offerForm.titre" placeholder="Titre" required maxlength="120" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none" />
            <input [(ngModel)]="offerForm.company" placeholder="Company" required maxlength="120" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none" />
            <input [(ngModel)]="offerForm.location" placeholder="Location" required maxlength="120" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none" />
            <input [(ngModel)]="offerForm.deadline" type="date" [min]="todayDateString()" required class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none" />
            <input [(ngModel)]="offerForm.status" placeholder="Status" required maxlength="60" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none" />
            <input [(ngModel)]="offerForm.createdAt" type="datetime-local" required class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none" />
          </div>
          <button (click)="saveOffer()" [disabled]="loading() || isOfferFormInvalid()" class="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
            <lucide-icon [name]="Save" [size]="16"></lucide-icon>{{ offerEditId() ? 'Mettre à jour' : 'Créer' }}
          </button>
        </div>

        <div class="bg-white rounded-3xl border border-border overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr><th class="p-4 text-left">Titre</th><th class="p-4 text-left">Company</th><th class="p-4 text-left">Location</th><th class="p-4 text-left">Deadline</th><th class="p-4 text-left">Status</th><th class="p-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of offers()" class="border-t border-border">
                <td class="p-4">{{ row.titre }}</td><td class="p-4">{{ row.company }}</td><td class="p-4">{{ row.location }}</td><td class="p-4">{{ row.deadline }}</td><td class="p-4">{{ row.status }}</td>
                <td class="p-4">
                  <div class="flex items-center justify-end gap-2">
                    <button (click)="editOffer(row)" class="p-2 rounded-lg hover:bg-teal-50"><lucide-icon [name]="Pencil" [size]="15"></lucide-icon></button>
                    <button (click)="removeOffer(row)" class="p-2 rounded-lg hover:bg-red-50 hover:text-red-600"><lucide-icon [name]="Trash2" [size]="15"></lucide-icon></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="activeTab() === 'applications'" class="space-y-5">
        <div class="bg-white rounded-3xl border border-border p-6 space-y-6">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 class="text-xl font-extrabold">Statistiques Candidatures</h2>
              <p class="text-sm text-muted-foreground">Suivi détaillé des statuts, du niveau de complétude et de la répartition par stage.</p>
            </div>
            <div class="inline-flex items-center rounded-2xl bg-emerald-50 text-emerald-700 px-4 py-2 text-xs font-bold">
              Taux d’acceptation global: {{ applicationAnalytics().acceptanceRate }}%
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div class="rounded-2xl border border-border bg-gradient-to-br from-teal-50 to-white p-4">
              <p class="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Total candidatures</p>
              <p class="mt-1 text-2xl font-extrabold">{{ applicationAnalytics().totalApplications }}</p>
            </div>
            <div class="rounded-2xl border border-border bg-gradient-to-br from-cyan-50 to-white p-4">
              <p class="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Aujourd’hui</p>
              <p class="mt-1 text-2xl font-extrabold">{{ applicationAnalytics().applicationsToday }}</p>
            </div>
            <div class="rounded-2xl border border-border bg-gradient-to-br from-indigo-50 to-white p-4">
              <p class="text-xs text-muted-foreground font-semibold uppercase tracking-wide">CV complétés</p>
              <p class="mt-1 text-2xl font-extrabold">{{ applicationAnalytics().cvCompletionRate }}%</p>
            </div>
            <div class="rounded-2xl border border-border bg-gradient-to-br from-emerald-50 to-white p-4">
              <p class="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Applications évaluées</p>
              <p class="mt-1 text-2xl font-extrabold">{{ applicationAnalytics().evaluationCoverageRate }}%</p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="rounded-2xl border border-border p-4 space-y-2">
              <div class="flex items-center justify-between text-sm font-semibold">
                <span>En attente</span>
                <span>{{ applicationAnalytics().pendingRate }}%</span>
              </div>
              <div class="h-2.5 rounded-full bg-muted/40 overflow-hidden">
                <div class="h-full rounded-full bg-amber-500" [style.width.%]="applicationAnalytics().pendingRate"></div>
              </div>
            </div>
            <div class="rounded-2xl border border-border p-4 space-y-2">
              <div class="flex items-center justify-between text-sm font-semibold">
                <span>Acceptées</span>
                <span>{{ applicationAnalytics().acceptanceRate }}%</span>
              </div>
              <div class="h-2.5 rounded-full bg-muted/40 overflow-hidden">
                <div class="h-full rounded-full bg-emerald-600" [style.width.%]="applicationAnalytics().acceptanceRate"></div>
              </div>
            </div>
            <div class="rounded-2xl border border-border p-4 space-y-2">
              <div class="flex items-center justify-between text-sm font-semibold">
                <span>Rejetées</span>
                <span>{{ applicationAnalytics().rejectionRate }}%</span>
              </div>
              <div class="h-2.5 rounded-full bg-muted/40 overflow-hidden">
                <div class="h-full rounded-full bg-rose-600" [style.width.%]="applicationAnalytics().rejectionRate"></div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="rounded-2xl border border-border p-4 space-y-3">
              <h3 class="text-sm font-extrabold">Répartition des candidatures</h3>
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="rounded-xl bg-amber-50 p-3">
                  <p class="text-xs text-amber-700">PENDING</p>
                  <p class="text-lg font-extrabold text-amber-700">{{ applicationAnalytics().pendingApplications }}</p>
                </div>
                <div class="rounded-xl bg-emerald-50 p-3">
                  <p class="text-xs text-emerald-700">ACCEPTED</p>
                  <p class="text-lg font-extrabold text-emerald-700">{{ applicationAnalytics().acceptedApplications }}</p>
                </div>
                <div class="rounded-xl bg-rose-50 p-3">
                  <p class="text-xs text-rose-700">REJECTED</p>
                  <p class="text-lg font-extrabold text-rose-700">{{ applicationAnalytics().rejectedApplications }}</p>
                </div>
              </div>
              <div class="text-xs text-muted-foreground">
                Motivations renseignées: <span class="font-bold text-foreground">{{ applicationAnalytics().motivationCompletionRate }}%</span>
              </div>
            </div>
            <div class="rounded-2xl border border-border p-4 space-y-3">
              <h3 class="text-sm font-extrabold">Top stages demandés</h3>
              <div class="space-y-3">
                <div *ngFor="let item of applicationAnalytics().perInternship" class="rounded-xl border border-border p-3">
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <div class="font-bold text-sm">{{ item.name }}</div>
                    <div class="text-xs font-semibold text-muted-foreground">{{ item.total }} candidatures</div>
                  </div>
                  <div class="mt-2 h-2.5 rounded-full bg-muted/40 overflow-hidden">
                    <div class="h-full rounded-full bg-teal-600" [style.width.%]="item.acceptanceRate"></div>
                  </div>
                  <div class="mt-2 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                    <span>{{ item.accepted }} acceptées • {{ item.pending }} en attente • {{ item.rejected }} rejetées</span>
                    <span>{{ item.acceptanceRate }}%</span>
                  </div>
                </div>
                <div *ngIf="applicationAnalytics().perInternship.length === 0" class="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
                  Aucune candidature liée à un stage pour le moment.
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-border p-4 space-y-3">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <h3 class="text-sm font-extrabold">Validation admin des candidatures</h3>
              <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-amber-50 text-amber-700">
                En attente: {{ applicationAnalytics().pendingApplications }}
              </span>
            </div>
            <div class="space-y-2">
              <div *ngFor="let item of applications()" class="rounded-xl border border-border p-3">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p class="font-bold text-sm">{{ getInternshipNameById(item.internshipId) }}</p>
                    <p class="text-xs text-muted-foreground">{{ item.firstName }} {{ item.lastName }} • {{ item.age }} ans</p>
                    <p class="text-xs text-muted-foreground">{{ item.appliedAt }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold" [ngClass]="item.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : item.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'">
                      {{ item.status }}
                    </span>
                    <button
                      (click)="updateApplicationStatus(item, 'ACCEPTED')"
                      [disabled]="loading() || item.status === 'ACCEPTED'"
                      [attr.title]="getAcceptApplicationBlockReason(item) ?? ''"
                      class="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3 py-2 text-xs font-bold"
                    >
                      Accepter
                    </button>
                    <button
                      (click)="updateApplicationStatus(item, 'REJECTED')"
                      [disabled]="loading() || item.status === 'REJECTED'"
                      class="rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-3 py-2 text-xs font-bold"
                    >
                      Rejeter
                    </button>
                    <button
                      (click)="removeApplication(item)"
                      [disabled]="loading()"
                      class="rounded-xl bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white px-3 py-2 text-xs font-bold"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
              <div *ngIf="applicationAnalytics().pendingApplications === 0" class="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
                Aucune candidature en attente de validation.
              </div>
            </div>
          </div>
        </div>

      </div>

      <div *ngIf="activeTab() === 'documents'" class="space-y-5">
        <div class="bg-white rounded-3xl border border-border p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="font-extrabold text-lg">{{ documentEditId() ? 'Modifier Document' : 'Créer Document' }}</h2>
            <button *ngIf="documentEditId()" (click)="resetDocumentForm()" class="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"><lucide-icon [name]="X" [size]="13"></lucide-icon>Annuler</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select [(ngModel)]="documentForm.type" required class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none">
              <option *ngFor="let type of documentTypes" [value]="type">{{ type }}</option>
            </select>
            <select [(ngModel)]="documentForm.applicationId" required class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none">
              <option [ngValue]="0">Sélectionner une application</option>
              <option *ngFor="let application of applications()" [ngValue]="application.id">{{ formatApplicationLabel(application) }}</option>
            </select>
            <div class="md:col-span-2 space-y-2">
              <input type="file" accept=".pdf,application/pdf" (change)="onDocumentPdfSelected($event)" [disabled]="uploadingDocumentPdf() || loading()" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none" />
              <p *ngIf="uploadingDocumentPdf()" class="text-xs text-muted-foreground font-medium">Upload du PDF en cours...</p>
              <p *ngIf="selectedDocumentFileName()" class="text-xs text-emerald-700 font-medium">PDF sélectionné: {{ selectedDocumentFileName() }}</p>
            </div>
            <input [(ngModel)]="documentForm.url" placeholder="Document URL" required maxlength="500" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none" />
            <input [(ngModel)]="documentForm.uploadedAt" type="datetime-local" required class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none" />
            <input [(ngModel)]="documentForm.comment" placeholder="Commentaire" maxlength="1000" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none" />
            <label class="flex items-center gap-2 text-sm font-medium md:col-span-2">
              <input [(ngModel)]="documentForm.isValidated" type="checkbox" class="w-4 h-4" />
              Document validé
            </label>
          </div>
          <button (click)="saveDocument()" [disabled]="loading() || isDocumentFormInvalid()" class="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
            <lucide-icon [name]="Save" [size]="16"></lucide-icon>{{ documentEditId() ? 'Mettre à jour' : 'Créer' }}
          </button>
        </div>

        <div class="bg-white rounded-3xl border border-border overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr><th class="p-4 text-left">Application</th><th class="p-4 text-left">Type</th><th class="p-4 text-left">URL</th><th class="p-4 text-left">Uploaded</th><th class="p-4 text-left">Validated</th><th class="p-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of documents()" class="border-t border-border">
                <td class="p-4">#{{ row.applicationId }}</td><td class="p-4">{{ row.type }}</td><td class="p-4">{{ row.url }}</td><td class="p-4">{{ row.uploadedAt }}</td><td class="p-4">{{ row.isValidated ? 'Oui' : 'Non' }}</td>
                <td class="p-4">
                  <div class="flex items-center justify-end gap-2">
                    <button (click)="editDocument(row)" class="p-2 rounded-lg hover:bg-teal-50"><lucide-icon [name]="Pencil" [size]="15"></lucide-icon></button>
                    <button (click)="removeDocument(row)" class="p-2 rounded-lg hover:bg-red-50 hover:text-red-600"><lucide-icon [name]="Trash2" [size]="15"></lucide-icon></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="activeTab() === 'evaluations'" class="space-y-5">
        <div class="bg-white rounded-3xl border border-border p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="font-extrabold text-lg">{{ evaluationEditId() ? 'Modifier Evaluation' : 'Créer Evaluation' }}</h2>
            <button *ngIf="evaluationEditId()" (click)="resetEvaluationForm()" class="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"><lucide-icon [name]="X" [size]="13"></lucide-icon>Annuler</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input [(ngModel)]="evaluationForm.score" type="number" step="0.1" min="0" max="20" placeholder="Note /20" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none" />
            <select [(ngModel)]="evaluationForm.applicationId" required class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none">
              <option [ngValue]="0">Sélectionner une application</option>
              <option *ngFor="let application of applications()" [ngValue]="application.id">{{ formatApplicationLabel(application) }}</option>
            </select>
            <input [(ngModel)]="evaluationForm.evaluatedAt" type="datetime-local" required class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none" />
            <input [(ngModel)]="evaluationForm.feedback" placeholder="Feedback" maxlength="2000" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none md:col-span-2" />
          </div>
          <button (click)="saveEvaluation()" [disabled]="loading() || isEvaluationFormInvalid()" class="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
            <lucide-icon [name]="Save" [size]="16"></lucide-icon>{{ evaluationEditId() ? 'Mettre à jour' : 'Créer' }}
          </button>
        </div>

        <div class="bg-white rounded-3xl border border-border overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr><th class="p-4 text-left">Application</th><th class="p-4 text-left">Note /20</th><th class="p-4 text-left">Feedback</th><th class="p-4 text-left">Evaluated At</th><th class="p-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of evaluations()" class="border-t border-border">
                <td class="p-4">#{{ row.applicationId }}</td><td class="p-4">{{ row.score }}</td><td class="p-4">{{ row.feedback }}</td><td class="p-4">{{ row.evaluatedAt }}</td>
                <td class="p-4">
                  <div class="flex items-center justify-end gap-2">
                    <button (click)="generateInternshipCertificate(row)" class="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold">Attestation</button>
                    <button (click)="editEvaluation(row)" class="p-2 rounded-lg hover:bg-teal-50"><lucide-icon [name]="Pencil" [size]="15"></lucide-icon></button>
                    <button (click)="removeEvaluation(row)" class="p-2 rounded-lg hover:bg-red-50 hover:text-red-600"><lucide-icon [name]="Trash2" [size]="15"></lucide-icon></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="activeTab() === 'chat'" class="space-y-5">
        <div class="bg-white rounded-3xl border border-border p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select [ngModel]="adminChatApplicationId()" (ngModelChange)="onAdminChatApplicationChange($event)" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none md:col-span-2">
              <option [ngValue]="0">Sélectionner une candidature</option>
              <option *ngFor="let application of applications()" [ngValue]="application.id">{{ formatApplicationLabel(application) }}</option>
            </select>
            <input [ngModel]="adminChatSenderName()" (ngModelChange)="adminChatSenderName.set($event)" maxlength="120" placeholder="Nom affiché admin" class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none" />
            <button (click)="connectAdminChat()" [disabled]="adminChatApplicationId() <= 0" class="rounded-2xl bg-teal-600 text-white px-5 py-3 text-sm font-bold hover:bg-teal-700 disabled:opacity-50">Ouvrir le chat</button>
          </div>
          <div class="h-80 overflow-y-auto rounded-2xl border border-border bg-muted/10 p-4 space-y-3">
            <p *ngIf="adminChatMessages().length === 0" class="text-xs text-muted-foreground">Aucun message pour ce salon.</p>
            <div *ngFor="let message of adminChatMessages()" class="rounded-xl px-3 py-2 text-sm" [ngClass]="message.senderRole === 'ADMIN' ? 'bg-teal-50 border border-teal-200 ml-8' : 'bg-white border border-border mr-8'">
              <div class="flex items-center justify-between gap-2">
                <span class="font-bold text-xs">{{ message.senderName }} ({{ message.senderRole }})</span>
                <span class="text-[10px] text-muted-foreground">{{ message.sentAt | date:'short' }}</span>
              </div>
              <p class="mt-1 whitespace-pre-wrap">{{ message.content }}</p>
            </div>
          </div>
          <div class="space-y-3">
            <textarea [ngModel]="adminChatDraft()" (ngModelChange)="adminChatDraft.set($event)" maxlength="2000" placeholder="Écrire un message au client..." class="w-full px-4 py-3 rounded-2xl border border-border bg-muted/20 outline-none min-h-24"></textarea>
            <div class="flex items-center justify-between">
              <p class="text-xs" [ngClass]="adminChatConnected() ? 'text-emerald-700' : 'text-amber-700'">
                {{ adminChatConnected() ? 'Chat connecté en temps réel' : 'Chat non connecté' }}
              </p>
              <button (click)="sendAdminChatMessage()" [disabled]="adminChatSending() || !adminChatDraft().trim() || adminChatApplicationId() <= 0" class="rounded-2xl bg-slate-800 text-white px-5 py-2 text-sm font-bold hover:bg-slate-900 disabled:opacity-50">
                {{ adminChatSending() ? 'Envoi...' : 'Envoyer' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminInternshipsComponent implements OnInit, OnDestroy {
    private readonly internshipApi = inject(InternshipApiService);

    readonly BriefcaseBusiness = BriefcaseBusiness;
    readonly FileText = FileText;
    readonly ClipboardList = ClipboardList;
    readonly FileCheck = FileCheck;
    readonly BadgeCheck = BadgeCheck;
    readonly Users = Users;
    readonly TrendingUp = TrendingUp;
    readonly Calendar = Calendar;
    readonly Save = Save;
    readonly Pencil = Pencil;
    readonly Trash2 = Trash2;
    readonly X = X;

    readonly internshipStatuses: InternshipStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED'];
    readonly applicationStatuses: ApplicationStatus[] = ['PENDING', 'ACCEPTED', 'REJECTED'];
    readonly documentTypes: InternshipDocumentType[] = ['AGREEMENT', 'REPORT', 'CERTIFICATE'];

    readonly activeTab = signal<InternshipTab>('internships');
    readonly loading = signal(false);
    readonly uploadingCv = signal(false);
    readonly uploadingDocumentPdf = signal(false);
    readonly errorMessage = signal('');
    readonly successMessage = signal('');
    readonly selectedCvFileName = signal('');
    readonly selectedDocumentFileName = signal('');

    readonly internships = signal<Internship[]>([]);
    readonly offers = signal<InternshipOffer[]>([]);
    readonly applications = signal<InternshipApplication[]>([]);
    readonly documents = signal<InternshipDocument[]>([]);
    readonly evaluations = signal<InternshipEvaluation[]>([]);
    readonly adminChatMessages = signal<ChatMessage[]>([]);
    readonly adminChatConnected = signal(false);
    readonly adminChatSending = signal(false);
    readonly adminChatApplicationId = signal(0);
    readonly adminChatSenderName = signal('Admin');
    readonly adminChatDraft = signal('');
    readonly adminChatUnreadCount = signal(0);
    private adminChatEventSource: EventSource | null = null;

    readonly internshipEditId = signal<number | null>(null);
    readonly offerEditId = signal<number | null>(null);
    readonly applicationEditId = signal<number | null>(null);
    readonly documentEditId = signal<number | null>(null);
    readonly evaluationEditId = signal<number | null>(null);

    readonly totalItems = computed(() => (
        this.internships().length
        + this.offers().length
        + this.applications().length
        + this.documents().length
        + this.evaluations().length
    ));

    readonly internshipAnalytics = computed(() => {
        const internships = this.internships();
        const applications = this.applications();
        const evaluations = this.evaluations();
        const documents = this.documents();
        const totalApplications = applications.length;
        const totalCapacity = internships.reduce((sum, internship) => sum + internship.maxNumber, 0);
        const acceptedApplications = applications.filter(item => item.status === 'ACCEPTED').length;
        const totalParticipants = acceptedApplications;
        const pendingApplications = applications.filter(item => item.status === 'PENDING').length;
        const rejectedApplications = applications.filter(item => item.status === 'REJECTED').length;
        const fillRate = totalCapacity > 0 ? this.roundMetric((totalParticipants / totalCapacity) * 100) : 0;
        const acceptanceRate = totalApplications > 0 ? this.roundMetric((acceptedApplications / totalApplications) * 100) : 0;
        const validatedDocuments = documents.filter(item => item.isValidated).length;
        const documentValidationRate = documents.length > 0 ? this.roundMetric((validatedDocuments / documents.length) * 100) : 0;
        const averageScore = evaluations.length > 0
            ? this.roundMetric(evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluations.length)
            : 0;
        const perInternship = internships.map(internship => {
            const internshipId = this.normalizeId(internship.id);
            const participants = applications.filter(item => this.normalizeId(item.internshipId) === internshipId && item.status === 'ACCEPTED').length;
            const capacity = internship.maxNumber;
            const remaining = Math.max(capacity - participants, 0);
            const occupancy = capacity > 0 ? this.roundMetric((participants / capacity) * 100) : 0;
            return {
                id: internshipId,
                name: internship.name,
                status: internship.status,
                participants,
                capacity,
                remaining,
                occupancy
            };
        }).sort((a, b) => b.occupancy - a.occupancy);

        return {
            totalInternships: internships.length,
            totalCapacity,
            totalParticipants,
            remainingSlots: Math.max(totalCapacity - totalParticipants, 0),
            fillRate,
            plannedCount: internships.filter(item => item.status === 'PLANNED').length,
            inProgressCount: internships.filter(item => item.status === 'IN_PROGRESS').length,
            completedCount: internships.filter(item => item.status === 'COMPLETED').length,
            acceptedApplications,
            pendingApplications,
            rejectedApplications,
            acceptanceRate,
            documentValidationRate,
            averageScore,
            perInternship
        };
    });

    readonly applicationAnalytics = computed(() => {
        const applications = this.applications();
        const internships = this.internships();
        const evaluations = this.evaluations();
        const totalApplications = applications.length;
        const acceptedApplications = applications.filter(item => item.status === 'ACCEPTED').length;
        const pendingApplications = applications.filter(item => item.status === 'PENDING').length;
        const rejectedApplications = applications.filter(item => item.status === 'REJECTED').length;
        const acceptanceRate = totalApplications > 0 ? this.roundMetric((acceptedApplications / totalApplications) * 100) : 0;
        const pendingRate = totalApplications > 0 ? this.roundMetric((pendingApplications / totalApplications) * 100) : 0;
        const rejectionRate = totalApplications > 0 ? this.roundMetric((rejectedApplications / totalApplications) * 100) : 0;
        const applicationsToday = applications.filter(item => this.toDateKey(item.appliedAt) === this.toDateKey(new Date().toISOString())).length;
        const withCvCount = applications.filter(item => !this.isBlank(item.cvUrl ?? '')).length;
        const withMotivationCount = applications.filter(item => !this.isBlank(item.motivation ?? '')).length;
        const cvCompletionRate = totalApplications > 0 ? this.roundMetric((withCvCount / totalApplications) * 100) : 0;
        const motivationCompletionRate = totalApplications > 0 ? this.roundMetric((withMotivationCount / totalApplications) * 100) : 0;
        const evaluatedApplicationIds = new Set(
            evaluations
                .map(item => item.applicationId)
                .filter(item => item > 0)
        );
        const evaluationCoverageRate = totalApplications > 0
            ? this.roundMetric((evaluatedApplicationIds.size / totalApplications) * 100)
            : 0;
        const perInternship = internships
            .map(internship => {
                const internshipId = this.normalizeId(internship.id);
                const internshipApplications = applications.filter(item => this.normalizeId(item.internshipId) === internshipId);
                const total = internshipApplications.length;
                const accepted = internshipApplications.filter(item => item.status === 'ACCEPTED').length;
                const pending = internshipApplications.filter(item => item.status === 'PENDING').length;
                const rejected = internshipApplications.filter(item => item.status === 'REJECTED').length;
                const internshipAcceptanceRate = total > 0 ? this.roundMetric((accepted / total) * 100) : 0;
                return {
                    id: internshipId,
                    name: internship.name,
                    total,
                    accepted,
                    pending,
                    rejected,
                    acceptanceRate: internshipAcceptanceRate
                };
            })
            .filter(item => item.total > 0)
            .sort((a, b) => b.total - a.total);

        return {
            totalApplications,
            acceptedApplications,
            pendingApplications,
            rejectedApplications,
            acceptanceRate,
            pendingRate,
            rejectionRate,
            applicationsToday,
            cvCompletionRate,
            motivationCompletionRate,
            evaluationCoverageRate,
            perInternship
        };
    });

    internshipForm: Internship = {
        name: '',
        maxNumber: 1,
        startDate: '',
        endDate: '',
        objectives: '',
        status: 'PLANNED'
    };

    offerForm: InternshipOffer = {
        titre: '',
        company: '',
        location: '',
        deadline: '',
        status: '',
        createdAt: this.currentDateTimeLocal()
    };

    applicationForm: InternshipApplication = {
        appliedAt: this.currentDateTimeLocal(),
        status: 'PENDING',
        firstName: '',
        lastName: '',
        age: 18,
        cvUrl: '',
        motivation: '',
        internshipId: 0
    };

    documentForm: InternshipDocument = {
        type: 'AGREEMENT',
        url: '',
        uploadedAt: this.currentDateTimeLocal(),
        comment: '',
        isValidated: false,
        applicationId: 0
    };

    evaluationForm: InternshipEvaluation = {
        score: 0,
        feedback: '',
        evaluatedAt: this.currentDateTimeLocal(),
        applicationId: 0
    };

    ngOnInit(): void {
        this.loadAll();
    }

    ngOnDestroy(): void {
        this.closeAdminChatStream();
    }

    tabClass(tab: InternshipTab): string {
        return this.activeTab() === tab
            ? 'bg-teal-50 border-teal-200 text-teal-700'
            : 'bg-white border-border hover:border-teal-200';
    }

    openAdminChatTab(): void {
        this.activeTab.set('chat');
        this.adminChatUnreadCount.set(0);
        this.ensureBrowserNotificationPermission();
    }

    isInternshipFormInvalid(): boolean {
        return !!this.validateInternshipForm();
    }

    isOfferFormInvalid(): boolean {
        return !!this.validateOfferForm();
    }

    isApplicationFormInvalid(): boolean {
        return this.uploadingCv() || !!this.validateApplicationForm();
    }

    isDocumentFormInvalid(): boolean {
        return this.uploadingDocumentPdf() || !!this.validateDocumentForm();
    }

    isEvaluationFormInvalid(): boolean {
        return !!this.validateEvaluationForm();
    }

    loadAll(): void {
        this.loading.set(true);
        this.errorMessage.set('');
        this.successMessage.set('');
        this.loadInternships();
        this.loadOffers();
        this.loadApplications();
        this.loadDocuments();
        this.loadEvaluations();
        this.loading.set(false);
    }

    loadInternships(): void {
        this.internshipApi.getInternships().subscribe({
            next: data => this.internships.set(data),
            error: () => this.errorMessage.set('Erreur de chargement: internships')
        });
    }

    loadOffers(): void {
        this.internshipApi.getOffers().subscribe({
            next: data => this.offers.set(data.map(item => ({ ...item, createdAt: this.toInputDateTime(item.createdAt) }))),
            error: () => this.errorMessage.set('Erreur de chargement: offers')
        });
    }

    loadApplications(): void {
        this.internshipApi.getApplications().subscribe({
            next: data => {
                const normalizedApplications = data.map(item => ({
                    ...item,
                    appliedAt: this.toInputDateTime(item.appliedAt),
                    firstName: item.firstName ?? '',
                    lastName: item.lastName ?? '',
                    age: Number(item.age ?? 0),
                    internshipId: this.normalizeId(item.internship?.id ?? item.internshipId)
                }));
                this.applications.set(normalizedApplications);
                const selectedApplicationId = this.normalizeId(this.adminChatApplicationId());
                const selectedExists = normalizedApplications.some(item => this.normalizeId(item.id) === selectedApplicationId);
                if (!selectedExists) {
                    const fallbackApplicationId = this.normalizeId(normalizedApplications[0]?.id);
                    this.adminChatApplicationId.set(fallbackApplicationId);
                    this.adminChatMessages.set([]);
                    this.closeAdminChatStream();
                    this.adminChatConnected.set(false);
                }
            },
            error: () => this.errorMessage.set('Erreur de chargement: applications')
        });
    }

    loadDocuments(): void {
        this.internshipApi.getDocuments().subscribe({
            next: data => this.documents.set(data.map(item => ({
                ...item,
                uploadedAt: this.toInputDateTime(item.uploadedAt),
                applicationId: this.normalizeId(item.application?.id ?? item.applicationId)
            }))),
            error: () => this.errorMessage.set('Erreur de chargement: documents')
        });
    }

    loadEvaluations(): void {
        this.internshipApi.getEvaluations().subscribe({
            next: data => this.evaluations.set(data.map(item => ({
                ...item,
                evaluatedAt: this.toInputDateTime(item.evaluatedAt),
                applicationId: item.application?.id ?? item.applicationId ?? 0
            }))),
            error: () => this.errorMessage.set('Erreur de chargement: evaluations')
        });
    }

    saveInternship(): void {
        const formError = this.validateInternshipForm();
        if (formError) {
            this.errorMessage.set(formError);
            return;
        }
        this.loading.set(true);
        this.errorMessage.set('');
        this.successMessage.set('');
        const request = this.internshipEditId()
            ? this.internshipApi.updateInternship(this.internshipEditId()!, this.internshipForm)
            : this.internshipApi.createInternship(this.internshipForm);
        request.subscribe({
            next: () => {
                this.successMessage.set(this.internshipEditId() ? 'Internship mis à jour' : 'Internship créé');
                this.resetInternshipForm();
                this.loadInternships();
                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Erreur lors de la sauvegarde de Internship');
                this.loading.set(false);
            }
        });
    }

    editInternship(row: Internship): void {
        if (row.id === undefined) {
            return;
        }
        this.internshipEditId.set(row.id);
        this.internshipForm = { ...row };
    }

    removeInternship(row: Internship): void {
        if (row.id === undefined) {
            return;
        }
        this.loading.set(true);
        this.internshipApi.deleteInternship(row.id).subscribe({
            next: () => {
                this.successMessage.set('Internship supprimé');
                this.loadInternships();
                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Erreur suppression Internship');
                this.loading.set(false);
            }
        });
    }

    resetInternshipForm(): void {
        this.internshipEditId.set(null);
        this.internshipForm = {
            name: '',
            maxNumber: 1,
            startDate: '',
            endDate: '',
            objectives: '',
            status: 'PLANNED'
        };
    }

    saveOffer(): void {
        const formError = this.validateOfferForm();
        if (formError) {
            this.errorMessage.set(formError);
            return;
        }
        this.loading.set(true);
        const payload: InternshipOffer = {
            ...this.offerForm,
            createdAt: this.normalizeDateTime(this.offerForm.createdAt)
        };
        const request = this.offerEditId()
            ? this.internshipApi.updateOffer(this.offerEditId()!, payload)
            : this.internshipApi.createOffer(payload);
        request.subscribe({
            next: () => {
                this.successMessage.set(this.offerEditId() ? 'Offer mis à jour' : 'Offer créé');
                this.resetOfferForm();
                this.loadOffers();
                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Erreur lors de la sauvegarde de Offer');
                this.loading.set(false);
            }
        });
    }

    editOffer(row: InternshipOffer): void {
        if (row.id === undefined) {
            return;
        }
        this.offerEditId.set(row.id);
        this.offerForm = { ...row };
    }

    removeOffer(row: InternshipOffer): void {
        if (row.id === undefined) {
            return;
        }
        this.loading.set(true);
        this.internshipApi.deleteOffer(row.id).subscribe({
            next: () => {
                this.successMessage.set('Offer supprimé');
                this.loadOffers();
                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Erreur suppression Offer');
                this.loading.set(false);
            }
        });
    }

    resetOfferForm(): void {
        this.offerEditId.set(null);
        this.offerForm = {
            titre: '',
            company: '',
            location: '',
            deadline: '',
            status: '',
            createdAt: this.currentDateTimeLocal()
        };
    }

    saveApplication(): void {
        if (this.uploadingCv()) {
            this.errorMessage.set('Veuillez attendre la fin de l’upload du PDF');
            return;
        }
        const formError = this.validateApplicationForm();
        if (formError) {
            this.errorMessage.set(formError);
            return;
        }
        this.loading.set(true);
        const payload: InternshipApplicationPayload = this.toApplicationPayload(this.applicationForm);
        const request = this.applicationEditId()
            ? this.internshipApi.updateApplication(this.applicationEditId()!, payload)
            : this.internshipApi.createApplication(payload);
        request.subscribe({
            next: () => {
                this.successMessage.set(this.applicationEditId() ? 'Application mise à jour' : 'Application créée');
                this.resetApplicationForm();
                this.loadApplications();
                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Erreur lors de la sauvegarde de Application');
                this.loading.set(false);
            }
        });
    }

    editApplication(row: InternshipApplication): void {
        if (row.id === undefined) {
            return;
        }
        this.applicationEditId.set(row.id);
        this.applicationForm = {
            ...row,
            internshipId: row.internship?.id ?? row.internshipId ?? 0
        };
        this.selectedCvFileName.set(this.extractFileName(row.cvUrl));
    }

    removeApplication(row: InternshipApplication): void {
        if (row.id === undefined) {
            return;
        }
        this.loading.set(true);
        this.errorMessage.set('');
        const linkedEvaluationIds = this.evaluations()
            .filter(item => item.applicationId === row.id)
            .map(item => item.id)
            .filter((id): id is number => id !== undefined);
        const linkedDocumentIds = this.documents()
            .filter(item => item.applicationId === row.id)
            .map(item => item.id)
            .filter((id): id is number => id !== undefined);
        const deleteTasks: Array<{ run: () => void }> = [
            ...linkedEvaluationIds.map(evaluationId => ({
                run: () => this.internshipApi.deleteEvaluation(evaluationId).subscribe({
                    next: () => runNextDeleteTask(),
                    error: () => onDeleteTaskError('Impossible de supprimer la candidature: erreur suppression évaluation liée')
                })
            })),
            ...linkedDocumentIds.map(documentId => ({
                run: () => this.internshipApi.deleteDocument(documentId).subscribe({
                    next: () => runNextDeleteTask(),
                    error: () => onDeleteTaskError('Impossible de supprimer la candidature: erreur suppression document lié')
                })
            }))
        ];
        if (deleteTasks.length === 0) {
            this.deleteApplicationById(row.id);
            return;
        }
        let failed = false;
        let cursor = 0;
        const onDeleteTaskError = (message: string) => {
            if (failed) {
                return;
            }
            failed = true;
            this.errorMessage.set(message);
            this.loading.set(false);
        };
        const runNextDeleteTask = () => {
            if (failed) {
                return;
            }
            if (cursor >= deleteTasks.length) {
                this.deleteApplicationById(row.id!);
                return;
            }
            const task = deleteTasks[cursor];
            cursor += 1;
            task.run();
        };
        runNextDeleteTask();
    }

    updateApplicationStatus(row: InternshipApplication, status: ApplicationStatus): void {
        if (row.id === undefined) {
            return;
        }
        if (row.status === status) {
            return;
        }
        if (status === 'ACCEPTED') {
            const blockReason = this.getAcceptApplicationBlockReason(row);
            if (blockReason) {
                this.errorMessage.set(blockReason);
                return;
            }
        }
        if (status === 'ACCEPTED' && !this.canAcceptApplication(row)) {
            this.errorMessage.set('Impossible d’accepter cette candidature');
            return;
        }
        this.loading.set(true);
        this.errorMessage.set('');
        const payload = this.toApplicationPayload({
            ...row,
            internshipId: row.internship?.id ?? row.internshipId ?? 0,
            status
        });
        this.internshipApi.updateApplication(row.id, payload).subscribe({
            next: () => {
                this.successMessage.set(status === 'ACCEPTED' ? 'Candidature acceptée' : 'Candidature rejetée');
                this.loadApplications();
                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Erreur lors de la mise à jour du statut de la candidature');
                this.loading.set(false);
            }
        });
    }

    resetApplicationForm(): void {
        this.applicationEditId.set(null);
        this.selectedCvFileName.set('');
        this.applicationForm = {
            appliedAt: this.currentDateTimeLocal(),
            status: 'PENDING',
            firstName: '',
            lastName: '',
            age: 18,
            cvUrl: '',
            motivation: '',
            internshipId: 0
        };
    }

    onApplicationPdfSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files && input.files.length > 0 ? input.files[0] : null;
        if (!file) {
            return;
        }
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            this.errorMessage.set('Veuillez sélectionner un fichier PDF');
            input.value = '';
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            this.errorMessage.set('Le fichier PDF ne doit pas dépasser 20MB');
            input.value = '';
            return;
        }
        this.uploadingCv.set(true);
        this.errorMessage.set('');
        this.successMessage.set('');
        this.internshipApi.uploadApplicationCv(file).subscribe({
            next: response => {
                this.applicationForm = { ...this.applicationForm, cvUrl: response.url };
                this.selectedCvFileName.set(file.name);
                this.successMessage.set('PDF importé avec succès');
                this.uploadingCv.set(false);
                input.value = '';
            },
            error: error => {
                const backendMessage = error?.status === 0
                    ? 'Upload bloqué: backend indisponible ou CORS non autorisé. Redémarre le backend.'
                    : typeof error?.error?.error === 'string'
                        ? error.error.error
                        : 'Erreur lors de l’upload du PDF';
                this.errorMessage.set(backendMessage);
                this.uploadingCv.set(false);
                input.value = '';
            }
        });
    }

    saveDocument(): void {
        if (this.uploadingDocumentPdf()) {
            this.errorMessage.set('Veuillez attendre la fin de l’upload du PDF');
            return;
        }
        const formError = this.validateDocumentForm();
        if (formError) {
            this.errorMessage.set(formError);
            return;
        }
        this.loading.set(true);
        const payload: InternshipDocumentPayload = this.toDocumentPayload(this.documentForm);
        const request = this.documentEditId()
            ? this.internshipApi.updateDocument(this.documentEditId()!, payload)
            : this.internshipApi.createDocument(payload);
        request.subscribe({
            next: () => {
                this.successMessage.set(this.documentEditId() ? 'Document mis à jour' : 'Document créé');
                this.resetDocumentForm();
                this.loadDocuments();
                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Erreur lors de la sauvegarde de Document');
                this.loading.set(false);
            }
        });
    }

    editDocument(row: InternshipDocument): void {
        if (row.id === undefined) {
            return;
        }
        this.documentEditId.set(row.id);
        this.documentForm = { ...row };
        this.selectedDocumentFileName.set(this.extractFileName(row.url));
    }

    removeDocument(row: InternshipDocument): void {
        if (row.id === undefined) {
            return;
        }
        this.loading.set(true);
        this.internshipApi.deleteDocument(row.id).subscribe({
            next: () => {
                this.successMessage.set('Document supprimé');
                this.loadDocuments();
                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Erreur suppression Document');
                this.loading.set(false);
            }
        });
    }

    resetDocumentForm(): void {
        this.documentEditId.set(null);
        this.selectedDocumentFileName.set('');
        this.documentForm = {
            type: 'AGREEMENT',
            url: '',
            uploadedAt: this.currentDateTimeLocal(),
            comment: '',
            isValidated: false,
            applicationId: 0
        };
    }

    onDocumentPdfSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files && input.files.length > 0 ? input.files[0] : null;
        if (!file) {
            return;
        }
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            this.errorMessage.set('Veuillez sélectionner un fichier PDF');
            input.value = '';
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            this.errorMessage.set('Le fichier PDF ne doit pas dépasser 20MB');
            input.value = '';
            return;
        }
        this.uploadingDocumentPdf.set(true);
        this.errorMessage.set('');
        this.successMessage.set('');
        this.internshipApi.uploadDocumentPdf(file).subscribe({
            next: response => {
                this.documentForm = { ...this.documentForm, url: response.url };
                this.selectedDocumentFileName.set(file.name);
                this.successMessage.set('PDF importé avec succès');
                this.uploadingDocumentPdf.set(false);
                input.value = '';
            },
            error: error => {
                const backendMessage = error?.status === 0
                    ? 'Upload bloqué: backend indisponible ou CORS non autorisé. Redémarre le backend.'
                    : typeof error?.error?.error === 'string'
                        ? error.error.error
                        : 'Erreur lors de l’upload du PDF';
                this.errorMessage.set(backendMessage);
                this.uploadingDocumentPdf.set(false);
                input.value = '';
            }
        });
    }

    saveEvaluation(): void {
        const formError = this.validateEvaluationForm();
        if (formError) {
            this.errorMessage.set(formError);
            return;
        }
        this.loading.set(true);
        const payload: InternshipEvaluationPayload = this.toEvaluationPayload(this.evaluationForm);
        const request = this.evaluationEditId()
            ? this.internshipApi.updateEvaluation(this.evaluationEditId()!, payload)
            : this.internshipApi.createEvaluation(payload);
        request.subscribe({
            next: () => {
                this.successMessage.set(this.evaluationEditId() ? 'Evaluation mise à jour' : 'Evaluation créée');
                this.resetEvaluationForm();
                this.loadEvaluations();
                this.loading.set(false);
            },
            error: error => {
                const backendMessage = typeof error?.error?.error === 'string'
                    ? error.error.error
                    : error?.status === 400
                        ? 'Sauvegarde impossible: vérifie l’application sélectionnée'
                        : 'Erreur lors de la sauvegarde de Evaluation';
                this.errorMessage.set(backendMessage);
                this.loading.set(false);
            }
        });
    }

    editEvaluation(row: InternshipEvaluation): void {
        if (row.id === undefined) {
            return;
        }
        this.evaluationEditId.set(row.id);
        const resolvedApplicationId = row.application?.id ?? row.applicationId ?? 0;
        const fallbackApplicationId = resolvedApplicationId > 0
            ? resolvedApplicationId
            : this.applications()[0]?.id ?? 0;
        this.evaluationForm = {
            ...row,
            applicationId: fallbackApplicationId
        };
    }

    removeEvaluation(row: InternshipEvaluation): void {
        if (row.id === undefined) {
            return;
        }
        this.loading.set(true);
        this.errorMessage.set('');
        this.internshipApi.deleteEvaluation(row.id).subscribe({
            next: () => {
                this.evaluations.set(this.evaluations().filter(item => item.id !== row.id));
                this.successMessage.set('Evaluation supprimée');
                this.loadEvaluations();
                this.loading.set(false);
            },
            error: error => {
                const backendMessage = error?.status === 404
                    ? 'Suppression impossible: évaluation introuvable'
                    : 'Erreur suppression Evaluation';
                this.errorMessage.set(backendMessage);
                this.loading.set(false);
            }
        });
    }

    resetEvaluationForm(): void {
        this.evaluationEditId.set(null);
        this.evaluationForm = {
            score: 0,
            feedback: '',
            evaluatedAt: this.currentDateTimeLocal(),
            applicationId: 0
        };
    }

    private toInputDateTime(value: string): string {
        if (!value) {
            return this.currentDateTimeLocal();
        }
        return value.length >= 16 ? value.slice(0, 16) : value;
    }

    private normalizeDateTime(value: string): string {
        if (!value) {
            return value;
        }
        return value.length === 16 ? `${value}:00` : value;
    }

    private currentDateTimeLocal(): string {
        return new Date().toISOString().slice(0, 16);
    }

    todayDateString(): string {
        return new Date().toISOString().slice(0, 10);
    }

    private validateInternshipForm(): string | null {
        if (this.isBlank(this.internshipForm.name) || !this.internshipForm.maxNumber || !this.internshipForm.startDate || !this.internshipForm.endDate || !this.internshipForm.status) {
            return 'Les champs obligatoires de Internship sont manquants';
        }
        if (this.internshipForm.name.length > 120) {
            return 'Le nom du stage ne doit pas dépasser 120 caractères';
        }
        if (this.internshipForm.maxNumber <= 0) {
            return 'Le nombre max doit être supérieur à 0';
        }
        if (this.internshipForm.endDate < this.internshipForm.startDate) {
            return 'La date de fin doit être supérieure ou égale à la date de début';
        }
        if (this.internshipForm.objectives && this.internshipForm.objectives.length > 1000) {
            return 'Objectives ne doit pas dépasser 1000 caractères';
        }
        return null;
    }

    private validateOfferForm(): string | null {
        if (this.isBlank(this.offerForm.titre) || this.isBlank(this.offerForm.company) || this.isBlank(this.offerForm.location) || this.isBlank(this.offerForm.status) || !this.offerForm.deadline || !this.offerForm.createdAt) {
            return 'Les champs obligatoires de Offer sont manquants';
        }
        if (this.offerForm.deadline < this.todayDateString()) {
            return 'Deadline doit être aujourd’hui ou une date future';
        }
        if (this.offerForm.titre.length > 120 || this.offerForm.company.length > 120 || this.offerForm.location.length > 120) {
            return 'Titre, company et location ne doivent pas dépasser 120 caractères';
        }
        if (this.offerForm.status.length > 60) {
            return 'Status ne doit pas dépasser 60 caractères';
        }
        return null;
    }

    private validateApplicationForm(): string | null {
        if (!this.applicationForm.appliedAt || !this.applicationForm.status || this.isBlank(this.applicationForm.cvUrl) || this.isBlank(this.applicationForm.motivation)) {
            return 'Les champs obligatoires de Application sont manquants';
        }
        if (this.isBlank(this.applicationForm.firstName) || this.isBlank(this.applicationForm.lastName)) {
            return 'Le nom et le prénom sont obligatoires';
        }
        if (!Number.isInteger(Number(this.applicationForm.age)) || Number(this.applicationForm.age) < 16 || Number(this.applicationForm.age) > 100) {
            return 'L’âge doit être un nombre entre 16 et 100';
        }
        if (!this.applicationForm.internshipId || this.applicationForm.internshipId <= 0) {
            return 'Veuillez sélectionner un internship';
        }
        const internship = this.internships().find(item => item.id === this.applicationForm.internshipId);
        if (!internship) {
            return 'Le stage sélectionné est introuvable';
        }
        if (this.applicationForm.status === 'ACCEPTED') {
            if (internship.status === 'COMPLETED') {
                return 'Impossible d’accepter une candidature sur un stage complété';
            }
            const acceptedCount = this.getAcceptedApplicationCountForInternship(this.applicationForm.internshipId, this.applicationEditId());
            if (acceptedCount >= internship.maxNumber) {
                return 'Impossible d’accepter: capacité maximale du stage atteinte';
            }
        }
        if (this.applicationForm.cvUrl.length > 500) {
            return 'CV URL ne doit pas dépasser 500 caractères';
        }
        if (this.applicationForm.firstName.length > 120 || this.applicationForm.lastName.length > 120) {
            return 'Le nom et le prénom ne doivent pas dépasser 120 caractères';
        }
        if (this.applicationForm.motivation.length > 2000) {
            return 'Motivation ne doit pas dépasser 2000 caractères';
        }
        return null;
    }

    private extractFileName(url: string): string {
        if (!url) {
            return '';
        }
        const cleanUrl = url.split('?')[0];
        const lastSlash = cleanUrl.lastIndexOf('/');
        return lastSlash >= 0 ? cleanUrl.slice(lastSlash + 1) : cleanUrl;
    }

    private toApplicationPayload(form: InternshipApplication): InternshipApplicationPayload {
        return {
            appliedAt: this.normalizeDateTime(form.appliedAt),
            status: form.status,
            firstName: (form.firstName ?? '').trim(),
            lastName: (form.lastName ?? '').trim(),
            age: Number(form.age),
            cvUrl: form.cvUrl,
            motivation: form.motivation,
            internship: {
                id: form.internshipId
            }
        };
    }

    formatInternshipLabel(internship: Internship): string {
        return `${internship.name} (max: ${internship.maxNumber})`;
    }

    getInternshipNameById(internshipId: number): string {
        const internship = this.internships().find(item => item.id === internshipId);
        return internship?.name ?? `#${internshipId}`;
    }

    async generateInternshipCertificate(evaluation: InternshipEvaluation): Promise<void> {
        const applicationId = this.normalizeId(evaluation.applicationId);
        const application = this.applications().find(item => this.normalizeId(item.id) === applicationId);
        if (!application) {
            this.errorMessage.set('Attestation impossible: application introuvable');
            return;
        }
        const firstName = (application.firstName ?? '').trim();
        const lastName = (application.lastName ?? '').trim();
        if (this.isBlank(firstName) || this.isBlank(lastName)) {
            this.errorMessage.set('Attestation impossible: prénom/nom manquant dans l’application');
            return;
        }
        const internshipId = this.normalizeId(application.internshipId);
        const internship = this.internships().find(item => this.normalizeId(item.id) === internshipId);
        const internshipName = internship?.name ?? `Stage #${internshipId}`;
        const evaluatedDate = evaluation.evaluatedAt ? new Date(evaluation.evaluatedAt) : new Date();
        const evaluatedAt = Number.isNaN(evaluatedDate.getTime())
            ? new Date().toISOString().slice(0, 10)
            : evaluatedDate.toLocaleDateString('fr-FR');
        const fullName = `${firstName} ${lastName}`;
        const reference = `AT-${this.normalizeId(evaluation.id)}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
        const { jsPDF } = await import('jspdf');

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const contentWidth = pageWidth - margin * 2;

        doc.setFillColor(12, 84, 96);
        doc.roundedRect(margin, margin, contentWidth, 26, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(21);
        doc.text('ATTESTATION DE RÉUSSITE', pageWidth / 2, 25, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text('Validation officielle de stage', pageWidth / 2, 32, { align: 'center' });

        doc.setDrawColor(12, 84, 96);
        doc.setLineWidth(0.7);
        doc.roundedRect(margin, 46, contentWidth, 190, 3, 3, 'S');
        doc.setLineWidth(0.2);
        doc.line(margin + 8, 62, pageWidth - margin - 8, 62);

        doc.setTextColor(23, 23, 23);
        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.text('Certificat de réussite de stage', pageWidth / 2, 58, { align: 'center' });

        doc.setFont('times', 'normal');
        doc.setFontSize(13);
        const bodyText = `Nous attestons que ${fullName} a accompli son stage avec succès au sein du programme "${internshipName}". Cette attestation est délivrée sur la base de l'évaluation finale validée par l'administration.`;
        const wrappedBody = doc.splitTextToSize(bodyText, contentWidth - 24);
        doc.text(wrappedBody, margin + 12, 84);

        doc.setFillColor(245, 249, 251);
        doc.roundedRect(margin + 12, 108, contentWidth - 24, 54, 2, 2, 'F');
        doc.setDrawColor(182, 206, 212);
        doc.roundedRect(margin + 12, 108, contentWidth - 24, 54, 2, 2, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(12, 84, 96);
        doc.text('Détails de validation', margin + 18, 119);

        doc.setTextColor(33, 37, 41);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`Nom et prénom : ${fullName}`, margin + 18, 130);
        doc.text(`Stage : ${internshipName}`, margin + 18, 139);
        doc.text(`Note finale : ${evaluation.score}/20`, margin + 18, 148);
        doc.text(`Date d'évaluation : ${evaluatedAt}`, margin + 18, 157);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(90, 90, 90);
        doc.text(`Référence : ${reference}`, margin + 12, pageHeight - 26);
        doc.text(`Émis le : ${new Date().toLocaleDateString('fr-FR')}`, margin + 12, pageHeight - 20);

        doc.setFont('times', 'italic');
        doc.setFontSize(11);
        doc.setTextColor(20, 20, 20);
        doc.text('Administration des stages', pageWidth - margin - 12, pageHeight - 24, { align: 'right' });
        doc.setFont('times', 'normal');
        doc.text('Signature', pageWidth - margin - 12, pageHeight - 18, { align: 'right' });

        doc.save(`attestation-${this.slugify(`${firstName}-${lastName}`)}-${new Date().toISOString().slice(0, 10)}.pdf`);
        this.successMessage.set('Attestation générée avec succès');
        this.errorMessage.set('');
    }

    onAdminChatApplicationChange(applicationId: number): void {
        this.adminChatApplicationId.set(this.normalizeId(applicationId));
        this.adminChatMessages.set([]);
        this.adminChatDraft.set('');
        this.closeAdminChatStream();
        this.adminChatConnected.set(false);
    }

    connectAdminChat(): void {
        const roomId = this.resolveAdminChatRoomId();
        if (!roomId) {
            this.errorMessage.set('Veuillez sélectionner une candidature pour ouvrir le chat');
            return;
        }
        this.loadAdminChatHistory(roomId);
        this.closeAdminChatStream();
        this.ensureBrowserNotificationPermission();
        const eventSource = this.internshipApi.createChatEventSource(roomId);
        eventSource.onopen = () => this.adminChatConnected.set(true);
        eventSource.onmessage = event => {
            if (!event.data) {
                return;
            }
            try {
                const incomingMessage = JSON.parse(event.data) as ChatMessage;
                const wasAdded = this.appendAdminChatMessage(incomingMessage);
                if (wasAdded) {
                    this.handleAdminIncomingMessageNotification(incomingMessage);
                }
            } catch {
                return;
            }
        };
        eventSource.onerror = () => this.adminChatConnected.set(false);
        this.adminChatEventSource = eventSource;
        this.successMessage.set('Chat admin connecté');
        this.errorMessage.set('');
    }

    sendAdminChatMessage(): void {
        const roomId = this.resolveAdminChatRoomId();
        const content = this.adminChatDraft().trim();
        if (!roomId) {
            this.errorMessage.set('Veuillez sélectionner une candidature pour envoyer un message');
            return;
        }
        if (!content) {
            return;
        }
        const senderName = this.adminChatSenderName().trim() || 'Admin';
        this.adminChatSending.set(true);
        this.internshipApi.sendChatMessage(roomId, {
            senderRole: 'ADMIN',
            senderName,
            content
        }).subscribe({
            next: message => {
                this.appendAdminChatMessage(message);
                this.adminChatDraft.set('');
                this.adminChatSending.set(false);
            },
            error: () => {
                this.errorMessage.set('Erreur lors de l’envoi du message chat');
                this.adminChatSending.set(false);
            }
        });
    }

    private resolveAdminChatRoomId(): string {
        const applicationId = this.normalizeId(this.adminChatApplicationId());
        if (applicationId <= 0) {
            return '';
        }
        return `application-${applicationId}`;
    }

    private loadAdminChatHistory(roomId: string): void {
        this.internshipApi.getChatMessages(roomId).subscribe({
            next: messages => this.adminChatMessages.set(messages),
            error: () => this.errorMessage.set('Erreur de chargement de l’historique chat')
        });
    }

    private appendAdminChatMessage(message: ChatMessage): boolean {
        let wasAdded = false;
        this.adminChatMessages.update(currentMessages => {
            const alreadyExists = currentMessages.some(item => item.id === message.id);
            if (alreadyExists) {
                return currentMessages;
            }
            wasAdded = true;
            return [...currentMessages, message];
        });
        return wasAdded;
    }

    private handleAdminIncomingMessageNotification(message: ChatMessage): void {
        if (message.senderRole === 'ADMIN') {
            return;
        }
        const shouldCountAsUnread = this.activeTab() !== 'chat' || document.hidden;
        if (shouldCountAsUnread) {
            this.adminChatUnreadCount.update(count => count + 1);
        }
        this.successMessage.set(`Nouveau message de ${message.senderName}`);
        this.showBrowserNotification('Nouveau message client', message.content);
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

    private closeAdminChatStream(): void {
        if (this.adminChatEventSource) {
            this.adminChatEventSource.close();
            this.adminChatEventSource = null;
        }
    }

    canAcceptApplication(row: InternshipApplication): boolean {
        return this.getAcceptApplicationBlockReason(row) === null;
    }

    getAcceptApplicationBlockReason(row: InternshipApplication): string | null {
        const internshipId = this.normalizeId(row.internship?.id ?? row.internshipId);
        if (internshipId <= 0) {
            return 'Impossible d’accepter: stage introuvable';
        }
        const internship = this.internships().find(item => this.normalizeId(item.id) === internshipId);
        if (!internship) {
            return 'Impossible d’accepter: stage introuvable';
        }
        if (internship.status === 'COMPLETED') {
            return 'Impossible d’accepter: ce stage est complété';
        }
        const acceptedCount = this.getAcceptedApplicationCountForInternship(internshipId, row.id ?? null);
        if (acceptedCount >= internship.maxNumber) {
            return 'Impossible d’accepter: capacité maximale du stage atteinte';
        }
        return null;
    }

    private deleteApplicationById(applicationId: number): void {
        this.internshipApi.deleteApplication(applicationId).subscribe({
            next: () => {
                this.successMessage.set('Application supprimée');
                this.loadApplications();
                this.loadEvaluations();
                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Erreur suppression Application');
                this.loading.set(false);
            }
        });
    }

    private getAcceptedApplicationCountForInternship(internshipId: number, excludeApplicationId: number | null): number {
        const normalizedInternshipId = this.normalizeId(internshipId);
        return this.applications().filter(item => {
            if (this.normalizeId(item.internshipId) !== normalizedInternshipId || item.status !== 'ACCEPTED') {
                return false;
            }
            if (excludeApplicationId === null) {
                return true;
            }
            return item.id !== excludeApplicationId;
        }).length;
    }

    private normalizeId(value: number | string | null | undefined): number {
        const normalized = Number(value ?? 0);
        return Number.isFinite(normalized) ? normalized : 0;
    }

    formatApplicationLabel(application: InternshipApplication): string {
        return `#${application.id} | ${application.firstName} ${application.lastName} | ${application.status} | stage #${application.internshipId}`;
    }

    statusPillClass(status: InternshipStatus): string {
        if (status === 'COMPLETED') {
            return 'bg-emerald-100 text-emerald-700';
        }
        if (status === 'IN_PROGRESS') {
            return 'bg-teal-100 text-teal-700';
        }
        return 'bg-slate-100 text-slate-700';
    }

    private validateDocumentForm(): string | null {
        if (!this.documentForm.type || this.isBlank(this.documentForm.url) || !this.documentForm.uploadedAt) {
            return 'Les champs obligatoires de Document sont manquants';
        }
        if (!this.documentForm.applicationId || this.documentForm.applicationId <= 0) {
            return 'Veuillez sélectionner une application';
        }
        if (this.documentForm.url.length > 500) {
            return 'Document URL ne doit pas dépasser 500 caractères';
        }
        if (this.documentForm.comment && this.documentForm.comment.length > 1000) {
            return 'Commentaire ne doit pas dépasser 1000 caractères';
        }
        return null;
    }

    private validateEvaluationForm(): string | null {
        if (!this.evaluationForm.evaluatedAt) {
            return 'Les champs obligatoires de Evaluation sont manquants';
        }
        if (!this.evaluationForm.applicationId || this.evaluationForm.applicationId <= 0) {
            return 'Veuillez sélectionner une application';
        }
        if (this.evaluationForm.score < 0 || this.evaluationForm.score > 20) {
            return 'La note doit être entre 0 et 20';
        }
        if (this.evaluationForm.feedback && this.evaluationForm.feedback.length > 2000) {
            return 'Feedback ne doit pas dépasser 2000 caractères';
        }
        return null;
    }

    private toEvaluationPayload(form: InternshipEvaluation): InternshipEvaluationPayload {
        return {
            score: form.score,
            feedback: form.feedback,
            evaluatedAt: this.normalizeDateTime(form.evaluatedAt),
            application: {
                id: form.applicationId
            }
        };
    }

    private toDocumentPayload(form: InternshipDocument): InternshipDocumentPayload {
        return {
            type: form.type,
            url: form.url.trim(),
            uploadedAt: this.normalizeDateTime(form.uploadedAt),
            comment: form.comment?.trim() ?? '',
            isValidated: form.isValidated,
            application: {
                id: form.applicationId
            }
        };
    }

    private isBlank(value: string): boolean {
        return value.trim().length === 0;
    }

    private slugify(value: string): string {
        const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const slug = normalized
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        return slug || 'attestation';
    }

    private toDateKey(value: string): string {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }
        return date.toISOString().slice(0, 10);
    }

    private roundMetric(value: number): number {
        return Math.round(value * 10) / 10;
    }
}
