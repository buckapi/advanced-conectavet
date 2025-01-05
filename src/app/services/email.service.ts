import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'https://www.conectavet.cl:5542/welcome';

  constructor(public http: HttpClient) {}

  sendEmail(toEmail: string, toName: string, templateId: number, params: any): Observable<any> {
    const body = {
      toEmail,
      toName,
      templateId,
      params
    };
    return this.http.post(this.apiUrl, body);
  }
}
