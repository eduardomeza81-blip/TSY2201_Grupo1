
package cl.vetcloud.backend.service;

import cl.vetcloud.backend.dto.RolResponse;
import cl.vetcloud.backend.repository.RolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;

import java.util.List;

@Service
public class RolService {

    private final RolRepository rolRepository;

    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    // Listar los roles disponibles en VetCloud SaaS
    @Transactional(readOnly = true)
    public List<RolResponse> listar() {

        return rolRepository
                .findAll(Sort.by("idRol"))
                .stream()
                .map(rol -> new RolResponse(
                        rol.getIdRol(),
                        rol.getCodigo(),
                        rol.getNombre()
                ))
                .toList();
    }
}
