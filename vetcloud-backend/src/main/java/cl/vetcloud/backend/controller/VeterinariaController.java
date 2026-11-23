
package cl.vetcloud.backend.controller;

import cl.vetcloud.backend.entity.Veterinaria;
import cl.vetcloud.backend.service.VeterinariaService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/veterinarias")
public class VeterinariaController {

    private final VeterinariaService service;

    public VeterinariaController(VeterinariaService service) {
        this.service = service;
    }

    // Listar veterinarias
    @GetMapping
    public List<Veterinaria> listar() {
        return service.listar();
    }

    // Buscar veterinaria por ID
    @GetMapping("/{id}")
    public Veterinaria buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    // Registrar veterinaria
    @PostMapping
    public ResponseEntity<Veterinaria> crear(
            @RequestBody Veterinaria veterinaria) {

        Veterinaria creada = service.crear(veterinaria);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(creada);
    }

    // Actualizar veterinaria
    @PutMapping("/{id}")
    public Veterinaria actualizar(
            @PathVariable Long id,
            @RequestBody Veterinaria veterinaria) {

        return service.actualizar(id, veterinaria);
    }

    // Activar veterinaria
    @PatchMapping("/{id}/activar")
    public Veterinaria activar(@PathVariable Long id) {
        return service.cambiarEstado(id, true);
    }

    // Desactivar veterinaria
    @PatchMapping("/{id}/desactivar")
    public Veterinaria desactivar(@PathVariable Long id) {
        return service.cambiarEstado(id, false);
    }
}
