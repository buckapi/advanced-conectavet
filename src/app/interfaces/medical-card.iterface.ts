export interface MedicalCard {
  id: string;
  service: { name: string }; // Asegúrate de que esto esté definido correctamente
  descripcion: string;
  notes: string;
  clinicId: string; // Asegúrate de que esto esté definido correctamente
  created: string; // O Date, dependiendo de cómo estés manejando las fechas
}