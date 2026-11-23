
package cl.vetcloud.backend.repository;

import cl.vetcloud.backend.entity.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TutorRepository extends JpaRepository<Tutor, Long> {

    // Consultar tutores pertenecientes a una veterinaria
    List<Tutor> findByIdVeterinaria(Long idVeterinaria);

    // Consultar un tutor por su ID y veterinaria
    java.util.Optional<Tutor> findByIdTutorAndIdVeterinaria(
        Long idTutor,
        Long idVeterinaria
    );
}
