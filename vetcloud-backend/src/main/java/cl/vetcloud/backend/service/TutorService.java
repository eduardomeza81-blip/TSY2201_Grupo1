
package cl.vetcloud.backend.service;

import cl.vetcloud.backend.entity.Tutor;
import cl.vetcloud.backend.repository.TutorRepository;
import cl.vetcloud.backend.repository.VeterinariaRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TutorService {

    private final TutorRepository tutorRepository;
    private final VeterinariaRepository veterinariaRepository;

    public TutorService(
            TutorRepository tutorRepository,
            VeterinariaRepository veterinariaRepository) {

        this.tutorRepository = tutorRepository;
        this.veterinariaRepository = veterinariaRepository;
    }

    // Listar tutores de una veterinaria
    public List<Tutor> listarPorVeterinaria(Long idVeterinaria) {

        validarVeterinaria(idVeterinaria);

        return tutorRepository.findByIdVeterinaria(idVeterinaria);
    }

    // Consultar un tutor dentro de una veterinaria
    public Tutor buscarPorId(
            Long idVeterinaria,
            Long idTutor) {

        return tutorRepository
                .findByIdTutorAndIdVeterinaria(
                        idTutor,
                        idVeterinaria
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Tutor no encontrado"
                        )
                );
    }

    // Registrar un tutor
    public Tutor crear(
            Long idVeterinaria,
            Tutor datos) {

        validarVeterinaria(idVeterinaria);
        validarNombre(datos.getNombre());

        Tutor tutor = new Tutor();

        tutor.setIdVeterinaria(idVeterinaria);
        tutor.setNombre(datos.getNombre().trim());
        tutor.setRut(datos.getRut());
        tutor.setTelefono(datos.getTelefono());
        tutor.setEmail(datos.getEmail());
        tutor.setDireccion(datos.getDireccion());

        return tutorRepository.save(tutor);
    }

    // Actualizar un tutor existente
    public Tutor actualizar(
            Long idVeterinaria,
            Long idTutor,
            Tutor datos) {

        Tutor tutor = buscarPorId(
                idVeterinaria,
                idTutor
        );

        validarNombre(datos.getNombre());

        tutor.setNombre(datos.getNombre().trim());
        tutor.setRut(datos.getRut());
        tutor.setTelefono(datos.getTelefono());
        tutor.setEmail(datos.getEmail());
        tutor.setDireccion(datos.getDireccion());

        return tutorRepository.save(tutor);
    }

    private void validarNombre(String nombre) {

        if (nombre == null || nombre.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre del tutor es obligatorio"
            );
        }
    }

    private void validarVeterinaria(Long idVeterinaria) {

        if (idVeterinaria == null ||
                !veterinariaRepository.existsById(idVeterinaria)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Veterinaria no encontrada"
            );
        }
    }
}
