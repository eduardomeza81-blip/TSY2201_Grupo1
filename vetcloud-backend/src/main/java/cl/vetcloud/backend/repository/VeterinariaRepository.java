
package cl.vetcloud.backend.repository;

import cl.vetcloud.backend.entity.Veterinaria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VeterinariaRepository
        extends JpaRepository<Veterinaria, Long> {

    Optional<Veterinaria> findByRut(String rut);

    boolean existsByRut(String rut);
}
