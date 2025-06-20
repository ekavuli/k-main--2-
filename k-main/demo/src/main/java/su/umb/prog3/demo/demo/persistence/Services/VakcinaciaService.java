package su.umb.prog3.demo.demo.persistence.Services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import su.umb.prog3.demo.demo.persistence.dto.VakcinaciaDTO;
import su.umb.prog3.demo.demo.persistence.entity.OsobaEntity;
import su.umb.prog3.demo.demo.persistence.entity.OsobaVakcina;
import su.umb.prog3.demo.demo.persistence.entity.Vakcina;
import su.umb.prog3.demo.demo.persistence.entity.VakcinaciaEntity;
import su.umb.prog3.demo.demo.persistence.repos.OsobaRepository;
import su.umb.prog3.demo.demo.persistence.repos.OsobaVakcinaRepository;
import su.umb.prog3.demo.demo.persistence.repos.VakcinaRepository;
import su.umb.prog3.demo.demo.persistence.repos.VakcinaciaRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VakcinaciaService {

    private final VakcinaciaRepository vakcinaciaRepository;
    private final OsobaVakcinaRepository osobaVakcinaRepository;
    private final OsobaRepository osobaRepository;
    private final VakcinaRepository vakcinaRepository;
    private final ObjectMapper objectMapper;
    
    @Autowired
    public VakcinaciaService(
        VakcinaciaRepository vakcinaciaRepository,
        OsobaVakcinaRepository osobaVakcinaRepository,
        OsobaRepository osobaRepository,
        VakcinaRepository vakcinaRepository,
        ObjectMapper objectMapper
    ) {
        this.vakcinaciaRepository = vakcinaciaRepository;
        this.osobaVakcinaRepository = osobaVakcinaRepository;
        this.osobaRepository = osobaRepository;
        this.vakcinaRepository = vakcinaRepository;
        this.objectMapper = objectMapper;
    }

    // Create new vaccination campaign
    public VakcinaciaEntity createVakcinácia(VakcinaciaDTO dto) {
        try {
            if (dto.getOsobaId() == null) {
                throw new IllegalArgumentException("Person ID is required");
            }
            
            if (dto.getVakcinaId() == null) {
                throw new IllegalArgumentException("Vaccine ID is required");
            }
            
            OsobaEntity osoba = osobaRepository.findById(dto.getOsobaId())
                .orElseThrow(() -> new IllegalArgumentException("Person not found with ID: " + dto.getOsobaId()));
                
            Vakcina vakcina = vakcinaRepository.findById(dto.getVakcinaId())
                .orElseThrow(() -> new IllegalArgumentException("Vaccine not found with ID: " + dto.getVakcinaId()));
            
            // Create vaccination campaign
            VakcinaciaEntity vakcinácia = new VakcinaciaEntity();
            vakcinácia.setOsoba(osoba);
            vakcinácia.setVakcina(vakcina);
            vakcinácia.setDatumZaciatku(dto.getDatumZaciatku() != null ? dto.getDatumZaciatku() : LocalDate.now());
            vakcinácia.setPocetDavok(dto.getPocetDavok() > 0 ? dto.getPocetDavok() : vakcina.getPocetDavok());
            vakcinácia.setDokoncena(false);
            
            // Set intervals from DTO or vaccine
            if (dto.getIntervalyDni() != null && !dto.getIntervalyDni().isEmpty()) {
                vakcinácia.setIntervalyDni(objectMapper.writeValueAsString(dto.getIntervalyDni()));
            } /*else if (vakcina.getIntervalyDni() != null) {
                vakcinácia.setIntervalyDni(objectMapper.writeValueAsString(vakcina.getIntervalyDni()));
            }*/ else {
                vakcinácia.setIntervalyDni("[]");
            }
            
            VakcinaciaEntity savedVakcinácia = vakcinaciaRepository.save(vakcinácia);
            
            // Create first dose
            createFirstDose(savedVakcinácia);
            
            return savedVakcinácia;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing intervals: " + e.getMessage(), e);
        }
    }
    
    private void createFirstDose(VakcinaciaEntity vakcinácia) {
        OsobaVakcina dose = new OsobaVakcina();
        dose.setOsoba(vakcinácia.getOsoba());
        dose.setVakcina(vakcinácia.getVakcina());
        dose.setVakcinácia(vakcinácia);
        dose.setPoradieDavky(1);
        dose.setPlanovanyDatum(vakcinácia.getDatumZaciatku());
        
        osobaVakcinaRepository.save(dose);
    }
    
    private void createNextDose(VakcinaciaEntity vakcinácia) {
        try {
            // Find highest dose number
            List<OsobaVakcina> existingDoses = osobaVakcinaRepository.findAll().stream()
                .filter(dose -> dose.getVakcinácia() != null && dose.getVakcinácia().getId().equals(vakcinácia.getId()))
                .collect(Collectors.toList());
            int nextDoseNumber = existingDoses.stream()
                .mapToInt(OsobaVakcina::getPoradieDavky)
                .max()
                .orElse(0) + 1;
            
            if (nextDoseNumber > vakcinácia.getPocetDavok()) {
                return; // All doses created
            }
            
            // Get interval for this dose
            List<Integer> intervals = getIntervals(vakcinácia);
            int intervalDays = 21; // Default
            
            if (intervals.size() >= (nextDoseNumber - 1) && (nextDoseNumber - 1) >= 0) {
                intervalDays = intervals.get(nextDoseNumber - 2); // Adjust for zero-based index
            }
            
            // Get date of previous dose
            LocalDate previousDoseDate = existingDoses.stream()
                .filter(d -> d.getPoradieDavky() == (nextDoseNumber - 1))
                .findFirst()
                .map(d -> d.getDatumAplikacie() != null ? d.getDatumAplikacie() : d.getPlanovanyDatum())
                .orElse(vakcinácia.getDatumZaciatku());
            
            // Create next dose
            OsobaVakcina nextDose = new OsobaVakcina();
            nextDose.setOsoba(vakcinácia.getOsoba());
            nextDose.setVakcina(vakcinácia.getVakcina());
            nextDose.setVakcinácia(vakcinácia);
            nextDose.setPoradieDavky(nextDoseNumber);
            nextDose.setPlanovanyDatum(previousDoseDate.plusDays(intervalDays));
            
            osobaVakcinaRepository.save(nextDose);
        } catch (Exception e) {
            throw new RuntimeException("Error creating next dose: " + e.getMessage(), e);
        }
    }
    
    private List<Integer> getIntervals(VakcinaciaEntity vakcinácia) {
        try {
            if (vakcinácia.getIntervalyDni() == null || vakcinácia.getIntervalyDni().isEmpty()) {
                return new ArrayList<>();
            }
            
            return objectMapper.readValue(vakcinácia.getIntervalyDni(), new TypeReference<List<Integer>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing intervals: " + e.getMessage(), e);
        }
    }

    public void markDoseAsApplied(Long doseId, LocalDate actualDate) {
        OsobaVakcina dose = osobaVakcinaRepository.findById(doseId)
            .orElseThrow(() -> new IllegalArgumentException("Dose not found"));

        dose.setDatumAplikacie(actualDate);
        osobaVakcinaRepository.save(dose);

        // Check if vaccination is complete
        VakcinaciaEntity vakcinácia = dose.getVakcinácia();
        if (vakcinácia != null) {
            long appliedDoses = osobaVakcinaRepository.findAll().stream()
                .filter(ov -> ov.getVakcinácia() != null && 
                             ov.getVakcinácia().getId().equals(vakcinácia.getId()) &&
                             ov.getDatumAplikacie() != null)
                .count();

            if (appliedDoses >= vakcinácia.getPocetDavok()) {
                vakcinácia.setDokoncena(true);
                vakcinaciaRepository.save(vakcinácia);
            } else {
                // Create next dose if not complete
                createNextDose(vakcinácia);
            }
        }
    }

    public List<VakcinaciaEntity> getAllActiveVaccinations() {
        return vakcinaciaRepository.findByDokoncenaFalse();
    }

    public List<VakcinaciaEntity> getActiveVaccinationsByPerson(Long personId) {
        return vakcinaciaRepository.findActiveVaccinationsByPersonId(personId);
    }

    public Optional<VakcinaciaEntity> getVakcinaciaById(Long id) {
        return vakcinaciaRepository.findById(id);
    }

    public boolean deleteVakcinácia(Long id) {
        try {
            Optional<VakcinaciaEntity> vakcinácia = vakcinaciaRepository.findById(id);
            if (vakcinácia.isEmpty()) {
                return false;
            }

            // First delete all related doses
            List<OsobaVakcina> relatedDoses = osobaVakcinaRepository.findAll().stream()
                .filter(ov -> ov.getVakcinácia() != null && ov.getVakcinácia().getId().equals(id))
                .toList();

            for (OsobaVakcina dose : relatedDoses) {
                osobaVakcinaRepository.delete(dose);
            }

            // Then delete the vaccination campaign
            vakcinaciaRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Error deleting vaccination campaign: " + e.getMessage(), e);
        }
    }

    public VakcinaciaEntity updateVakcinácia(Long id, VakcinaciaDTO dto) {
        try {
            VakcinaciaEntity existing = vakcinaciaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vaccination campaign not found"));

            if (dto.getDatumZaciatku() != null) {
                existing.setDatumZaciatku(dto.getDatumZaciatku());
            }
            if (dto.getPocetDavok() > 0) {
                existing.setPocetDavok(dto.getPocetDavok());
            }
            if (dto.getIntervalyDni() != null && !dto.getIntervalyDni().isEmpty()) {
                existing.setIntervalyDni(objectMapper.writeValueAsString(dto.getIntervalyDni()));
            }

            return vakcinaciaRepository.save(existing);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing intervals: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Error updating vaccination campaign: " + e.getMessage(), e);
        }
    }

    public List<VakcinaciaEntity> getAllVaccinations() {
        return vakcinaciaRepository.findAll();
    }
}
