import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  VeterinariasService,
  Veterinaria
} from '../../core/services/veterinarias';

@Component({
  selector: 'app-veterinarias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './veterinarias.html',
  styleUrl: './veterinarias.scss'
})
export class Veterinarias implements OnInit {

  private veterinariasService = inject(VeterinariasService);
  private cdr = inject(ChangeDetectorRef);
  veterinarias: Veterinaria[] = [];

  cargando = false;
  guardando = false;
  cambiandoEstadoId: number | null = null;
  mostrarFormulario = false;

  // Identifica si estamos editando una veterinaria
  idVeterinariaEditando: number | null = null;

  error = '';
  errorFormulario = '';
  mensajeExito = '';

  nuevaVeterinaria = {
    nombre: '',
    rut: '',
    direccion: '',
    telefono: '',
    email: ''
  };

  async ngOnInit(): Promise<void> {
    await this.cargarVeterinarias();
  }

  
async cargarVeterinarias(): Promise<void> {

  this.cargando = true;
  this.error = '';
  this.cdr.detectChanges();

  try {

    this.veterinarias =
      await this.veterinariasService.listar();

    console.log(
      'Veterinarias cargadas:',
      this.veterinarias
    );

  } catch (error) {

    console.error('Error cargando veterinarias:', error);

    this.error =
      'No fue posible cargar las veterinarias.';

  } finally {

    this.cargando = false;

    // Actualizar la interfaz después de recibir
    // la respuesta de Spring Boot.
    this.cdr.detectChanges();

  }
}


  // Abrir formulario para crear
  abrirFormulario(): void {
    this.idVeterinariaEditando = null;

    this.nuevaVeterinaria = {
      nombre: '',
      rut: '',
      direccion: '',
      telefono: '',
      email: ''
    };

    this.errorFormulario = '';
    this.mensajeExito = '';
    this.mostrarFormulario = true;
  }

  // Abrir formulario para editar
  editarVeterinaria(veterinaria: Veterinaria): void {
    this.idVeterinariaEditando = veterinaria.idVeterinaria;

    this.nuevaVeterinaria = {
      nombre: veterinaria.nombre ?? '',
      rut: veterinaria.rut ?? '',
      direccion: veterinaria.direccion ?? '',
      telefono: veterinaria.telefono ?? '',
      email: veterinaria.email ?? ''
    };

    this.errorFormulario = '';
    this.mensajeExito = '';
    this.mostrarFormulario = true;
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.idVeterinariaEditando = null;
    this.errorFormulario = '';
  }

  async guardarVeterinaria(): Promise<void> {

    if (!this.nuevaVeterinaria.nombre.trim()) {
      this.errorFormulario =
        'El nombre de la veterinaria es obligatorio.';
      return;
    }

    this.guardando = true;
    this.errorFormulario = '';

    try {

      if (this.idVeterinariaEditando !== null) {

        // Actualizar veterinaria existente
        await this.veterinariasService.actualizar(
          this.idVeterinariaEditando,
          this.nuevaVeterinaria
        );

        this.mensajeExito =
          'Veterinaria actualizada correctamente.';

      } else {

        // Registrar nueva veterinaria
        await this.veterinariasService.crear(
          this.nuevaVeterinaria
        );

        this.mensajeExito =
          'Veterinaria registrada correctamente.';
      }

      this.mostrarFormulario = false;
      this.idVeterinariaEditando = null;

      await this.cargarVeterinarias();

    } catch (error) {
      this.errorFormulario =
        error instanceof Error
          ? error.message
          : 'No fue posible guardar la veterinaria.';
    } finally {
      this.guardando = false;
    }
  }

async cambiarEstadoVeterinaria(
  veterinaria: Veterinaria
): Promise<void> {

  const activar = veterinaria.activa !== 1;
  const accion = activar ? 'activar' : 'desactivar';

  const confirmado = window.confirm(
    `¿Estás seguro de ${accion} la veterinaria "${veterinaria.nombre}"?`
  );

  if (!confirmado) {
    return;
  }

  this.cambiandoEstadoId = veterinaria.idVeterinaria;
  this.error = '';
  this.mensajeExito = '';

  try {
    await this.veterinariasService.cambiarEstado(
      veterinaria.idVeterinaria,
      activar
    );

    await this.cargarVeterinarias();

    this.mensajeExito =
      `Veterinaria ${activar ? 'activada' : 'desactivada'} correctamente.`;

  } catch (error) {
    console.error('Error cambiando estado:', error);

    this.error =
      error instanceof Error
        ? error.message
        : 'No fue posible cambiar el estado de la veterinaria.';
  } finally {
      this.cambiandoEstadoId = null;
  //  Actualizar los botones después de finalizar
      this.cdr.detectChanges();
    }
  }  
}
