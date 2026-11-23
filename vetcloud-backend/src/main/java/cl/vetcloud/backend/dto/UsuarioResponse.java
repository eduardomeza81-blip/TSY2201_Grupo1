
package cl.vetcloud.backend.dto;

import java.time.LocalDateTime;

public record UsuarioResponse(
    Long idUsuario,
    String nombre,
    String email,
    Long idVeterinaria,
    String nombreVeterinaria,
    Long idRol,
    String codigoRol,
    String nombreRol,
    Integer activo,
    Boolean vinculadoEntra,
    LocalDateTime fechaCreacion
) {
}
