# Fonction métier avancée : Délivrance de certificats de participation (PDF)

## Objectif
Permettre à l’admin de délivrer un **certificat PDF** à chaque étudiant ayant participé (inscrit) à un événement donné.

## Règles métier
- Seuls les **inscrits** à l’événement peuvent recevoir un certificat.
- Le certificat est généré **à la demande** (pas de stockage en base).
- Contenu du PDF : organisation (Learnivo), titre « Certificat de participation », nom de l’étudiant, titre de l’événement, date de l’événement, date de délivrance.

## Backend (demo)
- **CertificateService** : génération PDF via OpenPDF (Lowagie).
- **GET** `/api/events/{eventId}/certificates/{studentId}` → téléchargement du PDF (403 si l’étudiant n’est pas inscrit à l’événement).
- **GET** `/api/event-registrations?eventId={id}` → liste des participants avec `studentName` pour l’affichage admin.

## Front (lite-version – back office)
- **Events** → pour chaque événement, bouton **Participants & certificats** (icône) → page **Participants : [titre]**.
- Liste des participants (nom, date d’inscription, statut) + bouton **Certificat PDF** par ligne → ouvre le téléchargement du PDF.

## Dépendance
- **OpenPDF** (com.github.librepdf:openpdf) pour la génération PDF.
