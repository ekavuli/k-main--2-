package su.umb.prog3.demo.demo.persistence.dto;

import su.umb.prog3.demo.demo.persistence.entity.OsobaVakcina;

import java.time.LocalDate;

public class OsobaVakcinaDTO {
    private Long id;
    private Long osobaId;
    private Long vakcinaId;
    private LocalDate datumAplikacie;
    private Integer poradieDavky;
    
    // Add these fields to match the frontend expectations
    private String osobaMeno;
    private String osobaPriezvisko;
    private String vakcinaNazov;
    private String vakcinaTyp;

    public OsobaVakcinaDTO() {
        // default constructor
    }

    public OsobaVakcinaDTO(OsobaVakcina entity) {
        this.id = entity.getId();
        this.osobaId = entity.getOsoba().getId();
        this.vakcinaId = entity.getVakcina().getId();
        this.datumAplikacie = entity.getDatumAplikacie();
        this.poradieDavky = entity.getPoradieDavky();
        
        // Set additional fields
        this.osobaMeno = entity.getOsoba().getMeno();
        this.osobaPriezvisko = entity.getOsoba().getPriezvisko();
        this.vakcinaNazov = entity.getVakcina().getNazov();
        this.vakcinaTyp = entity.getVakcina().getTyp().toString();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public LocalDate getDatumAplikacie() {
        return datumAplikacie;
    }

    public void setDatumAplikacie(LocalDate datumAplikacie) {
        this.datumAplikacie = datumAplikacie;
    }

    public Integer getPoradieDavky() {
        return poradieDavky;
    }

    public void setPoradieDavky(Integer poradieDavky) {
        this.poradieDavky = poradieDavky;
    }

    public String getOsobaMeno() {
        return osobaMeno;
    }

    public void setOsobaMeno(String osobaMeno) {
        this.osobaMeno = osobaMeno;
    }

    public String getOsobaPriezvisko() {
        return osobaPriezvisko;
    }

    public void setOsobaPriezvisko(String osobaPriezvisko) {
        this.osobaPriezvisko = osobaPriezvisko;
    }

    public String getVakcinaNazov() {
        return vakcinaNazov;
    }

    public void setVakcinaNazov(String vakcinaNazov) {
        this.vakcinaNazov = vakcinaNazov;
    }

    public String getVakcinaTyp() {
        return vakcinaTyp;
    }

    public void setVakcinaTyp(String vakcinaTyp) {
        this.vakcinaTyp = vakcinaTyp;
    }
}