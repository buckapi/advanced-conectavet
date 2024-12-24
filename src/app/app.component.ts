import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScriptLoaderService } from './services/script-loader.service';
import { CommonModule } from '@angular/common';
import { LoadStyleService } from './services/load-style.service';
import { ServicesComponent } from './components/services/services.component';
import { ConfigService } from '@app/services/config.service';
import { CategoriesComponent } from './components/categories/categories.component';
import { RealtimeSpecialistsService } from './services/realtime-specialists.service';
import { HeaderComponent } from './components/ui/header/header.component';
import { SidebarComponent } from './components/ui/sidebar/sidebar.component';
import { MenubarComponent } from './components/ui/menubar/menubar.component';
import { HomeComponent } from './components/home/home.component';
import { GlobalService } from './services/global.service';
import { ClinicdetailComponent } from './components/clinicdetail/clinicdetail.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { BackheaderComponent } from './components/ui/backheader/backheader.component';
import { MessagesComponent } from './components/messages/messages.component';
import { ChatComponent } from './components/chat/chat.component';
import { RealtimeCategoriesService } from './services/realtime-catwgories.service';
import { AccountComponent } from './components/account/account.component';
import { AuthPocketbaseService } from './services/auth-pocketbase.service';
import { RealtimeServicesService } from './services/realtime-services.service';
import { ShoppingComponent } from './components/shopping/shopping.component';
import { VisitTrackerService } from './services/visit-tracker.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ShoppingComponent,
    AccountComponent,
    RouterOutlet,
    ServicesComponent,
    CommonModule,
    HeaderComponent,
    MenubarComponent,
    SidebarComponent,
    HomeComponent,
    CategoriesComponent,
    ClinicdetailComponent,
    RegisterComponent,
    LoginComponent,
    BackheaderComponent,
    MessagesComponent,
    ChatComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  // categories: [string, string][] = [];  // Almacena las categorías como tuplas
  specialists: any[] = [];
  title = 'pets';
  memberId=";"
  menuState: string = 'close'; // Valor inicial del menú
  get categories() {
    return Object.entries(this.configService.defaultConfig.categories);
  }
  constructor(
    private realtimeSpecialists: RealtimeSpecialistsService,
    private realtimeCategoriesService: RealtimeCategoriesService,
    public realtimeServices:RealtimeServicesService,
    public auth:AuthPocketbaseService,
    public global: GlobalService,
    public scriptLoader: ScriptLoaderService,
    private loadStyleService: LoadStyleService,
    public configService: ConfigService,
    private visitTrackerService: VisitTrackerService
  ) {}
  selectCategory(
    categoryKey: keyof typeof this.configService.defaultConfig.categories
  ) {
    this.configService.categorySelected = categoryKey;
    console.log('Categoría seleccionada:', this.configService.categorySelected);
  }
  getMemberId() {
    this.realtimeSpecialists.specialists$.subscribe((Specialists) => {
      const specialist = Specialists.find(
        (prof) => prof.userId === this.auth.getUserId()
      );
      if (specialist) {
        console.log(`Encontrado ID: ${specialist.id}`);
        this.memberId = specialist.id;
        localStorage.setItem('memberId',this.memberId ); 
        this.global.myServices = specialist.services;
        this.realtimeServices.services$.subscribe((allServices) => {
          const missingServices = allServices.filter(
            (service) => !this.global.myServices.some(
              (myService) => myService.id === service.id
            )
          );
          this.global.myServicesAct = [...this.global.myServicesAct, ...missingServices];
        });
      } else {
        console.log('PANG! No specialist found for the current user ID .');
      }
    });
  }
  ngOnInit(): void {
    this.visitTrackerService.trackVisit();
    if (this.auth.isMember ()) {
      this.getMemberId()
    }
    this.realtimeSpecialists.specialists$.subscribe((data) => {
      this.global.specialists = data;
    });
    this.realtimeCategoriesService.categories$.subscribe((data) => {
      this.global.categories = data;
    });
    // Cargar estilos de forma dinámica

    this.themeTwo();
  }
  themeOne() {
    this.loadStyleService.loadStyle('assets/css/vendors/iconsax.css');
    this.loadStyleService.loadStyle('assets/css/vendors/bootstrap.css');
    this.loadStyleService.loadStyle('assets/css/vendors/swiper-bundle.min.css');
    this.loadStyleService.loadStyle('assets/css/style.css');

    this.scriptLoader
      .loadScripts([
        'assets/js/iconsax.js',
        'assets/js/bootstrap.bundle.min.js',
        'assets/js/sticky-header.js',
        'assets/js/swiper-bundle.min.js',
        // 'assets/js/custom-swiper.js',
        'assets/js/template-setting.js',
        'assets/js/script.js',
      ])
      .then((data) => {
        console.log('Todos los scripts se han cargado correctamente', data);
      })
      .catch((error) => console.error('Error al cargar los scripts', error));
  }
  themeTwo() {
    this.loadStyleService.loadStyle(
      'assets/vendor/bootstrap-select/dist/css/bootstrap-select.min.css'
    );
    this.loadStyleService.loadStyle(
      'assets/vendor/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.css'
    );
    // this.loadStyleService.loadStyle('assets/css/vendors/swiper-bundle.min.css');
    this.loadStyleService.loadStyle(
      'assets/vendor/grouploop-master/examples/css/styles.css'
    );
    this.loadStyleService.loadStyle('assets/css/style.css');

    this.scriptLoader
      .loadScripts([
        // 'assets/js/jquery.js',
        // 'assets/vendor/bootstrap/js/bootstrap.bundle.min.js',
        // 'assets/vendor/swiper/swiper-bundle.min.js',
        // 'assets/vendor/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.js',
        // 'assets/vendor/grouploop-master/dist/grouploop-1.0.3.min.js',
        // 'assets/js/dz.carousel.js',
        // 'assets/js/settings.js',
        // 'assets/js/custom.js',
        // 'index,js',
      ])
      .then((data) => {
        console.log('Todos los scripts se han cargado correctamente', data);
      })
      .catch((error) => console.error('Error al cargar los scripts', error));
  }
}
