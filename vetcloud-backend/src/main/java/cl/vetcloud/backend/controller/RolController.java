
package cl.vetcloud.backend.controller;

import cl.vetcloud.backend.dto.RolResponse;
import cl.vetcloud.backend.service.RolService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RolController {

    private final RolService rolService;

    public RolController(RolService rolService) {
        this.rolService = rolService;
    }

    @GetMapping
    public List<RolResponse> listar() {
        return rolService.listar();
    }
}
