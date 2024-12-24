import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { AdminaccountComponent } from './adminaccount/adminaccount.component';
import { MemberaccountComponent } from "./memberaccount/memberaccount.component";
import { TutoraccountComponent } from './tutoraccount/tutoraccount.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, AdminaccountComponent, MemberaccountComponent,  TutoraccountComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent {
  constructor(public auth: AuthPocketbaseService) {}
}
