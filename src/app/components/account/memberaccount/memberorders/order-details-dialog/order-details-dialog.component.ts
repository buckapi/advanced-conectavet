import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  clinicId: string;
}

interface OrderData {
  id: string;
  buyOrder: string;
  cart: CartItem[];
  created: string;
  selectedAppointmentDate?: string;
  status: 'PENDING' | 'AUTHORIZED' | 'REJECTED' | 'CANCELED';
  total: number;
  userId?: string;
}

@Component({
  selector: 'app-order-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './order-details-dialog.component.html',
  styleUrls: ['./order-details-dialog.component.css']
})
export class OrderDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<OrderDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderData
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
