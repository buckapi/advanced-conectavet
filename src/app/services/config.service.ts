import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  categorySelected: keyof typeof this.defaultConfig.categories = "salud_general"; // Valor inicial
  categories: [string, string][] = [];
  showServices=false;
  defaultConfig = {
    appTitle: 'ConectaVet',
    apiEndpoint: 'https://api.redveterinarios.com/v1/',
    defaultLanguage: 'es',
    itemsPerPage: 10,
    theme: 'light',
    reels: {
      uno: 'https://unsplash.it/g/1500/2200?image=838',
      dos: 'https://unsplash.it/g/1500/1000?image=1078',
      tres: 'https://unsplash.it/g/1500/1000?image=1077',
      cuatro: 'https://unsplash.it/g/1500/1200?image=345'
    },
    // Mapa de categorías con claves conocidas
    categories: {
      salud_general: 'Consultas Generales',
      urgencias: 'Urgencias Veterinarias',
      cirugias: 'Cirugía Veterinaria',
      presupuesto: 'Agenda Presupuesto',
      especialidades_veterinaria: 'Especialidades Veterinarias',
      hospitalizacion: 'Hospitalización',
      diagnostico_imagen: 'Diagnóstico por Imagen',
      laboratorio_clinico: 'Laboratorio Clínico',
      rehabilitacion: 'Terapia Física y Rehabilitación',
      hotel_guarderia: 'Hotel y Guardería',
      estetica: 'Peluquería y Estética',
      asistencia_final_vida: 'Servicios y Asistencia en la Etapa Final de la Vida'
    },
    // Mapa de servicios con claves conocidas
   
services: {
  // Consultas Generales
  medicina_preventiva: { name: 'Medicina Preventiva', categoryKey: 'salud_general' },
  vacunacion: { name: 'Vacunación', categoryKey: 'salud_general' },
  desparasitacion: { name: 'Desparasitación', categoryKey: 'salud_general' },

  // Urgencias Veterinarias
  atencion_emergencia: { name: 'Emergencia', categoryKey: 'urgencias' },

  // Cirugía Veterinaria
  cirugia_veterinaria: { name: 'Cirugía Veterinaria', categoryKey: 'cirugias' },

  // Agenda Presupuesto
  tipo_procedimientos: { name: 'Tipo de Procedimientos', categoryKey: 'presupuesto' },

  // Especialidades Veterinarias
  endocrinologia: { name: 'Endocrinología', categoryKey: 'especialidades_veterinaria' },
  oftalmologia: { name: 'Oftalmología', categoryKey: 'especialidades_veterinaria' },
  cardiologia: { name: 'Cardiología', categoryKey: 'especialidades_veterinaria' },
  neurologia: { name: 'Neurología', categoryKey: 'especialidades_veterinaria' },
  nefrologia: { name: 'Nefrología', categoryKey: 'especialidades_veterinaria' },
  odontologia: { name: 'Odontología', categoryKey: 'especialidades_veterinaria' },
  nutricionista: { name: 'Nutricionista', categoryKey: 'especialidades_veterinaria' },
  etologia: { name: 'Etología', categoryKey: 'especialidades_veterinaria' },
  oncologia: { name: 'Oncología', categoryKey: 'especialidades_veterinaria' },

  // Hospitalización
  hospitalizacion: { name: 'Hospitalización', categoryKey: 'hospitalizacion' },

  // Diagnóstico por Imagen
  radiologia: { name: 'Radiología', categoryKey: 'diagnostico_imagen' },
  ecografia: { name: 'Ecografía', categoryKey: 'diagnostico_imagen' },

  // Laboratorio Clínico
  listado_examenes: { name: 'Listado de Exámenes', categoryKey: 'laboratorio_clinico' },

  // Terapia Física y Rehabilitación
  fisioterapia: { name: 'Terapia Física y Rehabilitación', categoryKey: 'rehabilitacion' },

  // Hotel y Guardería
  hotel_guarderia: { name: 'Hotel y Guardería', categoryKey: 'hotel_guarderia' },

  // Peluquería y Estética
  peluqueria_spa: { name: 'Peluquería y Spa', categoryKey: 'estetica' },

  // Servicios y Asistencia en la Etapa Final de la Vida
  eutanasia: { name: 'Eutanasia', categoryKey: 'asistencia_final_vida' },
  servicios_cremacion: { name: 'Servicios de Cremación', categoryKey: 'asistencia_final_vida' }
}
  };

  constructor() {}
  selectCategory(categoryKey: keyof typeof this.defaultConfig.categories) {
    this.categorySelected = categoryKey;
    console.log('Categoría seleccionada:', this.categorySelected);
  }
  // Método para obtener servicios por categoría con tipado adecuado usando `keyof`
  getServicesByCategory(categoryKey: keyof typeof this.defaultConfig.categories) {
    // Filtrar los servicios que pertenecen a la categoría proporcionada
    return Object.values(this.defaultConfig.services).filter(service => service.categoryKey === categoryKey);
  }

  // Método para obtener la información de una categoría por su clave con tipado adecuado
  getCategoryInfo(categoryKey: keyof typeof this.defaultConfig.categories) {
    return this.defaultConfig.categories[categoryKey] || null;
  }

  getSelectedCategoryLabel(): string {
    return this.defaultConfig.categories[this.categorySelected] || '';
  }
}
