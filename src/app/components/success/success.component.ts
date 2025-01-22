import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {
  orderId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['order'];
      console.log('Order ID:', this.orderId);
      if (this.orderId) {
        Swal.fire({
          title: 'Order Success',
          text: `Order ID: ${this.orderId}`,
          icon: 'success',
          confirmButtonText: 'Close'
        });
      }
    });
  }
}
