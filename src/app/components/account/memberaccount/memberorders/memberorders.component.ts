import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RealtimeOrdersService } from '@app/services/realtime-orders.service';
import { GlobalService } from '@app/services/global.service';
import { Observable, Subscription, map, tap, filter, of } from 'rxjs';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  clinicId: string;
}

interface Order {
  id: string;
  buyOrder: string;
  cart: CartItem[];
  collectionId: string;
  collectionName: string;
  created: string;
  idUser: string;
  selectedAppointmentDate?: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  total: number;
  updated: string;
}

@Component({
  selector: 'app-memberorders',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './memberorders.component.html',
  styleUrls: ['./memberorders.component.css']
})
export class MemberordersComponent implements OnInit, OnDestroy {
  memberOrders$: Observable<Order[]>;
  memberId: string;
  private subscription: Subscription = new Subscription();

  constructor(
    private realtimeOrdersService: RealtimeOrdersService,
    public global: GlobalService,
    private dialog: MatDialog
  ) {
    this.memberId = localStorage.getItem('memberId') || '';
    this.memberOrders$ = this.realtimeOrdersService.orders$;
  }

  ngOnInit(): void {
    if (!this.memberId) {
      console.error('No member ID found in localStorage');
    }

    // Suscribirse a los cambios de memberOption
    const memberOptionSub = this.global.memberOption$.pipe(
      filter(option => option === 'memberorders')
    ).subscribe(() => {
      // The orders are already filtered in app.component
      this.memberOrders$ = this.realtimeOrdersService.orders$;
    });

    this.subscription.add(memberOptionSub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
