
package cl.vetcloud.backend.service;

import cl.vetcloud.backend.dto.UsuarioRequest;
import cl.vetcloud.backend.dto.UsuarioResponse;
import cl.vetcloud.backend.entity.Rol;
import cl.vetcloud.backend.entity.Usuario;
import cl.vetcloud.backend.repository.RolRepository;
import cl.vetcloud.backend.repository.UsuarioRepository;
import cl.vetcloud.backend.repository.VeterinariaRepository;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final VeterinariaRepository veterinariaRepository;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            VeterinariaRepository veterinariaRepository) {

        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.veterinariaRepository = veterinariaRepository;
    }

    // Obtener roles para la autenticacion Microsoft Entra B2C
    @Transactional(readOnly = true)
    public List<SimpleGrantedAuthority> obtenerRolesPorEntraSub(
            String entraSub) {

        if (entraSub == null || entraSub.isBlank()) {
            return List.of();
        }

        Optional<Usuario> usuario =
                usuarioRepository.findByEntraSub(entraSub);

        // El usuario debe existir y estar activo
        if (usuario.isEmpty()
                || !Integer.valueOf(1).equals(
                    usuario.get().getActivo())) {
            return List.of();
        }

        Optional<Rol> rol =
                rolRepository.findById(
                    usuario.get().getIdRol()
                );

        if (rol.isEmpty()
                || rol.get().getCodigo() == null
                || rol.get().getCodigo().isBlank()) {
            return List.of();
        }

        return List.of(
            new SimpleGrantedAuthority(
                "ROLE_" + rol.get().getCodigo()
            )
        );
    }

    // Listar usuarios
    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {

        return usuarioRepository
                .findAll(Sort.by("idUsuario"))
                .stream()
                .map(this::convertirResponse)
                .toList();
    }

    // Buscar usuario por ID
    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Long id) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuario no encontrado"
                    )
                );

        return convertirResponse(usuario);
    }

    // Registrar un nuevo usuario
    @Transactional
    public UsuarioResponse crear(UsuarioRequest datos) {

        validarDatos(datos);

        String email = datos.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (usuarioRepository.existsByEmailIgnoreCase(email)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El correo electrónico ya está registrado"
            );
        }

        Usuario usuario = new Usuario();

        usuario.setNombre(datos.nombre().trim());
        usuario.setEmail(email);
        usuario.setIdRol(datos.idRol());
        usuario.setIdVeterinaria(datos.idVeterinaria());
        usuario.setActivo(1);
        usuario.setFechaCreacion(LocalDateTime.now());

        // La autenticacion se administra mediante Entra B2C
        usuario.setPasswordHash(null);
        usuario.setEntraSub(null);

        Usuario guardado = usuarioRepository.save(usuario);

        return convertirResponse(guardado);
    }

    // Actualizar un usuario existente
    @Transactional
    public UsuarioResponse actualizar(
            Long id,
            UsuarioRequest datos) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuario no encontrado"
                    )
                );

        validarDatos(datos);

        String email = datos.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        Optional<Usuario> usuarioExistente =
                usuarioRepository.findByEmailIgnoreCase(email);

        if (usuarioExistente.isPresent()
                && !usuarioExistente.get()
                    .getIdUsuario().equals(id)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El correo pertenece a otro usuario"
            );
        }

        // Proteger el correo de usuarios vinculados a Entra
        if (usuario.getEntraSub() != null
                && !usuario.getEmail().equalsIgnoreCase(email)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede cambiar el correo de un usuario vinculado a Entra"
            );
        }

        // Proteger el rol del superadministrador
        Rol rolActual = rolRepository
                .findById(usuario.getIdRol())
                .orElseThrow();

        if ("SUPERADMIN".equals(rolActual.getCodigo())
                && !usuario.getIdRol().equals(datos.idRol())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede modificar el rol del superadministrador"
            );
        }

        usuario.setNombre(datos.nombre().trim());
        usuario.setEmail(email);
        usuario.setIdRol(datos.idRol());
        usuario.setIdVeterinaria(datos.idVeterinaria());

        Usuario actualizado = usuarioRepository.save(usuario);

        return convertirResponse(actualizado);
    }

    // Validar los datos del usuario
    private void validarDatos(UsuarioRequest datos) {

        if (datos == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe ingresar los datos del usuario"
            );
        }

        // Validar nombre
        if (datos.nombre() == null
                || datos.nombre().isBlank()
                || datos.nombre().trim().length() > 150) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre del usuario no es válido"
            );
        }

        // Validar correo electronico
        if (datos.email() == null
                || datos.email().trim().length() > 150
                || !datos.email().trim().matches(
                    "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El correo electrónico no es válido"
            );
        }

        // Validar rol
        if (datos.idRol() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar un rol"
            );
        }

        Rol rol = rolRepository.findById(datos.idRol())
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El rol seleccionado no existe"
                    )
                );

        // Validar asociacion con una veterinaria
        if ("SUPERADMIN".equals(rol.getCodigo())) {

            if (datos.idVeterinaria() != null) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El superadministrador no debe estar asociado a una veterinaria"
                );
            }

        } else {

            if (datos.idVeterinaria() == null) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Debe seleccionar una veterinaria"
                );
            }

            var veterinaria = veterinariaRepository
                    .findById(datos.idVeterinaria())
                    .orElseThrow(() ->
                        new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "La veterinaria seleccionada no existe"
                        )
                    );

            if (!Integer.valueOf(1).equals(
                    veterinaria.getActiva())) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La veterinaria seleccionada está inactiva"
                );
            }
        }
    }

    // Convertir entidad Usuario a DTO
    private UsuarioResponse convertirResponse(Usuario usuario) {

        Rol rol = rolRepository
                .findById(usuario.getIdRol())
                .orElse(null);

        String nombreVeterinaria = null;

        if (usuario.getIdVeterinaria() != null) {

            nombreVeterinaria = veterinariaRepository
                    .findById(usuario.getIdVeterinaria())
                    .map(veterinaria -> veterinaria.getNombre())
                    .orElse(null);
        }

        return new UsuarioResponse(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getIdVeterinaria(),
                nombreVeterinaria,
                usuario.getIdRol(),
                rol != null ? rol.getCodigo() : null,
                rol != null ? rol.getNombre() : null,
                usuario.getActivo(),
                usuario.getEntraSub() != null
                    && !usuario.getEntraSub().isBlank(),
                usuario.getFechaCreacion()
        );
    }

    // Activar o desactivar un usuario
    @Transactional
    public UsuarioResponse cambiarEstado(
            Long id,
            boolean activar) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuario no encontrado"
                    )
                );

        Rol rol = rolRepository
                .findById(usuario.getIdRol())
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El rol del usuario no existe"
                    )
                );

        // Proteger al superadministrador
        if (!activar && "SUPERADMIN".equals(rol.getCodigo())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede desactivar un superadministrador"
            );
        }

        // Validar veterinaria antes de activar
        if (activar && !"SUPERADMIN".equals(rol.getCodigo())) {

            if (usuario.getIdVeterinaria() == null) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El usuario no tiene una veterinaria asignada"
                );
            }

            var veterinaria = veterinariaRepository
                    .findById(usuario.getIdVeterinaria())
                    .orElseThrow(() ->
                        new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "La veterinaria asignada no existe"
                        )
                    );

            if (!Integer.valueOf(1).equals(
                    veterinaria.getActiva())) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La veterinaria asignada está inactiva"
                );
            }
        }

        usuario.setActivo(activar ? 1 : 0);

        Usuario actualizado = usuarioRepository.save(usuario);

        return convertirResponse(actualizado);
    }

}
