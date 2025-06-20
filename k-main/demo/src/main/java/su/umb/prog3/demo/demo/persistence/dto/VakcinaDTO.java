package su.umb.prog3.demo.demo.persistence.dto;

import su.umb.prog3.demo.demo.persistence.entity.Vakcina;

public class VakcinaDTO {
    public Long id;
    public String nazov;
    public String vyrobca;
    public String typ;

    public VakcinaDTO(Vakcina v) {
        this.id = v.getId();
        this.nazov = v.getNazov();
        this.vyrobca = v.getVyrobca();
        this.typ = v.getTyp().toString();
    }
}
