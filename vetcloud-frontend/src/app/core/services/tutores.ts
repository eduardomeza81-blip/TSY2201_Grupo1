
import { Injectable, inject } from '@angular/core';
import { Auth } from '../auth/auth';

export interface Tutor {
  idTutor: number;
  idVeterinaria: number;
  nombre: string;
  rut: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
}

export interface TutorDatos {
  nombre: string;
  rut: string;
  telefono: string;
  email: string;
  direccion: string;
}

@Injectable({
  providedIn: 'root'
})
export class TutoresService {

  private auth = inject(Auth);

  private readonly apiUrl =
    'http://localhost:8080/api/veterinarias';

  private async obtenerHeaders(): Promise<HeadersInit> {
    const token = await this.auth.obtenerTokenApi();

    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
  }

  // Listar tutores de una veterinaria
  async listar(idVeterinaria: number): Promise<Tutor[]> {

    const response = await fetch(
      `${this.apiUrl}/${idVeterinaria}/tutores`,
      {
        method: 'GET',
        headers: await this.obtenerHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error consultando tutores: HTTP ${response.status}`
      );
    }

    return await response.json() as Tutor[];
  }

  // Consultar un tutor por ID
  async buscarPorId(
    idVeterinaria: number,
    idTutor: number
  ): Promise<Tutor> {

    const response = await fetch(
      `${this.apiUrl}/${idVeterinaria}/tutores/${idTutor}`,
      {
        method: 'GET',
        headers: await this.obtenerHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error consultando tutor: HTTP ${response.status}`
      );
    }

    return await response.json() as Tutor;
  }

  // Registrar un tutor
  async crear(
    idVeterinaria: number,
    datos: TutorDatos
  ): Promise<Tutor> {

    const response = await fetch(
      `${this.apiUrl}/${idVeterinaria}/tutores`,
      {
        method: 'POST',
        headers: await this.obtenerHeaders(),
        body: JSON.stringify(datos)
      }
    );

    if (response.status === 409) {
      throw new Error(
        'Ya existe un tutor registrado con esos datos.'
      );
    }

    if (!response.ok) {
      throw new Error(
        `Error registrando tutor: HTTP ${response.status}`
      );
    }

    return await response.json() as Tutor;
  }

  // Actualizar un tutor
  async actualizar(
    idVeterinaria: number,
    idTutor: number,
    datos: TutorDatos
  ): Promise<Tutor> {

    const response = await fetch(
      `${this.apiUrl}/${idVeterinaria}/tutores/${idTutor}`,
      {
        method: 'PUT',
        headers: await this.obtenerHeaders(),
        body: JSON.stringify(datos)
      }
    );

    if (response.status === 404) {
      throw new Error('El tutor no existe.');
    }

    if (!response.ok) {
      throw new Error(
        `Error actualizando tutor: HTTP ${response.status}`
      );
    }

    return await response.json() as Tutor;
  }
}
