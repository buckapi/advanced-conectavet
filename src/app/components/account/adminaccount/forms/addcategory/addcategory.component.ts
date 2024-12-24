import { Component, EventEmitter, Output } from '@angular/core'; // Agregar EventEmitter y Output
import { FormsModule } from '@angular/forms';
import { CategoryService } from '@app/services/category.service';import { GlobalService } from '@app/services/global.service';
import Swal from 'sweetalert2'; // Importar SweetAlert2

@Component({
  selector: 'app-addcategory',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './addcategory.component.html',
  styleUrl: './addcategory.component.css'
})
export class AddcategoryComponent {
  @Output() categoryAdded = new EventEmitter<void>(); // Emitir evento al agregar categoría
  categoryName: string = '';
  categoryDescription: string = '';
  carouselActive: boolean = false; // Inicializa la propiedad
  constructor(
    public global: GlobalService,
    private categoryService: CategoryService // Inyectar el servicio
  ) {}
  async addCategory() { // Método para agregar una nueva categoría
    const newCategory = {
      name: this.categoryName, // Usar el nombre de la categoría del formulario
      description: '',  
      carousel: this.carouselActive, // Tomar el valor del switch
      status: 'activo',
      images: JSON.stringify([]) // Si no hay imágenes, puedes dejarlo vacío
    };

    try {
      const createdCategory = await this.categoryService.createCategory(newCategory);
      console.log('Categoría creada:', createdCategory);
      this.categoryName='';
      this.carouselActive=false;
      this.categoryAdded.emit(); // Emitir evento para cerrar el modal

      // Mostrar alerta de éxito
      Swal.fire({
        title: 'Éxito!',
        text: 'Categoría agregada correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    } catch (error) {
      console.error('Error al agregar la categoría:', error);
      
      // Mostrar alerta de error
      Swal.fire({
        title: 'Error!',
        text: 'No se pudo agregar la categoría.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  }

}
