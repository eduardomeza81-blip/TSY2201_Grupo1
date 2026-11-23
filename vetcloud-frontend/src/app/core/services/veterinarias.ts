
import { Injectable, inject } from '@angular/core';
import { Auth } from '../auth/auth';

export interface Veterinaria {
  idVeterinaria: number;
  rut: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  activa: number;
  fechaCreacion: string;
}

export interface VeterinariaDatos {
  nombre: string;
  rut: string;
  direccion: string;
  telefono: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class VeterinariasService {

  private auth = inject(Auth);

  private readonly apiUrl =
    'http://localhost:8080/api/veterinarias';

  // Consultar veterinarias
  async listar(): Promise<Veterinaria[]> {

    const token = await this.auth.obtenerTokenApi();

    const response = await fetch(this.apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(
        `Error consultando veterinarias: HTTP ${response.status}`
      );
    }

    return await response.json() as Veterinaria[];
  }

  // Registrar veterinaria
  async crear(datos: VeterinariaDatos): Promise<Veterinaria> {

    const token = await this.auth.obtenerTokenApi();

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(datos)
    });

    if (response.status === 409) {
      throw new Error(
        'Ya existe una veterinaria registrada con ese RUT.'
      );
    }

    if (response.status === 400) {
      throw new Error(
        'Los datos ingresados no son válidos.'
      );
    }

    if (!response.ok) {
      throw new Error(
        `Error al registrar veterinaria: HTTP ${response.status}`
      );
    }

    return await response.json() as Veterinaria;
  }

  // Actualizar veterinaria existente
  async actualizar(
    id: number,
    datos: VeterinariaDatos
  ): Promise<Veterinaria> {

    const token = await this.auth.obtenerTokenApi();

    const response = await fetch(
      `${this.apiUrl}/${id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(datos)
      }
    );

    if (response.status === 404) {
      throw new Error(
        'La veterinaria que intentas editar no existe.'
      );
    }

    if (response.status === 409) {
      throw new Error(
        'El RUT pertenece a otra veterinaria.'
      );
    }

    if (response.status === 400) {
      throw new Error(
        'Los datos ingresados no son válidos.'
      );
    }

    if (!response.ok) {
      throw new Error(
        `Error al actualizar veterinaria: HTTP ${response.status}`
      );
    }

    return await response.json() as Veterinaria;
  }

  // Activar o desactivar una veterinaria
  async cambiarEstado(
    id: number,
    activar: boolean
  ): Promise<Veterinaria> {

    const token = await this.auth.obtenerTokenApi();

    const accion = activar ? 'activar' : 'desactivar';

    const response = await fetch(
      `${this.apiUrl}/${id}/${accion}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error al ${accion} veterinaria: HTTP ${response.status}`
      );
    }

    return await response.json() as Veterinaria;
  }

}
