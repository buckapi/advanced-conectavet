import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import PocketBase from 'pocketbase';
import Swal from 'sweetalert2';// Asegúrate de importar el componente modal
@Injectable({
  providedIn: 'root'
})
export class RealtimeOrdersService {
  private pb: PocketBase;
  public ordersSubject = new BehaviorSubject<any[]>([]);
  public orders$ = this.ordersSubject.asObservable();
  // public ratingModal: RatingModalComponent;

  constructor() {
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
    this.pb.collection('users').authWithPassword('platform@conectavet.cl', 'HVPO86drd_D5Zon').then(() => {
      console.log('Autenticado');
      this.setupRealtimeSubscriptionByStatus();
      // this.loadOrders();
      this.checkOrdersForRating(); // Llamar al nuevo método
      this.setupRealtimeSubscription();
    }).catch(err => {
      console.error('Error al autenticar:', err);
    });
  }
  private isUserTutor(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.type === 'tutor';
  }
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    const diaSemana = diasSemana[date.getDay()];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const anio = date.getFullYear();

    return `${diaSemana} ${dia} de ${mes} de ${anio}`;
  }
  public async checkOrdersForRating(): Promise<void> {
    if (!this.isUserTutor()) {
        return; // Salir si no es tutor
    }

    try {
        const records = await this.pb.collection('orders').getList(1, 50, {
            filter: `idUser="${localStorage.getItem('userId')}"`, // Filtrar por el userId del tutor
            expand: 'cart'
        });

        // Verificar si hay alguna orden con estado ATENDIDO y que pertenezca al usuario actual
        const attendedOrder = records.items.find(order => order['status'] === 'ATENDIDO' && order['idUser'] === localStorage.getItem('userId'));

        if (attendedOrder) {
            // Mostrar popup para valorar la atención, incluyendo el buyOrder
            const { value: formValues } = await Swal.fire({
                title: `
                <span style="align-items: center;">
                    <i class="fa fa-exclamation-triangle" style="margin-right: 5px;"></i>
                    Acción requerida
                </span>
                `,
                  html: `
                  <div>
                      <span class="font-w600">¡Notamos que tu cita de fecha
                          <span class="font-w600">
                              ${this.formatDate(attendedOrder['selectedAppointmentDate'])}
                          </span>
                      </span>
                      <span class="font-w600">
                          (Orden: ${attendedOrder['buyOrder'].slice(0, 6)})
                      </span>
                      fue procesada con éxito! Te invitamos a valorar la atención recibida.</span>
                    
                      <div class="star-rating">
                          <input type="radio" name="ratingCheck" value="5" id="star5"><label for="star5">★</label>
                          <input type="radio" name="ratingCheck" value="4" id="star4"><label for="star4">★</label>

                          <input type="radio" name="ratingCheck" value="3" id="star3"><label for="star3">★</label>
                          <input type="radio" name="ratingCheck" value="2" id="star2"><label for="star2">★</label>

                          <input type="radio" name="ratingCheck" value="1" id="star1"><label for="star1">★</label>

                          </div>

                      <style>
                          .swal2-title {
                              display: block ruby !important;
                          }
                          .star-rating {
                              direction: rtl;
                              display: inline-flex;
                          }
                          .star-rating input {
                           /*   display: none;  Ocultar el botón de radistar1o */
                          }
                          .star-rating label {
                              font-size: 60px; /* Ajustar el tamaño de las estrellas */
                              color: gray; /* Color por defecto */
                              cursor: pointer;
                          }
                          .btn-success {
                              background-color: #3ba5a8 !important; /* Color de fondo */
                              border-color: #3ba5a8 !important; /* Color de borde */
                          }
                          .btn-success:hover {
                              background-color: #000 !important; /* Color de fondo al pasar el mouse */
                              border-color: #000 !important; /* Color de borde al pasar el mouse */
                          }
                          .rounded-popup {
                              border-radius: 15px; /* Ajusta el valor según el redondeo deseado */
                          }
                          .swal2-overlay {
                              background: rgba(0, 0, 0, 1) !important; /* Fondo negro completamente */
                          }
                          .swal2-container {
                              background-color: rgba(0, 0, 0, 1) !important;
                          }
                          .rounded {
                              border-radius: 50px !important; /* Ajusta el valor según el redondeo deseado */
                          }
                          .star-rating input:checked ~ label,
                          .star-rating label:hover,
                          .star-rating label:hover ~ label {
                              color: gold; /* Color amarillo al seleccionar */
                          }
                      </style>
                      <textarea id="comments" placeholder="Comentarios"
                          style="width: 100%; margin-top: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 8px;"></textarea>
                  </div>
                  `,
                focusConfirm: false,
                allowOutsideClick: false,
                confirmButtonText: 'Enviar Valoración',
                customClass: {
                popup: 'rounded-popup', // Clase personalizada para el popup
                confirmButton: 'btn btn-success rounded' // Agregar clase redondeada al botón
                },
                allowEscapeKey: false,
                preConfirm: () => {
                  const ratingCheck = document.querySelector('input[name="ratingCheck"]:checked') as HTMLInputElement;
                  const commentsElement = document.getElementById('comments') as HTMLTextAreaElement;
                  const comments = commentsElement ? commentsElement.value : '';
                  if (!ratingCheck) {
                      Swal.showValidationMessage('Por favor, selecciona una valoración.');
                      return false;
                  }
                  return {
                      rating: (ratingCheck.value),
                      comments: comments
                  };
                }
              });
            if (formValues) {
                console.log(`Valoración: ${formValues.rating}, Comentarios: ${formValues.comments} para la Orden: ${attendedOrder['buyOrder']}`);
                
                // Preparar el cuerpo de la solicitud
                const data = {
                    idMember: attendedOrder['cart'][0].clinicId, // Asegúrate de que idMember esté disponible
                    idUser: localStorage.getItem('userId'),
                    rating: Number(formValues.rating),
                    comment: formValues.comments
                };

                // Crear el registro en PocketBase
                const record = await this.pb.collection('ratings').create(data);
                console.log('Calificación enviada con éxito:', record);

                // Actualizar la orden en PocketBase
                await this.pb.collection('orders').update(attendedOrder.id, {
                    status: 'CALIFICADO' // Cambia el estado de la orden según lo que necesites
                });
                console.log('Orden actualizada con éxito:', attendedOrder.id);
            }
        } else {
            // Si no hay órdenes ATENDIDO, no mostrar popup para las órdenes PENDING
            const pendingOrders = records.items.filter(order => order['status'] === 'PENDING' && order['idUser'] === localStorage.getItem('userId'));
            if (pendingOrders.length > 0) {
                // Aquí se puede agregar lógica si se desea manejar las órdenes pendientes de alguna manera
            }
        }
    } catch (error) {
        console.error('Error al cargar las órdenes:', error);
    }
}


public setupRealtimeSubscriptionByStatus(): void {
  const userId = localStorage.getItem('userId'); // Obtener el userId del localStorage

  this.pb.collection('orders').subscribe('*', async (e) => {
      console.log(e.action, e.record);

      // Verificar si el idUser de la orden coincide con el userId del usuario actual
      if (e.record['idUser'] !== userId) {
          return; // Salir si no coincide
      }

      const currentOrders = this.ordersSubject.value;
      let updatedOrders;

      // Obtener el registro completo si es necesario
      let record = e.record;
      if (e.action === 'create' || e.action === 'update') {
          try {
              record = await this.pb.collection('orders').getOne(e.record.id, {
                  expand: 'cart'
              });
          } catch (error) {
              console.error('Error expanding cart for order:', error);
          }
      }

      // Verificar si el estado ha cambiado de PENDING a ATENDIDO
      if (this.isUserTutor() && e.action === 'update' && record['status'] === 'ATENDIDO') {
          // Mostrar popup para valorar la atención
          const { value: formValues } = await Swal.fire({
              title: `
              <span style="align-items: center;">
                  <i class="fa fa-exclamation-triangle" style="margin-right: 5px;"></i>
                  Acción requerida
              </span>
              `,
              html: `
              <div>
                  <span class="font-w600">¡Notamos que tu cita de fecha
                      <span class="font-w600">
                          ${this.formatDate(record['selectedAppointmentDate'])}
                      </span>
                  </span>
                  <span class="font-w600">
                      (Orden: ${record['buyOrder'].slice(0, 6)})
                  </span>
                  fue procesada con éxito! Te invitamos a valorar la atención recibida.</span>
               
                  <div class="star-rating">  
                      <input type="radio" name="rating" value="5" id="star5"><label for="star5">★</label>
                      <input type="radio" name="rating" value="4" id="star4"><label for="star4">★</label>

                      <input type="radio" name="rating" value="3" id="star3"><label for="star3">★</label>
                  <input type="radio" name="rating" value="2" id="star2"><label for="star2">★</label>

                      <input type="radio" name="rating" value="1" id="star1"><label for="star1">★</label>
                  </div>

                  <style>
                      .swal2-title {
                          display: block ruby !important;
                      }
                      .star-rating {
                          direction: rtl;
                          display: inline-flex;
                      }
                      .star-rating input {
                          display: none; /* Ocultar el botón de radio */
                      }
                      .star-rating label {
                          font-size: 60px; /* Ajustar el tamaño de las estrellas */
                          color: gray; /* Color por defecto */
                          cursor: pointer;
                      }
                      .btn-success {
                          background-color: #3ba5a8 !important; /* Color de fondo */
                          border-color: #3ba5a8 !important; /* Color de borde */
                      }
                      .btn-success:hover {
                          background-color: #000 !important; /* Color de fondo al pasar el mouse */
                          border-color: #000 !important; /* Color de borde al pasar el mouse */
                      }
                      .rounded-popup {
                          border-radius: 15px; /* Ajusta el valor según el redondeo deseado */
                      }
                      .swal2-overlay {
                          background: rgba(0, 0, 0, 1) !important; /* Fondo negro completamente */
                      }
                      .swal2-container {
                          background-color: rgba(0, 0, 0, 1) !important;
                      }
                      .rounded {
                          border-radius: 50px !important; /* Ajusta el valor según el redondeo deseado */
                      }
                      .star-rating input:checked ~ label,
                      .star-rating label:hover,
                      .star-rating label:hover ~ label {
                          color: gold; /* Color amarillo al seleccionar */
                      }
                  </style>
                  <textarea id="comments" placeholder="Comentarios"
                      style="width: 100%; margin-top: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 8px;"></textarea>
              </div>
              `,
              focusConfirm: false,
              allowOutsideClick: false,
              confirmButtonText: 'Enviar Valoración',
              customClass: {
                  popup: 'rounded-popup', // Clase personalizada para el popup
                  confirmButton: 'btn btn-success rounded' // Agregar clase redondeada al botón
              },
              allowEscapeKey: false,
              preConfirm: () => {
                const rating = document.querySelector('input[name="rating"]:checked') as HTMLInputElement;
                console.log('Valoración seleccionada:', rating ? rating.value : 'No rating selected'); // Agrega esta línea
                const commentsElement = document.getElementById('comments') as HTMLTextAreaElement;
                const comments = commentsElement ? commentsElement.value : '';
            
                if (!rating) {
                    Swal.showValidationMessage('Por favor, selecciona una valoración.');
                    return false;
                }
            
                return {
                    rating: Number(rating.value), // Convertir a número aquí
                    comments: comments
                };
            }
          });

          if (formValues) {
            console.log(`Valoración: ${formValues.rating}, Comentarios: ${formValues.comments} para la Orden: ${record['buyOrder']}`);
            
            // Preparar el cuerpo de la solicitud
            const data = {
                idMember: record['cart'][0].clinicId, // Asegúrate de que idMember esté disponible
                idUser: localStorage.getItem('userId'),
                rating: formValues.rating, // Este ya es un número
                comment: formValues.comments
            };

              // Crear el registro en PocketBase
              const ratingRecord = await this.pb.collection('ratings').create(data);
              console.log('Calificación enviada con éxito:', ratingRecord);

              // Actualizar la orden en PocketBase
              await this.pb.collection('orders').update(record.id, {
                  status: 'CALIFICADO' // Cambia el estado de la orden según lo que necesites
              });
              console.log('Orden actualizada con éxito:', record.id);
          }
      }

      switch (e.action) {
          case 'create':
              updatedOrders = [...currentOrders, record];
              break;
          case 'update':
              updatedOrders = currentOrders.map(order =>
                  order.id === record.id ? record : order
              );
              break;
          case 'delete':
              updatedOrders = currentOrders.filter(order => order.id !== record.id);
              break;
          default:
              updatedOrders = currentOrders;
      }

      this.ordersSubject.next(updatedOrders);
  });
}

  private setupRealtimeSubscription(): void {
    this.pb.collection('orders').subscribe('*', async (e) => {
      console.log(e.action, e.record);

      const currentOrders = this.ordersSubject.value;
      let updatedOrders;

      // Get the full record with expanded cart for create/update actions
      let record = e.record;
      if (e.action === 'create' || e.action === 'update') {
        try {
          record = await this.pb.collection('orders').getOne(e.record.id, {
            expand: 'cart'
          });
        } catch (error) {
          console.error('Error expanding cart for order:', error);
        }
      }

      switch (e.action) {
        case 'create':
          updatedOrders = [...currentOrders, record];
          break;
        case 'update':
          updatedOrders = currentOrders.map(order =>
            order.id === record.id ? record : order
          );
          break;
        case 'delete':
          updatedOrders = currentOrders.filter(order => order.id !== record.id);
          break;
        default:
          updatedOrders = currentOrders;
      }

      this.ordersSubject.next(updatedOrders);
    });
  }


  public async loadOrders(): Promise<void> {
    try {
      const records = await this.pb.collection('orders').getList(1, 50, {
        sort: '-created',
        expand: 'cart'
      });
      this.ordersSubject.next(records.items);
    } catch (error) {
      console.error('Error loading orders:', error);
      this.ordersSubject.next([]);
    }
  }

  public unsubscribeFromRealtimeChanges(): void {
    this.pb.collection('orders').unsubscribe('*');
  }
}
