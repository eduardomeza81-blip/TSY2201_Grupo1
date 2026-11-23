
package cl.vetcloud.backend;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class DatabaseTestController {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseTestController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/test-db")
    public Map<String, Object> testDatabase() {

        String usuario = jdbcTemplate.queryForObject(
            "SELECT USER FROM DUAL",
            String.class
        );

        return Map.of(
            "aplicacion", "VetCloud SaaS",
            "baseDatos", "Oracle Autonomous Database",
            "usuario", usuario,
            "estado", "CONECTADO"
        );
    }
}
