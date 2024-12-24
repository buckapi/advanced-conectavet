import { Component, Renderer2 } from '@angular/core';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { GlobalService } from '@app/services/global.service';

@Component({
  selector: 'app-authbox',
  standalone: true,
  imports: [],
  templateUrl: './authbox.component.html',
  styleUrl: './authbox.component.css'
})
export class AuthboxComponent {

  constructor(
public global:GlobalService,
private renderer: Renderer2,
public auth:AuthPocketbaseService


  ){}
  goRoute(route:string){
    this,this.applyClasses();
    this.global.option="";
    this.global.setRoute(route);
  
  }
  applyClasses() {
    // Añadir la clase "dark-overlay" al elemento con id "overlay"
    const overlay = this.renderer.selectRootElement('#overlay', true);
    this.renderer.removeClass(overlay, 'active');
    this.renderer.addClass(overlay, 'dark-overlay');

    // Añadir la clase "sidebar" al elemento con id "sidebar"
    const sidebar = this.renderer.selectRootElement('#sidebar', true);
    this.renderer.removeClass(sidebar, 'show');
    this.renderer.addClass(sidebar, 'sidebar');

  }
}
