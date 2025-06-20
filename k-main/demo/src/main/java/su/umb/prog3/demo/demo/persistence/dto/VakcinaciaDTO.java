package su.umb.prog3.demo.demo.persistence.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.util.List;

public class VakcinaciaDTO {
    private Long osobaId;
    private Long vakcinaId;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate datumZaciatku;
    
    private int pocetDavok;
    private List<Integer> intervalyDni; // Days between doses

    // Constructors
    public VakcinaciaDTO() {}

    public VakcinaciaDTO(Long osobaId, Long vakcinaId, LocalDate datumZaciatku, int pocetDavok, List<Integer> intervalyDni) {
        this.osobaId = osobaId;
        this.vakcinaId = vakcinaId;
        this.datumZaciatku = datumZaciatku;
        this.pocetDavok = pocetDavok;
        this.intervalyDni = intervalyDni;
    }

    // Getters and setters
    public Long getOsobaId() {
        return osobaId;
    }

    public void setOsobaId(Long osobaId) {
        this.osobaId = osobaId;
    }

    public Long getVakcinaId() {
        return vakcinaId;
    }

    public void setVakcinaId(Long vakcinaId) {
        this.vakcinaId = vakcinaId;
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

    public List<Integer> getIntervalyDni() {
        return intervalyDni;
    }

    public void setIntervalyDni(List<Integer> intervalyDni) {
        this.intervalyDni = intervalyDni;
    }

    @Override
    public String toString() {
        return "VakcinaciaDTO{" +
                "osobaId=" + osobaId +
                ", vakcinaId=" + vakcinaId +
                ", datumZaciatku=" + datumZaciatku +
                ", pocetDavok=" + pocetDavok +
                ", intervalyDni=" + intervalyDni +
                '}';
    }
}
