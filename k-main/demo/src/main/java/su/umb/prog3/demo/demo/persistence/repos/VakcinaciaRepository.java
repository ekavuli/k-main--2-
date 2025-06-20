package su.umb.prog3.demo.demo.persistence.repos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import su.umb.prog3.demo.demo.persistence.entity.VakcinaciaEntity;

import java.time.LocalDate;
import java.util.List;

public interface VakcinaciaRepository extends JpaRepository<VakcinaciaEntity, Long> {
    List<VakcinaciaEntity> findByDokoncenaFalse();
    
    @Query("SELECT v FROM VakcinaciaEntity v WHERE v.dokoncena = false AND v.osoba.id = ?1")
    List<VakcinaciaEntity> findActiveVaccinationsByPersonId(Long personId);
    
    @Query("SELECT v FROM VakcinaciaEntity v WHERE v.vakcina.id = ?1")
    List<VakcinaciaEntity> findByVakcinaId(Long vakcinaId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM VakcinaciaEntity v WHERE v.id = ?1")
    void deleteVakcinaciaById(Long id);
}
