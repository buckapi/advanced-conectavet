import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadStyleService {
  loadStyle(href: string) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}
