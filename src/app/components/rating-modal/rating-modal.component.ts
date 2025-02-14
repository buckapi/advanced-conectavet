import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-rating-modal',
  standalone: true,
  imports: [
    BrowserModule,
    FormsModule
  ],
  templateUrl: './rating-modal.component.html',
  styleUrls: ['./rating-modal.component.css']
})
export class RatingModalComponent {
  @Output() ratingSubmitted = new EventEmitter<{ rating: number, comments: string }>();
  isVisible: boolean = false;
  selectedRating: number = 0;
  comments: string = '';
  appointmentDate: string = '';
  buyOrder: string = '';

  // Método para abrir el modal
  open(data: { appointmentDate: string, buyOrder: string }) {
    this.isVisible = true;
    this.appointmentDate = data.appointmentDate;
    this.buyOrder = data.buyOrder;
  }
  // Cerrar el modal
  closeModal() {
    this.isVisible = false;
  }

  // Manejar el cambio en la calificación
  onRatingChange(rating: number) {
    this.selectedRating = rating;
  }
  // Método para enviar la calificación
  submitRating() {
    if (this.selectedRating > 0) {
      this.ratingSubmitted.emit({ rating: this.selectedRating, comments: this.comments });
      this.close(); // Cerrar el modal después de enviar
    } else {
      console.error('Por favor, selecciona una calificación.');
    }
  }

  // Método para cerrar el modal
  close() {
    this.isVisible = false;
    this.selectedRating = 0;
    this.comments = '';
  }
}