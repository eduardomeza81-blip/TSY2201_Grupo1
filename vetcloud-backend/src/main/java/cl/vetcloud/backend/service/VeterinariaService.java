
package cl.vetcloud.backend.service;

import cl.vetcloud.backend.entity.Veterinaria;
import cl.vetcloud.backend.repository.VeterinariaRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class VeterinariaService {

    private final VeterinariaRepository repository;

    public VeterinariaService(VeterinariaRepository repository) {
        this.repository = repository;
    }

    // Consultar todas las veterinarias
    public List<Veterinaria> listar() {
        return repository.findAll();
    }

    // Consultar una veterinaria por ID
    public Veterinaria buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Veterinaria no encontrada"
                ));
    }

    // Registrar una nueva veterinaria
    public Veterinaria crear(Veterinaria veterinaria) {

        if (veterinaria.getNombre() == null ||
                veterinaria.getNombre().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre de la veterinaria es obligatorio"
            );
        }

        if (veterinaria.getRut() != null &&
                repository.existsByRut(veterinaria.getRut())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe una veterinaria con ese RUT"
            );
        }

        veterinaria.setIdVeterinaria(null);
        veterinaria.setActiva(1);
        veterinaria.setFechaCreacion(null);

        return repository.save(veterinaria);
    }

    // Actualizar datos de una veterinaria
    public Veterinaria actualizar(Long id, Veterinaria datos) {

        Veterinaria actual = buscarPorId(id);

        if (datos.getNombre() == null ||
                datos.getNombre().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre de la veterinaria es obligatorio"
            );
        }

        if (datos.getRut() != null) {
            repository.findByRut(datos.getRut())
                    .filter(v -> !v.getIdVeterinaria().equals(id))
                    .ifPresent(v -> {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "El RUT pertenece a otra veterinaria"
                        );
                    });
        }

        actual.setNombre(datos.getNombre());
        actual.setRut(datos.getRut());
        actual.setDireccion(datos.getDireccion());
        actual.setTelefono(datos.getTelefono());
        actual.setEmail(datos.getEmail());

        return repository.save(actual);
    }

    // Activar o desactivar una veterinaria
    public Veterinaria cambiarEstado(Long id, boolean activa) {

        Veterinaria veterinaria = buscarPorId(id);
        veterinaria.setActiva(activa ? 1 : 0);

        return repository.save(veterinaria);
    }
}
