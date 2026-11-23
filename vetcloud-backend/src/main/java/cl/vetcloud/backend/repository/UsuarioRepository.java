
package cl.vetcloud.backend.repository;

import cl.vetcloud.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository
        extends JpaRepository<Usuario, Long> {

    // Buscar usuario por identidad Microsoft Entra B2C
    Optional<Usuario> findByEntraSub(String entraSub);

    // Buscar usuario por correo electrónico
    Optional<Usuario> findByEmailIgnoreCase(String email);

    // Validar si existe un correo electrónico
    boolean existsByEmailIgnoreCase(String email);

    // Listar usuarios de una veterinaria
    List<Usuario> findByIdVeterinaria(Long idVeterinaria);

    // Listar usuarios por rol
    List<Usuario> findByIdRol(Long idRol);

    // Listar usuarios según su estado
    List<Usuario> findByActivo(Integer activo);

}
