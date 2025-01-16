import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'friendlyDate',
  standalone: true
})
export class FriendlyDatePipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    const date = new Date(value);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };

    let formatted = date.toLocaleDateString('es-ES', options);
    
    // Capitalize first letter
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    
    // Replace the month abbreviation with lowercase and add period
    formatted = formatted.replace(/([A-Za-z]+\.?)\.?\s+de/, (match) => {
      return match.toLowerCase();
    });

    return formatted;
  }
}
