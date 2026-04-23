import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Download } from 'lucide-angular';

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './certificate.component.html',
})
export class CertificateComponent {
  readonly DownloadIcon = Download;
}
