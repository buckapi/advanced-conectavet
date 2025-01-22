import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuccessComponent } from './components/success/success.component';
import { HomeComponent } from './components/home/home.component';
import { SuccessModule } from './components/success/success.module';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'success', component: SuccessComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), SuccessModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
