
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  TutoresService,
  Tutor,
  TutorDatos
} from '../../core/services/tutores';

import {
  VeterinariasService,
  Veterinaria
} from '../../core/services/veterinarias';

@Component({
  selector: 'app-tutores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tutores.html',
  styleUrl: './tutores.scss'
})
export class Tutores implements OnInit {

  private tutoresService = inject(TutoresService);
  private veterinariasService = inject(VeterinariasService);
  private cdr = inject(ChangeDetectorRef);

  veterinarias: Veterinaria[] = [];
  tutores: Tutor[] = [];

  idVeterinariaSeleccionada: number | null = null;
  idTutorEditando: number | null = null;

  cargando = false;
  guardando = false;
  mostrarFormulario = false;

  error = '';
  errorFormulario = '';
  mensajeExito = '';

  datosTutor: TutorDatos = this.formularioVacio();

  private formularioVacio(): TutorDatos {
    return {
      nombre: '',
      rut: '',
      telefono: '',
      email: '',
      direccion: ''
    };
  }

  async ngOnInit(): Promise<void> {
    await this.cargarVeterinarias();
  }

  async cargarVeterinarias(): Promise<void> {
    this.cargando = true;
    this.error = '';

    try {
      this.veterinarias =
        await this.veterinariasService.listar();

      if (this.veterinarias.length > 0) {
        this.idVeterinariaSeleccionada =
          this.veterinarias[0].idVeterinaria;

        await this.cargarTutores();
      }
    } catch (error) {
      this.error = error instanceof Error
        ? error.message
        : 'No fue posible cargar las veterinarias.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async cargarTutores(): Promise<void> {
    if (this.idVeterinariaSeleccionada === null) {
      this.tutores = [];
      return;
    }

    this.cargando = true;
    this.error = '';

    try {
      this.tutores = await this.tutoresService.listar(
        Number(this.idVeterinariaSeleccionada)
      );
    } catch (error) {
      this.error = error instanceof Error
        ? error.message
        : 'No fue posible cargar los tutores.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async cambiarVeterinaria(): Promise<void> {
    this.cancelarFormulario();
    this.mensajeExito = '';
    await this.cargarTutores();
  }

  abrirFormulario(): void {
    if (this.idVeterinariaSeleccionada === null) {
      this.error = 'Selecciona una veterinaria.';
      return;
    }

    this.idTutorEditando = null;
    this.datosTutor = this.formularioVacio();
    this.errorFormulario = '';
    this.mensajeExito = '';
    this.mostrarFormulario = true;
  }

  editarTutor(tutor: Tutor): void {
    this.idTutorEditando = tutor.idTutor;

    this.datosTutor = {
      nombre: tutor.nombre,
      rut: tutor.rut ?? '',
      telefono: tutor.telefono ?? '',
      email: tutor.email ?? '',
      direccion: tutor.direccion ?? ''
    };

    this.errorFormulario = '';
    this.mensajeExito = '';
    this.mostrarFormulario = true;
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.idTutorEditando = null;
    this.errorFormulario = '';
  }

  async guardarTutor(): Promise<void> {
    if (this.idVeterinariaSeleccionada === null) {
      this.errorFormulario = 'Selecciona una veterinaria.';
      return;
    }

    if (!this.datosTutor.nombre.trim()) {
      this.errorFormulario = 'El nombre es obligatorio.';
      return;
    }

    this.guardando = true;
    this.errorFormulario = '';

    try {
      const idVeterinaria =
        Number(this.idVeterinariaSeleccionada);

      if (this.idTutorEditando !== null) {
        await this.tutoresService.actualizar(
          idVeterinaria,
          this.idTutorEditando,
          this.datosTutor
        );

        this.mensajeExito =
          'Tutor actualizado correctamente.';
      } else {
        await this.tutoresService.crear(
          idVeterinaria,
          this.datosTutor
        );

        this.mensajeExito =
          'Tutor registrado correctamente.';
      }

      this.cancelarFormulario();
      await this.cargarTutores();

    } catch (error) {
      this.errorFormulario = error instanceof Error
        ? error.message
        : 'No fue posible guardar el tutor.';
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }
}
