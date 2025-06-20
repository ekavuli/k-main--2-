package su.umb.prog3.demo.demo.persistence.dto;

import java.time.LocalDate;

public class NotifikaciaDTO {
    private Long osobaId;
    private String osobaMeno;
    private String osobaPriezvisko;
    private String vakcinaNazov;
    private LocalDate planovanyDatum;
    private Integer poradieDavky;
    private Integer dniDoAplikacie;

    public NotifikaciaDTO() {}

    public NotifikaciaDTO(Long osobaId, String osobaMeno, String osobaPriezvisko, 
                         String vakcinaNazov, LocalDate planovanyDatum, 
                         Integer poradieDavky, Integer dniDoAplikacie) {
        this.osobaId = osobaId;
        this.osobaMeno = osobaMeno;
        this.osobaPriezvisko = osobaPriezvisko;
        this.vakcinaNazov = vakcinaNazov;
        this.planovanyDatum = planovanyDatum;
        this.poradieDavky = poradieDavky;
        this.dniDoAplikacie = dniDoAplikacie;
    }

    // Getters and Setters
    public Long getOsobaId() { return osobaId; }
    public void setOsobaId(Long osobaId) { this.osobaId = osobaId; }

    public String getOsobaMeno() { return osobaMeno; }
    public void setOsobaMeno(String osobaMeno) { this.osobaMeno = osobaMeno; }

    public String getOsobaPriezvisko() { return osobaPriezvisko; }
    public void setOsobaPriezvisko(String osobaPriezvisko) { this.osobaPriezvisko = osobaPriezvisko; }

    public String getVakcinaNazov() { return vakcinaNazov; }
    public void setVakcinaNazov(String vakcinaNazov) { this.vakcinaNazov = vakcinaNazov; }

    public LocalDate getPlanovanyDatum() { return planovanyDatum; }
    public void setPlanovanyDatum(LocalDate planovanyDatum) { this.planovanyDatum = planovanyDatum; }

    public Integer getPoradieDavky() { return poradieDavky; }
    public void setPoradieDavky(Integer poradieDavky) { this.poradieDavky = poradieDavky; }

    public Integer getDniDoAplikacie() { return dniDoAplikacie; }
    public void setDniDoAplikacie(Integer dniDoAplikacie) { this.dniDoAplikacie = dniDoAplikacie; }
}
