
package cl.vetcloud.backend.controller;

import cl.vetcloud.backend.entity.Tutor;
import cl.vetcloud.backend.service.TutorService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/veterinarias/{idVeterinaria}/tutores")
public class TutorController {

    private final TutorService tutorService;

    public TutorController(TutorService tutorService) {
        this.tutorService = tutorService;
    }

    // Consultar tutores de una veterinaria
    @GetMapping
    public List<Tutor> listar(
            @PathVariable Long idVeterinaria) {

        return tutorService.listarPorVeterinaria(idVeterinaria);
    }

    // Consultar un tutor específico
    @GetMapping("/{idTutor}")
    public Tutor buscarPorId(
            @PathVariable Long idVeterinaria,
            @PathVariable Long idTutor) {

        return tutorService.buscarPorId(
                idVeterinaria,
                idTutor
        );
    }

    // Registrar tutor
    @PostMapping
    public ResponseEntity<Tutor> crear(
            @PathVariable Long idVeterinaria,
            @RequestBody Tutor datos) {

        Tutor tutor = tutorService.crear(
                idVeterinaria,
                datos
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(tutor);
    }

    // Actualizar tutor
    @PutMapping("/{idTutor}")
    public Tutor actualizar(
            @PathVariable Long idVeterinaria,
            @PathVariable Long idTutor,
            @RequestBody Tutor datos) {

        return tutorService.actualizar(
                idVeterinaria,
                idTutor,
                datos
        );
    }
}
