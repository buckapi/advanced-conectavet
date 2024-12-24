import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private pb: PocketBase;
  private apiUrl = 'https://db.conectavet.cl:8080';

  constructor() {
    this.pb = new PocketBase(this.apiUrl);
  }

  async uploadImage(file: File, type: string, userId: string): Promise<any> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    formData.append('userId', userId);

    return this.pb.collection('images').create(formData);
  }
}
