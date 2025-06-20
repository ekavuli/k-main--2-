package su.umb.prog3.demo.demo.persistence.entity;

import jakarta.persistence.*;
import su.umb.prog3.demo.demo.persistence.enums.TypVakciny;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.OneToMany;

import java.util.List;

@Entity
public class Vakcina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nazov;
    private String vyrobca;

    @Enumerated(EnumType.STRING)
    private TypVakciny typ;

    @OneToMany(mappedBy = "vakcina", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<OsobaVakcina> osoby;

    private Integer pocetDavok;

    // @Column(columnDefinition = "TEXT")
    // @Convert(converter = IntegerListConverter.class)
    // private List<Integer> intervalyDni;

    // ✅ Standard getters/setters for JSON serialization
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNazov() {
        return nazov;
    }

    public void setNazov(String nazov) {
        this.nazov = nazov;
    }

    public String getVyrobca() {
        return vyrobca;
    }

    public void setVyrobca(String vyrobca) {
        this.vyrobca = vyrobca;
    }

    public TypVakciny getTyp() {
        return typ;
    }

    public void setTyp(TypVakciny typ) {
        this.typ = typ;
    }

    public List<OsobaVakcina> getOsoby() {
        return osoby;
    }

    public void setOsoby(List<OsobaVakcina> osoby) {
        this.osoby = osoby;
    }

    public Integer getPocetDavok() {
        return pocetDavok;
    }

    public void setPocetDavok(Integer pocetDavok) {
        this.pocetDavok = pocetDavok;
    }

    // public List<Integer> getIntervalyDni() {
    //     return intervalyDni;
    // }

    // public void setIntervalyDni(List<Integer> intervalyDni) {
    //     this.intervalyDni = intervalyDni;
    // }

    // ✅ Existing methods with "Entity" suffix (keep these for internal use)
    public Long getIdEntity() {
        return id;
    }

    public void setIdEntity(Long id) {
        this.id = id;
    }

    public String getNazovEntity() {
        return nazov;
    }

    public void setNazovEntity(String nazov) {
        this.nazov = nazov;
    }

    public String getVyrobcaEntity() {
        return vyrobca;
    }

    public void setVyrobcaEntity(String vyrobca) {
        this.vyrobca = vyrobca;
    }

    public TypVakciny getTypEntity() {
        return typ;
    }

    public void setTypEntity(TypVakciny typ) {
        this.typ = typ;
    }

    public List<OsobaVakcina> getOsobyEntity() {
        return osoby;
    }

    public void setOsobyEntity(List<OsobaVakcina> osoby) {
        this.osoby = osoby;
    }

    @Override
    public String toString() {
        return "Vakcina{" +
                "id=" + id +
                ", nazov='" + nazov + '\'' +
                ", vyrobca='" + vyrobca + '\'' +
                ", typ=" + typ +
                '}';
    }
}
