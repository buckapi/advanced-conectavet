export interface Category {
  id: number;
  carousel: boolean;
  name: string;
  icon: string; // O el tipo adecuado para el icono
  services: string[]; // O el tipo adecuado para los servicios
}