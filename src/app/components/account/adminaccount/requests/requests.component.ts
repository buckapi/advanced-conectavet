import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { FriendlyDatePipe } from '@pipes/friendly-date.pipe';
import { RealtimeRequestsWebsService } from '@services/realtime-requests.service';
import { RequestDialogComponent } from './request-dialog/request-dialog.component';
import Swal from 'sweetalert2';

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
  selector: 'app-requests',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule, 
    NgbTooltipModule,
    FriendlyDatePipe,
    RequestDialogComponent
  ],
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit, OnDestroy {
  requestsWebs: RequestWeb[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    public realtimeRequestsService: RealtimeRequestsWebsService,
    private modalService: NgbModal
  ) {
    this.subscription = this.realtimeRequestsService.requestsWebs$.subscribe((requests: RequestWeb[]) => {
      this.requestsWebs = requests.map((request: RequestWeb) => ({
        ...request,
        selected: false
      }));
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.realtimeRequestsService.unsubscribeFromRealtimeChanges();
  }

  onSelectionChange(item: RequestWeb): void {
    // Add selected class to the row
    const row = document.querySelector(`tr[data-id="${item.id}"]`);
    if (row) {
      row.classList.toggle('selected', item.selected);
    }
  }

  showRequestDetails(item: RequestWeb): void {
    const modalRef = this.modalService.open(RequestDialogComponent, {
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.request = item;

    modalRef.result.then((result) => {
      if (result) {
        this.processRequest(result);
      }
    }, () => {
      // Modal dismissed
    });
  }

  processRequest(item: RequestWeb): void {
    Swal.fire({
      title: '¿Procesar registro?',
      text: `¿Desea procesar el registro de ${item.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, procesar',
      cancelButtonText: 'No, cancelar'
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
}
