import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

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
    MatButtonModule,
    MatTooltipModule,
    MatIconModule
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

  getServicesTotal(): number {
    return this.data.order.cart.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
  }

  getConectaVetCommission(): number {
    const servicesTotal = this.getServicesTotal();
    return this.data.order.total - servicesTotal;
  }

  close(): void {
    this.dialogRef.close();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const diaSemana = diasSemana[date.getDay()];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const anio = date.getFullYear();

    return `${diaSemana} ${dia} de ${mes} de ${anio}`;
  }
}
