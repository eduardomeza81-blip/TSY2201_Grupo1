
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  UsuariosService,
  Usuario,
  UsuarioDatos,
  Rol
} from '../../core/services/usuarios';

import {
  VeterinariasService,
  Veterinaria
} from '../../core/services/veterinarias';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss'
})
export class Usuarios implements OnInit {

  private usuariosService = inject(UsuariosService);
  private veterinariasService = inject(VeterinariasService);
  private cdr = inject(ChangeDetectorRef);

  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  veterinarias: Veterinaria[] = [];

  cargando = false;
  guardando = false;
  cambiandoEstadoId: number | null = null;

  mostrarFormulario = false;
  idUsuarioEditando: number | null = null;

  error = '';
  errorFormulario = '';
  mensajeExito = '';

  datosUsuario: UsuarioDatos = this.formularioVacio();

  private formularioVacio(): UsuarioDatos {
    return {
      nombre: '',
      email: '',
      idVeterinaria: null,
      idRol: 0
    };
  }

  // Cargar información al ingresar a la pantalla
  async ngOnInit(): Promise<void> {
    await this.cargarDatos();
  }

  // Consultar usuarios, roles y veterinarias
  async cargarDatos(): Promise<void> {

    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    try {

      const [usuarios, roles, veterinarias] =
        await Promise.all([
          this.usuariosService.listar(),
          this.usuariosService.listarRoles(),
          this.veterinariasService.listar()
        ]);

      this.usuarios = usuarios;
      this.roles = roles;
      this.veterinarias = veterinarias;

      console.log('Usuarios cargados:', this.usuarios.length);
      console.log('Roles cargados:', this.roles.length);
      console.log('Veterinarias cargadas:', this.veterinarias.length);

    } catch (error) {

      console.error('Error cargando usuarios:', error);

      this.error = error instanceof Error
        ? error.message
        : 'No fue posible cargar los datos.';

    } finally {

      this.cargando = false;
      this.cdr.detectChanges();

    }
  }

  // Abrir formulario para registrar
  abrirFormulario(): void {

    this.idUsuarioEditando = null;
    this.datosUsuario = this.formularioVacio();

    this.errorFormulario = '';
    this.mensajeExito = '';
    this.mostrarFormulario = true;
  }

  // Abrir formulario para editar
  editarUsuario(usuario: Usuario): void {

    this.idUsuarioEditando = usuario.idUsuario;

    this.datosUsuario = {
      nombre: usuario.nombre,
      email: usuario.email,
      idVeterinaria: usuario.idVeterinaria,
      idRol: usuario.idRol
    };

    this.errorFormulario = '';
    this.mensajeExito = '';
    this.mostrarFormulario = true;
  }

  // Cancelar registro o edición
  cancelarFormulario(): void {

    this.mostrarFormulario = false;
    this.idUsuarioEditando = null;
    this.errorFormulario = '';
  }

  // Registrar o actualizar usuario
  async guardarUsuario(): Promise<void> {

    if (!this.datosUsuario.nombre.trim()) {
      this.errorFormulario = 'El nombre es obligatorio.';
      return;
    }

    if (!this.datosUsuario.email.trim()) {
      this.errorFormulario = 'El correo es obligatorio.';
      return;
    }

    if (!this.datosUsuario.idRol) {
      this.errorFormulario = 'Debes seleccionar un rol.';
      return;
    }

    const rol = this.roles.find(
      r => r.idRol === Number(this.datosUsuario.idRol)
    );

    if (
      rol?.codigo !== 'SUPERADMIN' &&
      this.datosUsuario.idVeterinaria === null
    ) {
      this.errorFormulario =
        'Debes seleccionar una veterinaria.';
      return;
    }

    this.guardando = true;
    this.errorFormulario = '';
    this.cdr.detectChanges();

    try {

      const datos: UsuarioDatos = {
        ...this.datosUsuario,
        idRol: Number(this.datosUsuario.idRol),
        idVeterinaria:
          this.datosUsuario.idVeterinaria === null
            ? null
            : Number(this.datosUsuario.idVeterinaria)
      };

      if (this.idUsuarioEditando !== null) {

        await this.usuariosService.actualizar(
          this.idUsuarioEditando,
          datos
        );

        this.mensajeExito =
          'Usuario actualizado correctamente.';

      } else {

        await this.usuariosService.crear(datos);

        this.mensajeExito =
          'Usuario registrado correctamente.';
      }

      this.mostrarFormulario = false;
      this.idUsuarioEditando = null;

      await this.cargarDatos();

    } catch (error) {

      console.error('Error guardando usuario:', error);

      this.errorFormulario = error instanceof Error
        ? error.message
        : 'No fue posible guardar el usuario.';

    } finally {

      this.guardando = false;
      this.cdr.detectChanges();

    }
  }

  // Activar o desactivar usuario
  async cambiarEstadoUsuario(
    usuario: Usuario
  ): Promise<void> {

    const activar = usuario.activo !== 1;
    const accion = activar ? 'activar' : 'desactivar';

    const confirmado = window.confirm(
      `¿Estás seguro de ${accion} al usuario "${usuario.nombre}"?`
    );

    if (!confirmado) {
      return;
    }

    this.cambiandoEstadoId = usuario.idUsuario;
    this.error = '';
    this.mensajeExito = '';
    this.cdr.detectChanges();

    try {

      await this.usuariosService.cambiarEstado(
        usuario.idUsuario,
        activar
      );

      await this.cargarDatos();

      this.mensajeExito = activar
        ? 'Usuario activado correctamente.'
        : 'Usuario desactivado correctamente.';

    } catch (error) {

      console.error('Error cambiando estado:', error);

      this.error = error instanceof Error
        ? error.message
        : 'No fue posible cambiar el estado.';

    } finally {

      this.cambiandoEstadoId = null;
      this.cdr.detectChanges();

    }
  }
}
