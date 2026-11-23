
package cl.vetcloud.backend.config;

import cl.vetcloud.backend.service.UsuarioService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final UsuarioService usuarioService;

    public SecurityConfig(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            // Habilitar CORS para Angular
            .cors(cors -> cors.configurationSource(
                corsConfigurationSource()
            ))

            .authorizeHttpRequests(auth -> auth

                // F01: Gestion de veterinarias
                .requestMatchers("/api/veterinarias/**")
                .hasAllAuthorities(
                    "SCOPE_vetcloud.access",
                    "ROLE_SUPERADMIN"
                )

                // F02: Gestion de usuarios
                .requestMatchers("/api/usuarios/**")
                .hasAllAuthorities(
                    "SCOPE_vetcloud.access",
                    "ROLE_SUPERADMIN"
                )

                // F02: Consulta de roles
                .requestMatchers("/api/roles/**")
                .hasAllAuthorities(
                    "SCOPE_vetcloud.access",
                    "ROLE_SUPERADMIN"
                )

                // Denegar endpoints sin permisos definidos
                .anyRequest().denyAll()
            )

            .oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwt ->
                    jwt.jwtAuthenticationConverter(
                        jwtAuthenticationConverter()
                    )
                )
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of("http://localhost:4200")
        );

        configuration.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
            )
        );

        configuration.setAllowedHeaders(
            List.of(
                "Authorization",
                "Content-Type"
            )
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/api/**",
            configuration
        );

        return source;
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter scopes =
                new JwtGrantedAuthoritiesConverter();

        scopes.setAuthorityPrefix("SCOPE_");
        scopes.setAuthoritiesClaimName("scp");

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {

            var authorities = new ArrayList<>(
                scopes.convert(jwt)
            );

            // Consultar rol del usuario en Oracle
            authorities.addAll(
                usuarioService.obtenerRolesPorEntraSub(
                    jwt.getSubject()
                )
            );

            return authorities;
        });

        return converter;
    }
}
