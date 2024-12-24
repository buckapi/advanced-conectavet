import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterSpecialists',
  standalone: true // Añadimos esta línea
})
export class FilterSpecialistsPipe implements PipeTransform {
  transform(specialists: any[], isAdmin: boolean): any[] {
    if (isAdmin) {
      return specialists; // Mostrar todos los especialistas si es admin
    } else {
      return specialists.filter(specialist => specialist.status === 'approved');
    }
  }
}