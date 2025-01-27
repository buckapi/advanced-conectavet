import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FriendlyDatePipe } from '@pipes/friendly-date.pipe';

interface RequestWeb {
  id: string;
  name: string;
  email: string;
  typeRegister: string;
  howDid: string;
  created: Date;
  selected?: boolean;
}

@Component({
  selector: 'app-request-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FriendlyDatePipe,
    NgbToastModule
  ],
  templateUrl: './request-dialog.component.html',
  styleUrls: ['./request-dialog.component.scss'],
  providers: [FriendlyDatePipe]
})
export class RequestDialogComponent {
  @Input() request!: RequestWeb;
  showToast = false;
  toastMessage = '';

  constructor(
    public activeModal: NgbActiveModal,
    private friendlyDatePipe: FriendlyDatePipe
  ) {}

  getFormattedDate(date: Date | string): string {
    if (!date) return '';
    return this.friendlyDatePipe.transform(date);
  }

  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast = true;
      this.toastMessage = 'Copiado al portapapeles';
      setTimeout(() => this.showToast = false, 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      this.showToast = true;
      this.toastMessage = 'Error al copiar';
      setTimeout(() => this.showToast = false, 2000);
    }
  }

  processRequest() {
    this.activeModal.close(this.request);
  }
}
