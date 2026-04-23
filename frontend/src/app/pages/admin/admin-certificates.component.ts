import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Award, Plus, Pencil, Trash2, Save, X } from 'lucide-angular';
import { Certificate, CertificateApiService, CertificateStatus, CertificateType } from '../../services/certificate-api.service';

@Component({
  selector: 'app-admin-certificates',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-extrabold">Certificate <span class="text-teal-600 underline decoration-2 underline-offset-4">CRUD</span></h1>
          <p class="text-muted-foreground mt-1">Gérer les certificats: création, modification et suppression.</p>
        </div>
        <button (click)="startCreate()" class="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all">
          <lucide-icon [name]="PlusIcon" [size]="18"></lucide-icon>
          New Certificate
        </button>
      </div>

      <div *ngIf="errorMessage()" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
        {{ errorMessage() }}
      </div>

      <div *ngIf="successMessage()" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
        {{ successMessage() }}
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2 rounded-3xl border border-border bg-white p-5">
          <div class="flex items-center gap-2 mb-4">
            <lucide-icon [name]="AwardIcon" [size]="18" class="text-teal-600"></lucide-icon>
            <h2 class="text-lg font-bold">Certificates</h2>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border text-left">
                  <th class="py-2 pr-3 font-bold">#</th>
                  <th class="py-2 pr-3 font-bold">Number</th>
                  <th class="py-2 pr-3 font-bold">Type</th>
                  <th class="py-2 pr-3 font-bold">Status</th>
                  <th class="py-2 pr-3 font-bold">Issued At</th>
                  <th class="py-2 pr-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (item of certificates(); track item.id ?? item.certificateNumber) {
                  <tr class="border-b border-border/60">
                    <td class="py-2 pr-3">{{ item.id ?? '-' }}</td>
                    <td class="py-2 pr-3 font-medium">{{ item.certificateNumber }}</td>
                    <td class="py-2 pr-3">{{ item.type }}</td>
                    <td class="py-2 pr-3">{{ item.status }}</td>
                    <td class="py-2 pr-3">{{ item.issuedAt }}</td>
                    <td class="py-2 pr-3">
                      <div class="flex items-center gap-2">
                        <button (click)="startEdit(item)" class="rounded-lg p-2 hover:bg-teal-50 hover:text-teal-600 transition-colors">
                          <lucide-icon [name]="PencilIcon" [size]="14"></lucide-icon>
                        </button>
                        <button (click)="remove(item)" class="rounded-lg p-2 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <lucide-icon [name]="TrashIcon" [size]="14"></lucide-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="py-8 text-center text-muted-foreground">Aucun certificat trouvé.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="rounded-3xl border border-border bg-white p-5">
          <h2 class="text-lg font-bold mb-4">{{ editingId() ? 'Edit Certificate' : 'Create Certificate' }}</h2>

          <form (ngSubmit)="save()" class="space-y-3">
            <input [(ngModel)]="form.certificateNumber" name="certificateNumber" placeholder="Certificate Number" class="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-teal-600" required>

            <select [(ngModel)]="form.type" name="type" class="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-teal-600" required>
              @for (type of typeOptions; track type) {
                <option [value]="type">{{ type }}</option>
              }
            </select>

            <select [(ngModel)]="form.status" name="status" class="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-teal-600" required>
              @for (status of statusOptions; track status) {
                <option [value]="status">{{ status }}</option>
              }
            </select>

            <input [(ngModel)]="form.issuedAt" name="issuedAt" type="datetime-local" class="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-teal-600" required>
            <input [(ngModel)]="form.pdfUrl" name="pdfUrl" placeholder="PDF URL" class="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-teal-600">
            <input [(ngModel)]="form.verificationCode" name="verificationCode" placeholder="Verification Code" class="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-teal-600">
            <input [(ngModel)]="form.qrCodeUrl" name="qrCodeUrl" placeholder="QR Code URL" class="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-teal-600">
            <input [(ngModel)]="internshipIdInput" name="internshipId" placeholder="Internship ID (optional)" class="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-teal-600">

            <div class="flex items-center gap-2 pt-2">
              <button type="submit" class="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700">
                <lucide-icon [name]="SaveIcon" [size]="14"></lucide-icon>
                {{ editingId() ? 'Update' : 'Create' }}
              </button>
              <button type="button" (click)="resetForm()" class="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold hover:bg-muted">
                <lucide-icon [name]="XIcon" [size]="14"></lucide-icon>
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AdminCertificatesComponent implements OnInit {
  private readonly certificateApi = inject(CertificateApiService);

  readonly AwardIcon = Award;
  readonly PlusIcon = Plus;
  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly SaveIcon = Save;
  readonly XIcon = X;

  readonly certificates = signal<Certificate[]>([]);
  readonly editingId = signal<number | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly typeOptions: CertificateType[] = ['INTERNSHIP', 'COMPLETION', 'ACHIEVEMENT'];
  readonly statusOptions: CertificateStatus[] = ['DRAFT', 'ISSUED', 'REVOKED'];

  internshipIdInput = '';

  form: Certificate = {
    certificateNumber: '',
    type: 'INTERNSHIP',
    status: 'DRAFT',
    issuedAt: '',
    pdfUrl: '',
    verificationCode: '',
    qrCodeUrl: '',
    internshipId: null
  };

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.certificateApi.getCertificates().subscribe({
      next: data => this.certificates.set(data),
      error: () => this.errorMessage.set('Erreur de chargement des certificats')
    });
  }

  startCreate(): void {
    this.resetForm();
  }

  startEdit(item: Certificate): void {
    this.editingId.set(item.id ?? null);
    this.form = {
      id: item.id,
      certificateNumber: item.certificateNumber,
      type: item.type,
      status: item.status,
      issuedAt: this.toDatetimeLocal(item.issuedAt),
      pdfUrl: item.pdfUrl ?? '',
      verificationCode: item.verificationCode ?? '',
      qrCodeUrl: item.qrCodeUrl ?? '',
      internshipId: item.internshipId ?? null
    };
    this.internshipIdInput = item.internshipId != null ? String(item.internshipId) : '';
  }

  save(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    const payload: Certificate = {
      ...this.form,
      internshipId: this.internshipIdInput.trim() === '' ? null : Number(this.internshipIdInput),
      issuedAt: this.fromDatetimeLocal(this.form.issuedAt)
    };

    if (this.editingId()) {
      this.certificateApi.updateCertificate(this.editingId() as number, payload).subscribe({
        next: () => {
          this.successMessage.set('Certificate mis à jour avec succès');
          this.resetForm();
          this.loadCertificates();
        },
        error: () => this.errorMessage.set('Erreur pendant la mise à jour')
      });
      return;
    }

    this.certificateApi.createCertificate(payload).subscribe({
      next: () => {
        this.successMessage.set('Certificate créé avec succès');
        this.resetForm();
        this.loadCertificates();
      },
      error: () => this.errorMessage.set('Erreur pendant la création')
    });
  }

  remove(item: Certificate): void {
    if (!item.id) {
      return;
    }
    this.errorMessage.set('');
    this.successMessage.set('');
    this.certificateApi.deleteCertificate(item.id).subscribe({
      next: () => {
        this.successMessage.set('Certificate supprimé avec succès');
        this.loadCertificates();
      },
      error: () => this.errorMessage.set('Erreur pendant la suppression')
    });
  }

  resetForm(): void {
    this.editingId.set(null);
    this.internshipIdInput = '';
    this.form = {
      certificateNumber: '',
      type: 'INTERNSHIP',
      status: 'DRAFT',
      issuedAt: '',
      pdfUrl: '',
      verificationCode: '',
      qrCodeUrl: '',
      internshipId: null
    };
  }

  private toDatetimeLocal(value: string): string {
    if (!value) {
      return '';
    }
    return value.length >= 16 ? value.slice(0, 16) : value;
  }

  private fromDatetimeLocal(value: string): string {
    if (!value) {
      return new Date().toISOString();
    }
    return value.length === 16 ? `${value}:00` : value;
  }
}
