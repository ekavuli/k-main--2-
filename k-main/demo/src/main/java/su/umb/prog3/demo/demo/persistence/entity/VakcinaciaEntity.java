package su.umb.prog3.demo.demo.persistence.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "vakcinácia")
public class VakcinaciaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "osoba_id", nullable = false)
    private OsobaEntity osoba;

    @ManyToOne
    @JoinColumn(name = "vakcina_id", nullable = false)
    private Vakcina vakcina;

    private LocalDate datumZaciatku;
    private int pocetDavok;
    private String intervalyDni; // JSON string containing intervals between doses
    private boolean dokoncena;

    @OneToMany(mappedBy = "vakcinácia", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<OsobaVakcina> aplikovaneDavky;

    // Constructors
    public VakcinaciaEntity() {}

    public VakcinaciaEntity(OsobaEntity osoba, Vakcina vakcina, LocalDate datumZaciatku, int pocetDavok) {
        this.osoba = osoba;
        this.vakcina = vakcina;
        this.datumZaciatku = datumZaciatku;
        this.pocetDavok = pocetDavok;
        this.dokoncena = false;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OsobaEntity getOsoba() {
        return osoba;
    }

    public void setOsoba(OsobaEntity osoba) {
        this.osoba = osoba;
    }

    public Vakcina getVakcina() {
        return vakcina;
    }

    public void setVakcina(Vakcina vakcina) {
        this.vakcina = vakcina;
    }

    public LocalDate getDatumZaciatku() {
        return datumZaciatku;
    }

    public void setDatumZaciatku(LocalDate datumZaciatku) {
        this.datumZaciatku = datumZaciatku;
    }

    public int getPocetDavok() {
        return pocetDavok;
    }

    public void setPocetDavok(int pocetDavok) {
        this.pocetDavok = pocetDavok;
    }

    public String getIntervalyDni() {
        return intervalyDni;
    }

    public void setIntervalyDni(String intervalyDni) {
        this.intervalyDni = intervalyDni;
    }

    public boolean isDokoncena() {
        return dokoncena;
    }

    public void setDokoncena(boolean dokoncena) {
        this.dokoncena = dokoncena;
    }

    public List<OsobaVakcina> getAplikovaneDavky() {
        return aplikovaneDavky;
    }

    public void setAplikovaneDavky(List<OsobaVakcina> aplikovaneDavky) {
        this.aplikovaneDavky = aplikovaneDavky;
    }
}
