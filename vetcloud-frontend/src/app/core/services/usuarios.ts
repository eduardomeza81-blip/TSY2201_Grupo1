
import { Injectable, inject } from '@angular/core';
import { Auth } from '../auth/auth';

// Datos que devuelve el backend
export interface Usuario {
  idUsuario: number;
  nombre: string;
  email: string;
  idVeterinaria: number | null;
  nombreVeterinaria: string | null;
  idRol: number;
  codigoRol: string;
  nombreRol: string;
  activo: number;
  vinculadoEntra: boolean;
  fechaCreacion: string;
}

// Datos para registrar o actualizar usuarios
export interface UsuarioDatos {
  nombre: string;
  email: string;
  idVeterinaria: number | null;
  idRol: number;
}

// Roles disponibles
export interface Rol {
  idRol: number;
  codigo: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private auth = inject(Auth);

  private readonly apiUrl =
    'http://localhost:8080/api/usuarios';

  private readonly rolesUrl =
    'http://localhost:8080/api/roles';

  // Obtener encabezados con token Microsoft Entra
  private async obtenerHeaders(
    conContenido: boolean = false
  ): Promise<HeadersInit> {

    const token = await this.auth.obtenerTokenApi();

    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(conContenido
        ? { 'Content-Type': 'application/json' }
        : {})
    };
  }

  // Listar usuarios
  async listar(): Promise<Usuario[]> {

    const response = await fetch(this.apiUrl, {
      method: 'GET',
      headers: await this.obtenerHeaders()
    });

    if (!response.ok) {
      throw new Error(
        `Error consultando usuarios: HTTP ${response.status}`
      );
    }

    return await response.json() as Usuario[];
  }

  // Consultar usuario por ID
  async buscarPorId(id: number): Promise<Usuario> {

    const response = await fetch(
      `${this.apiUrl}/${id}`,
      {
        method: 'GET',
        headers: await this.obtenerHeaders()
      }
    );

    if (response.status === 404) {
      throw new Error('Usuario no encontrado.');
    }

    if (!response.ok) {
      throw new Error(
        `Error consultando usuario: HTTP ${response.status}`
      );
    }

    return await response.json() as Usuario;
  }

  // Listar roles
  async listarRoles(): Promise<Rol[]> {

    const response = await fetch(this.rolesUrl, {
      method: 'GET',
      headers: await this.obtenerHeaders()
    });

    if (!response.ok) {
      throw new Error(
        `Error consultando roles: HTTP ${response.status}`
      );
    }

    return await response.json() as Rol[];
  }

  // Registrar usuario
  async crear(datos: UsuarioDatos): Promise<Usuario> {

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: await this.obtenerHeaders(true),
      body: JSON.stringify(datos)
    });

    if (response.status === 409) {
      throw new Error(
        'El correo electrónico ya está registrado.'
      );
    }

    if (response.status === 400) {
      throw new Error('Los datos ingresados no son válidos.');
    }

    if (!response.ok) {
      throw new Error(
        `Error registrando usuario: HTTP ${response.status}`
      );
    }

    return await response.json() as Usuario;
  }

  // Actualizar usuario
  async actualizar(
    id: number,
    datos: UsuarioDatos
  ): Promise<Usuario> {

    const response = await fetch(
      `${this.apiUrl}/${id}`,
      {
        method: 'PUT',
        headers: await this.obtenerHeaders(true),
        body: JSON.stringify(datos)
      }
    );

    if (response.status === 404) {
      throw new Error('Usuario no encontrado.');
    }

    if (response.status === 409) {
      throw new Error(
        'El correo electrónico pertenece a otro usuario.'
      );
    }

    if (response.status === 400) {
      throw new Error(
        'No se pueden guardar los cambios solicitados.'
      );
    }

    if (!response.ok) {
      throw new Error(
        `Error actualizando usuario: HTTP ${response.status}`
      );
    }

    return await response.json() as Usuario;
  }

  // Activar o desactivar usuario
  async cambiarEstado(
    id: number,
    activar: boolean
  ): Promise<Usuario> {

    const accion = activar ? 'activar' : 'desactivar';

    const response = await fetch(
      `${this.apiUrl}/${id}/${accion}`,
      {
        method: 'PATCH',
        headers: await this.obtenerHeaders()
      }
    );

    if (response.status === 404) {
      throw new Error('Usuario no encontrado.');
    }

    if (!response.ok) {
      throw new Error(
        `Error al ${accion} usuario: HTTP ${response.status}`
      );
    }

    return await response.json() as Usuario;
  }
}
