import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-order-dialog',
  templateUrl: './order-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule
  ],
  styles: [`
    .order-details {
      padding: 20px;
    }
    .detail-row {
      margin-bottom: 15px;
      display: flex;
      align-items: center;
    }
    .label {
      font-weight: 500;
      min-width: 150px;
    }
    .badge {
      padding: 5px 10px;
      border-radius: 24px;
      font-weight: 500;
    }
    .badge-success {
      background-color: #28a745;
      color: white;
    }
    .badge-danger {
      background-color: #dc3545;
      color: white;
    }
    .badge-warning {
      background-color: #ffc107;
      color: #212529;
    }
  `]
})
export class OrderDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { order: any }
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
