import { Component } from '@angular/core';
import { GlobalService } from '@app/services/global.service';
import { CartButtonComponent } from '../cart-button/cart-button.component';

@Component({
  selector: 'app-backheader',
  standalone: true,
  imports: [CartButtonComponent],
  templateUrl: './backheader.component.html',
  styleUrl: './backheader.component.css'
})
export class BackheaderComponent {
constructor(
  public global:GlobalService
){}
}
