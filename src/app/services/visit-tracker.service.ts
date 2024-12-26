import { Injectable } from '@angular/core';
import axios from 'axios';
import { UAParser } from 'ua-parser-js';

@Injectable({
  providedIn: 'root',
})
export class VisitTrackerService {
  private apiUrl = 'https://db.conectavet.cl:8080';
  private appName = 'ConectaVet';
  private deviceId: string;

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'dev_' + crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  private async getVisitData() {
    const parser = new UAParser();
    const uaResult = parser.getResult();

    // Obtener información de IP
    const ipInfo = await axios
      .get('https://ipapi.co/json/')
      .then((res) => res.data)
      .catch(() => ({
        ip: 'Unknown',
        country_name: 'Unknown',
      }));

    // Obtener el contador actual de visitas
    const currentCount = parseInt(localStorage.getItem('visitCount') || '0', 10);
    const newCount = currentCount + 1;

    // Actualizar el contador en localStorage
    localStorage.setItem('visitCount', newCount.toString());
    localStorage.setItem('lastVisit', new Date().toISOString());

    // Procesar información del dispositivo
    const deviceInfo = {
      type: uaResult.device.type || 'desktop',
      model: uaResult.device.model || 'unknown',
      vendor: uaResult.device.vendor || 'unknown',
      os: uaResult.os.name || 'unknown',
      osVersion: uaResult.os.version || 'unknown',
    };

    // Construir el objeto de datos de visita
    return {
      deviceId: this.deviceId,
      timestamp: new Date().toISOString(),
      browser: `${uaResult.browser.name || 'unknown'} ${
        uaResult.browser.version || ''
      }`.trim(),
      device: JSON.stringify(deviceInfo),
      deviceType: deviceInfo.type,
      deviceModel: deviceInfo.model,
      deviceVendor: deviceInfo.vendor,
      deviceOs: deviceInfo.os,
      deviceOsVersion: deviceInfo.osVersion,
      visitCount: newCount,
      userAgent: navigator.userAgent,
      appName: this.appName,
      ip: ipInfo.ip,
      country: ipInfo.country_name,
      datetime: new Date().toISOString(),
    };
  }

  async trackVisit(): Promise<void> {
    try {
      await this.registerServiceWorker();
      const visitData = await this.getVisitData();

      console.log('Enviando datos al servidor:', visitData);

      // Enviar datos al servidor
      const response = await fetch(`${this.apiUrl}/api/collections/visits/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        throw new Error('Error al registrar la visita');
      }

      const responseData = await response.json();
      console.log('Respuesta del servidor:', responseData);

      // Actualizar datos locales a través del Service Worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'TRACK_VISIT',
          data: visitData,
        });
      }
    } catch (error) {
      console.error('Error al registrar la visita:', error);
    }
  }

  async getVisits() {
    try {
      const response = await fetch(`${this.apiUrl}/api/collections/visits/records`);
      if (!response.ok) {
        throw new Error('Error al obtener las visitas');
      }
      const data = await response.json();
      return data.items;
    } catch (error) {
      console.error('Error al obtener las visitas:', error);
      return [];
    }
  }

  async getVisitorInfo() {
    const parser = new UAParser();
    const uaResult = parser.getResult();

    const ipInfo = await axios
      .get('https://ipapi.co/json/')
      .then((res) => res.data)
      .catch(() => ({}));

    return {
      appName: this.appName,
      browser: `${uaResult.browser.name} ${uaResult.browser.version}`,
      device: uaResult.device.type || 'Desktop',
      ip: ipInfo.ip || 'Unknown',
      country: ipInfo.country_name || 'Unknown',
      datetime: new Date().toISOString(),
    };
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        return registration;
      } catch (error) {
        console.error('Error al registrar el Service Worker:', error);
        return null;
      }
    }
    return null;
  }
}
