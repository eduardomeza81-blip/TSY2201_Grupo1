
package cl.vetcloud.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ROLES")
public class Rol {

    @Id
    @Column(name = "ID_ROL")
    private Long idRol;

    @Column(name = "CODIGO", nullable = false)
    private String codigo;

    @Column(name = "NOMBRE", nullable = false)
    private String nombre;

    public Long getIdRol() {
        return idRol;
    }

    public void setIdRol(Long idRol) {
        this.idRol = idRol;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
