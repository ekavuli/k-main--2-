package su.umb.prog3.demo.demo.persistence.dto;

import java.time.LocalDate;

public class VakcinaciaResponseDTO {
    public Long id;
    public Long osobaId;
    public Long vakcinaId;
    public LocalDate datumZaciatku;
    public int pocetDavok;
    public boolean dokoncena;

    public VakcinaciaResponseDTO() {}

    public VakcinaciaResponseDTO(Long id, Long osobaId, Long vakcinaId, LocalDate datumZaciatku, int pocetDavok, boolean dokoncena) {
        this.id = id;
        this.osobaId = osobaId;
        this.vakcinaId = vakcinaId;
        this.datumZaciatku = datumZaciatku;
        this.pocetDavok = pocetDavok;
        this.dokoncena = dokoncena;
    }

    public static VakcinaciaResponseDTO fromEntity(su.umb.prog3.demo.demo.persistence.entity.VakcinaciaEntity entity) {
        return new VakcinaciaResponseDTO(
            entity.getId(),
            entity.getOsoba() != null ? entity.getOsoba().getId() : null,
            entity.getVakcina() != null ? entity.getVakcina().getId() : null,
            entity.getDatumZaciatku(),
            entity.getPocetDavok(),
            entity.isDokoncena()
        );
    }
}
