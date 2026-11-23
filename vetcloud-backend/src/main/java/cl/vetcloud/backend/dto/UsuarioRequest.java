
package cl.vetcloud.backend.dto;

public record UsuarioRequest(
    String nombre,
    String email,
    Long idVeterinaria,
    Long idRol
) {
}
