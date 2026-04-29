import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type CertificateType = 'INTERNSHIP' | 'COMPLETION' | 'ACHIEVEMENT';
export type CertificateStatus = 'DRAFT' | 'ISSUED' | 'REVOKED';

export interface Certificate {
  id?: number;
  certificateNumber: string;
  type: CertificateType;
  status: CertificateStatus;
  issuedAt: string;
  pdfUrl: string;
  verificationCode: string;
  qrCodeUrl: string;
  internshipId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class CertificateApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:8082/api/certificates';

  getCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(this.apiBase);
  }

  createCertificate(payload: Certificate): Observable<Certificate> {
    return this.http.post<Certificate>(this.apiBase, payload);
  }

  updateCertificate(id: number, payload: Certificate): Observable<Certificate> {
    return this.http.put<Certificate>(`${this.apiBase}/${id}`, payload);
  }

  deleteCertificate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/${id}`);
  }
}
