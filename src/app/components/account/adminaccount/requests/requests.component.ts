import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { RealtimeRequestsWebsService } from '@app/services/realtime-requests.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { FriendlyDatePipe } from '@app/pipes/friendly-date.pipe';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule, 
    NgbTooltipModule,
    FriendlyDatePipe
  ],
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit, OnDestroy {
  requestsWebs: any[] = [];
  private subscription: Subscription = new Subscription();

  constructor(public realtimeRequestsService: RealtimeRequestsWebsService) {
    this.realtimeRequestsService.requestsWebs$.subscribe(requests => {
      this.requestsWebs = requests.map(request => ({
        ...request,
        selected: false
      }));
    });
  }

  onSelectionChange(item: any) {
    // Add selected class to the row
    const row = document.querySelector(`tr[data-id="${item.id}"]`);
    if (row) {
      row.classList.toggle('selected', item.selected);
    }
  }

  processRequest(item: any) {
    Swal.fire({
      title: '¿Procesar registro?',
      text: `¿Desea procesar el registro de ${item.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, procesar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí iría la lógica para procesar el registro
        console.log('Procesando registro:', item);
        Swal.fire(
          '¡Procesado!',
          'El registro ha sido procesado exitosamente.',
          'success'
        );
      }
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
