
package cl.vetcloud.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "TUTORES")
public class Tutor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_TUTOR")
    private Long idTutor;

    @Column(name = "ID_VETERINARIA", nullable = false)
    private Long idVeterinaria;

    @Column(name = "NOMBRE", nullable = false, length = 150)
    private String nombre;

    @Column(name = "RUT", length = 20)
    private String rut;

    @Column(name = "TELEFONO", length = 30)
    private String telefono;

    @Column(name = "EMAIL", length = 150)
    private String email;

    @Column(name = "DIRECCION", length = 250)
    private String direccion;

    public Tutor() {
    }

    public Long getIdTutor() {
        return idTutor;
    }

    public void setIdTutor(Long idTutor) {
        this.idTutor = idTutor;
    }

    public Long getIdVeterinaria() {
        return idVeterinaria;
    }

    public void setIdVeterinaria(Long idVeterinaria) {
        this.idVeterinaria = idVeterinaria;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getRut() {
        return rut;
    }

    public void setRut(String rut) {
        this.rut = rut;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
}
