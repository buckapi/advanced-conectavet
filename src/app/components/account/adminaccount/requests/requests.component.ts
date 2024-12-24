import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RealtimeRequestsWebsService } from '@app/services/realtime-requests.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule  ],
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit, OnDestroy {
  requestsWebs: any[] = [];
  // private subscription: Subscription;
  private subscription: Subscription = new Subscription();


  constructor(public realtimeRequestsService: RealtimeRequestsWebsService) {
    this.realtimeRequestsService.requestsWebs$.subscribe(requests => {
      this.requestsWebs = requests;
      // Swal.fire({
      //       title: 'Solicitudes Recibidas',
      //       text: `Total de solicitudes: ${this.requestsWebs.length}`,
      //       icon: 'info',
      //       confirmButtonText: 'OK'
      //     });
    });

  }

  ngOnInit(): void {
    // this.subscription = this.realtimeRequestsService.requestsWebs$.subscribe(requests => {
    //   this.requestsWebs = requests;
      
    //   Swal.fire({
    //     title: 'Solicitudes Recibidas',
    //     text: `Total de solicitudes: ${this.requestsWebs.length}`,
    //     icon: 'info',
    //     confirmButtonText: 'OK'
    //   });
    // });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.realtimeRequestsService.unsubscribeFromRealtimeChanges();
  }
}
