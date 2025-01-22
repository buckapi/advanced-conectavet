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
import { UnderComponent } from './components/under/under.component';
import { ActivatedRoute } from '@angular/router'; // Importar ActivatedRoute
import Swal from 'sweetalert2'; // Importar Swal

import PocketBase from 'pocketbase';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    
    UnderComponent,
    ShoppingComponent,
    AccountComponent,
    CommonModule,
    HeaderComponent,
    MenubarComponent,
    SidebarComponent,
    HomeComponent,
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
  orderId: string | null = null; // Para almacenar el ID del pedido

  // categories: [string, string][] = [];  // Almacena las categorías como tuplas
  specialists: any[] = [];
  title = 'conectavet';
  memberId=";"
  menuState: string = 'close'; // Valor inicial del menú
  get categories() {
    return Object.entries(this.configService.defaultConfig.categories);
  }
  constructor(
    private route: ActivatedRoute, // Inyectar ActivatedRoute
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
    // Obtener el parámetro 'order' de la URL
    this.route.queryParams.subscribe(async params => {
      // Exclude 'order' from detected parameters
      const otherParams = Object.entries(params).filter(([key]) => key !== 'order');
      if (otherParams.length > 0) {
        const paramsString = otherParams.map(([key, value]) => `${key}: ${value}`).join(', ');
        Swal.fire({
          title: 'Parámetros Detectados',
          text: `Parámetros: ${paramsString}`,
          icon: 'info',
          confirmButtonText: 'Cerrar'
        });
      }
      // Check for 'order' parameter
      const orderId = params['order'];
      if (orderId) {
        // Use PocketBase to fetch the transaction
        const pb = new PocketBase('https://db.conectavet.cl:8080');
        try {
          // Ensure zero matches are detected
          const records = await pb.collection('transactions').getList(1, 1, {
            filter: `buyOrder="${orderId}"`
          });
          if (records.items.length === 0) {
            // Show alert if no transaction is found
            Swal.fire({
              title: 'Transacción No Encontrada',
              text: 'Esta transacción no corresponde a ningún registro.',
              icon: 'error', // Urgent icon
              confirmButtonText: 'Cerrar'
            });
            console.error('No transaction found with the provided buyOrder.');
          } else {
            const record = records.items[0];
            console.log('Transaction found:', record);
            // Check if the status is AUTHORIZED
            if (record['status'] === 'AUTHORIZED') {
              const details = record['details'];
              // Display full transaction details with customization
              Swal.fire({
                // title: 'Detalles Completos de la Transacción',
                html: `
                  <div style="text-align: center;">
                    <img src="assets/images/app-logo/logo.png" alt="Logo" style="width: 400px; margin-bottom: 20px;" />
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <div style="flex: 1;">
                      <p><strong>Fecha de Contabilidad:</strong> ${details['accounting_date']}</p>
                      <p><strong>Monto:</strong> ${details['amount']}</p>
                      <p><strong>Código de Autorización:</strong> ${details['authorization_code']}</p>
                      <p><strong>Orden de Compra:</strong> ${details['buy_order']}</p>
                      <p><strong>Número de Tarjeta:</strong> ${details['card_detail']['card_number']}</p>
                    </div>
                    <div style="flex: 1;">
                      <p><strong>Número de Cuotas:</strong> ${details['installments_number']}</p>
                      <p><strong>Código de Tipo de Pago:</strong> ${details['payment_type_code']}</p>
                      <p><strong>Código de Respuesta:</strong> ${details['response_code']}</p>
                      <p><strong>ID de Sesión:</strong> ${details['session_id']}</p>
                      <p><strong>Estado:</strong> ${details['status']}</p>
                      <p><strong>Fecha de Transacción:</strong> ${details['transaction_date']}</p>
                      <p><strong>VCI:</strong> ${details['vci']}</p>
                    </div>
                  </div>
                `,
                // icon: 'success',
                confirmButtonText: 'Cerrar'
              });
            } else {
              // Display basic transaction details
              Swal.fire({
                title: 'Detalles de la Transacción',
                html: `
                  <p>ID: ${record['id']}</p>
                  <p>Monto: ${record['amount']}</p>
                  <p>Estado: ${record['status']}</p>
                `,
                icon: 'info',
                confirmButtonText: 'Cerrar'
              });
            }
          }
        } catch (error) {
          console.error('Error fetching transaction details:', error);
        }
      }
    });
    this.visitTrackerService.trackVisit();
    if (this.auth.isMember()) {
      this.getMemberId();
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

  orderDetails: any; // Para almacenar los detalles del pedido

  async fetchOrderDetails(orderId: string) {
    const pb = new PocketBase('https://db.conectavet.cl:8080');
    try {
      // Buscar el registro usando buyOrder
      const records = await pb.collection('orders').getList(1, 1, {
        filter: `buyOrder = "${orderId}"`
      });

      if (records.items.length > 0) {
        const record = records.items[0];
        console.log('Detalles del pedido:', record);
        this.orderDetails = record; // Almacenar los detalles del pedido

        // Mostrar detalles del pedido en un SweetAlert
        Swal.fire({
          title: 'Detalles del Pedido',
          html: `
            <p>ID: ${record['id']}</p>
            <p>Total: ${record['total']}</p>
            <p>Estado: ${record['status']}</p>
          `,
          icon: 'info',
          confirmButtonText: 'Cerrar'
        });
      } else {
        console.error('No se encontró el pedido con el buyOrder proporcionado.');
      }
    } catch (error) {
      console.error('Error al obtener los detalles del pedido:', error);
    }
  }
  // ngOnInit(): void {
  //   this.visitTrackerService.trackVisit();
  //   if (this.auth.isMember ()) {
  //     this.getMemberId()
  //   }
  //   this.realtimeSpecialists.specialists$.subscribe((data) => {
  //     this.global.specialists = data;
  //   });
  //   this.realtimeCategoriesService.categories$.subscribe((data) => {
  //     this.global.categories = data;
  //   });

  //   this.themeTwo();
  // }
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
