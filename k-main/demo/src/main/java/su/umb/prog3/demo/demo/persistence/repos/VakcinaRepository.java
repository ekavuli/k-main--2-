package su.umb.prog3.demo.demo.persistence.repos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import su.umb.prog3.demo.demo.persistence.entity.Vakcina;

public interface VakcinaRepository extends JpaRepository<Vakcina, Long> {
    
    @Query("SELECT COUNT(ov) FROM OsobaVakcina ov WHERE ov.vakcina.id = ?1")
    long countVaccinationsByVaccineId(Long vaccineId);
    
    @Query("SELECT COUNT(v) FROM VakcinaciaEntity v WHERE v.vakcina.id = ?1")
    long countVaccinationCampaignsByVaccineId(Long vaccineId);
}