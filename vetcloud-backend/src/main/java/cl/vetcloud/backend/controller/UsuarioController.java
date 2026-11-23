
package cl.vetcloud.backend.controller;

import cl.vetcloud.backend.dto.UsuarioRequest;
import cl.vetcloud.backend.dto.UsuarioResponse;
import cl.vetcloud.backend.service.UsuarioService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // Listar usuarios
    @GetMapping
    public List<UsuarioResponse> listar() {
        return usuarioService.listar();
    }

    // Consultar usuario por ID
    @GetMapping("/{id}")
    public UsuarioResponse buscarPorId(
            @PathVariable Long id) {

        return usuarioService.buscarPorId(id);
    }

    // Registrar usuario
    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(
            @RequestBody UsuarioRequest datos) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(usuarioService.crear(datos));
    }

    // Actualizar usuario
    @PutMapping("/{id}")
    public UsuarioResponse actualizar(
            @PathVariable Long id,
            @RequestBody UsuarioRequest datos) {

        return usuarioService.actualizar(id, datos);
    }

    // Activar usuario
    @PatchMapping("/{id}/activar")
    public UsuarioResponse activar(
            @PathVariable Long id) {

        return usuarioService.cambiarEstado(id, true);
    }

    // Desactivar usuario
    @PatchMapping("/{id}/desactivar")
    public UsuarioResponse desactivar(
            @PathVariable Long id) {

        return usuarioService.cambiarEstado(id, false);
    }
}
