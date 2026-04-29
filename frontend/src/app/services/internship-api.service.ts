import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type InternshipStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type InternshipDocumentType = 'AGREEMENT' | 'REPORT' | 'CERTIFICATE';
export type ChatSenderRole = 'CLIENT' | 'ADMIN';

export interface Internship {
    id?: number;
    name: string;
    maxNumber: number;
    startDate: string;
    endDate: string;
    objectives: string;
    status: InternshipStatus;
}

export interface InternshipOffer {
    id?: number;
    titre: string;
    company: string;
    location: string;
    deadline: string;
    status: string;
    createdAt: string;
}

export interface InternshipApplication {
    id?: number;
    appliedAt: string;
    status: ApplicationStatus;
    firstName: string;
    lastName: string;
    age: number;
    cvUrl: string;
    motivation: string;
    internshipId: number;
    internship?: Internship;
}

export interface InternshipApplicationPayload {
    appliedAt: string;
    status: ApplicationStatus;
    firstName: string;
    lastName: string;
    age: number;
    cvUrl: string;
    motivation: string;
    internship: {
        id: number;
    };
}

export interface InternshipDocument {
    id?: number;
    type: InternshipDocumentType;
    url: string;
    uploadedAt: string;
    comment: string;
    isValidated: boolean;
    applicationId: number;
    application?: InternshipApplication;
}

export interface InternshipDocumentPayload {
    type: InternshipDocumentType;
    url: string;
    uploadedAt: string;
    comment: string;
    isValidated: boolean;
    application: {
        id: number;
    };
}

export interface InternshipEvaluation {
    id?: number;
    score: number;
    feedback: string;
    evaluatedAt: string;
    applicationId: number;
    application?: InternshipApplication;
}

export interface InternshipEvaluationPayload {
    score: number;
    feedback: string;
    evaluatedAt: string;
    application: {
        id: number;
    };
}

export interface ChatMessage {
    id: number;
    roomId: string;
    senderRole: ChatSenderRole;
    senderName: string;
    content: string;
    sentAt: string;
}

export interface ChatMessagePayload {
    senderRole: ChatSenderRole;
    senderName: string;
    content: string;
}

@Injectable({
    providedIn: 'root'
})
export class InternshipApiService {
    private readonly http = inject(HttpClient);
    private readonly apiBase = 'http://localhost:8082/api';

    getInternships(): Observable<Internship[]> {
        return this.http.get<Internship[]>(`${this.apiBase}/internships`);
    }

    createInternship(payload: Internship): Observable<Internship> {
        return this.http.post<Internship>(`${this.apiBase}/internships`, payload);
    }

    updateInternship(id: number, payload: Internship): Observable<Internship> {
        return this.http.put<Internship>(`${this.apiBase}/internships/${id}`, payload);
    }

    deleteInternship(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/internships/${id}`);
    }

    getOffers(): Observable<InternshipOffer[]> {
        return this.http.get<InternshipOffer[]>(`${this.apiBase}/internship-offers`);
    }

    createOffer(payload: InternshipOffer): Observable<InternshipOffer> {
        return this.http.post<InternshipOffer>(`${this.apiBase}/internship-offers`, payload);
    }

    updateOffer(id: number, payload: InternshipOffer): Observable<InternshipOffer> {
        return this.http.put<InternshipOffer>(`${this.apiBase}/internship-offers/${id}`, payload);
    }

    deleteOffer(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/internship-offers/${id}`);
    }

    getApplications(): Observable<InternshipApplication[]> {
        return this.http.get<InternshipApplication[]>(`${this.apiBase}/internship-applications`);
    }

    createApplication(payload: InternshipApplicationPayload): Observable<InternshipApplication> {
        return this.http.post<InternshipApplication>(`${this.apiBase}/internship-applications`, payload);
    }

    updateApplication(id: number, payload: InternshipApplicationPayload): Observable<InternshipApplication> {
        return this.http.put<InternshipApplication>(`${this.apiBase}/internship-applications/${id}`, payload);
    }

    deleteApplication(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/internship-applications/${id}`);
    }

    uploadApplicationCv(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ url: string }>(`${this.apiBase}/internship-applications/upload-cv`, formData);
    }

    getDocuments(): Observable<InternshipDocument[]> {
        return this.http.get<InternshipDocument[]>(`${this.apiBase}/internship-documents`);
    }

    createDocument(payload: InternshipDocumentPayload): Observable<InternshipDocument> {
        return this.http.post<InternshipDocument>(`${this.apiBase}/internship-documents`, payload);
    }

    updateDocument(id: number, payload: InternshipDocumentPayload): Observable<InternshipDocument> {
        return this.http.put<InternshipDocument>(`${this.apiBase}/internship-documents/${id}`, payload);
    }

    deleteDocument(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/internship-documents/${id}`);
    }

    uploadDocumentPdf(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ url: string }>(`${this.apiBase}/internship-documents/upload-pdf`, formData);
    }

    getEvaluations(): Observable<InternshipEvaluation[]> {
        return this.http.get<InternshipEvaluation[]>(`${this.apiBase}/internship-evaluations`);
    }

    createEvaluation(payload: InternshipEvaluationPayload): Observable<InternshipEvaluation> {
        return this.http.post<InternshipEvaluation>(`${this.apiBase}/internship-evaluations`, payload);
    }

    updateEvaluation(id: number, payload: InternshipEvaluationPayload): Observable<InternshipEvaluation> {
        return this.http.put<InternshipEvaluation>(`${this.apiBase}/internship-evaluations/${id}`, payload);
    }

    deleteEvaluation(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/internship-evaluations/${id}`);
    }

    getChatMessages(roomId: string): Observable<ChatMessage[]> {
        return this.http.get<ChatMessage[]>(`${this.apiBase}/chat/rooms/${encodeURIComponent(roomId)}/messages`);
    }

    sendChatMessage(roomId: string, payload: ChatMessagePayload): Observable<ChatMessage> {
        return this.http.post<ChatMessage>(`${this.apiBase}/chat/rooms/${encodeURIComponent(roomId)}/messages`, payload);
    }

    createChatEventSource(roomId: string): EventSource {
        return new EventSource(`${this.apiBase}/chat/rooms/${encodeURIComponent(roomId)}/stream`);
    }
}
