package su.umb.prog3.demo.demo.persistence.Services;

import org.springframework.stereotype.Service;
import su.umb.prog3.demo.demo.persistence.dto.OsobaVakcinaDTO;
import su.umb.prog3.demo.demo.persistence.entity.OsobaEntity;
import su.umb.prog3.demo.demo.persistence.entity.Vakcina;
import su.umb.prog3.demo.demo.persistence.repos.OsobaRepository;
import su.umb.prog3.demo.demo.persistence.repos.VakcinaRepository;
import su.umb.prog3.demo.demo.persistence.repos.OsobaVakcinaRepository;
import su.umb.prog3.demo.demo.persistence.entity.OsobaVakcina;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Comparator;
import java.time.LocalDate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.ArrayList;

@Service
public class OsobaVakcinaService {

    private static final Logger logger = LoggerFactory.getLogger(OsobaVakcinaService.class);
    
    private final OsobaVakcinaRepository osobaVakcinaRepository;
    private final OsobaRepository osobaRepository;
    private final VakcinaRepository vakcinaRepository;
    private final OsobaService osobaService;
    private final VakcinaService vakcinaService;

    public OsobaVakcinaService(
        OsobaVakcinaRepository osobaVakcinaRepository,
        OsobaRepository osobaRepository,
        VakcinaRepository vakcinaRepository,
        OsobaService osobaService,
        VakcinaService vakcinaService
    ) {
        this.osobaVakcinaRepository = osobaVakcinaRepository;
        this.osobaRepository = osobaRepository;
        this.vakcinaRepository = vakcinaRepository;
        this.osobaService = osobaService;
        this.vakcinaService = vakcinaService;
    }

    public List<OsobaVakcina> getAllOsobaVakcina() {
        return osobaVakcinaRepository.findAll();
    }

    public Optional<OsobaVakcina> getOsobaVakcinaById(Long id) {
        return osobaVakcinaRepository.findById(id);
    }

    public OsobaVakcina createOsobaVakcina(OsobaVakcina osobaVakcina) {
        try {
            validateOsobaVakcina(osobaVakcina);
            return osobaVakcinaRepository.save(osobaVakcina);
        } catch (Exception e) {
            throw new RuntimeException("Error creating vaccination record: " + e.getMessage(), e);
        }
    }

    public OsobaVakcina createOsobaVakcinaFromDto(OsobaVakcinaDTO dto) {
        try {
            if (dto.getOsobaId() == null) {
                throw new IllegalArgumentException("Person ID is required");
            }
            if (dto.getVakcinaId() == null) {
                throw new IllegalArgumentException("Vaccine ID is required");
            }
            if (dto.getDatumAplikacie() == null) {
                throw new IllegalArgumentException("Application date is required");
            }

            OsobaEntity osoba = osobaRepository.findById(dto.getOsobaId())
                .orElseThrow(() -> new IllegalArgumentException("Person with ID " + dto.getOsobaId() + " not found"));

            Vakcina vakcina = vakcinaRepository.findById(dto.getVakcinaId())
                .orElseThrow(() -> new IllegalArgumentException("Vaccine with ID " + dto.getVakcinaId() + " not found"));

            OsobaVakcina ov = new OsobaVakcina();
            ov.setOsoba(osoba);
            ov.setVakcina(vakcina);
            ov.setDatumAplikacie(dto.getDatumAplikacie());
            ov.setPoradieDavky(dto.getPoradieDavky() != null && dto.getPoradieDavky() > 0 ? dto.getPoradieDavky() : 1);

            return osobaVakcinaRepository.save(ov);
        } catch (Exception e) {
            throw new RuntimeException("Error creating vaccination record from DTO: " + e.getMessage(), e);
        }
    }

    public List<OsobaVakcinaDTO> searchWithFilters(String query, LocalDate dateFrom, LocalDate dateTo) {
        List<OsobaVakcina> allRecords = osobaVakcinaRepository.findAll();
        
        return allRecords.stream()
            .filter(ov -> {
                // Text search filter
                if (query != null && !query.trim().isEmpty()) {
                    String lowerQuery = query.toLowerCase();
                    String fullName = (ov.getOsoba().getMeno() + " " + ov.getOsoba().getPriezvisko()).toLowerCase();
                    String vaccineName = ov.getVakcina().getNazov().toLowerCase();
                    
                    if (!fullName.contains(lowerQuery) && !vaccineName.contains(lowerQuery)) {
                        return false;
                    }
                }
                
                // Date range filter
                if (dateFrom != null && ov.getDatumAplikacie() != null && ov.getDatumAplikacie().isBefore(dateFrom)) {
                    return false;
                }
                if (dateTo != null && ov.getDatumAplikacie() != null && ov.getDatumAplikacie().isAfter(dateTo)) {
                    return false;
                }
                
                return true;
            })
            .map(OsobaVakcinaDTO::new)
            .collect(Collectors.toList());
    }

    public OsobaVakcina addSmartVaccination(OsobaVakcinaDTO dto) {
        try {
            if (dto.getOsobaId() == null || dto.getVakcinaId() == null) {
                throw new IllegalArgumentException("Person ID and Vaccine ID are required");
            }
            
            if (dto.getDatumAplikacie() == null) {
                throw new IllegalArgumentException("Application date is required");
            }
            
            OsobaEntity osoba = osobaRepository.findById(dto.getOsobaId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid osobaId: " + dto.getOsobaId()));

            Vakcina vakcina = vakcinaRepository.findById(dto.getVakcinaId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid vakcinaId: " + dto.getVakcinaId()));

            // Check if person already has this vaccine
            List<OsobaVakcina> existingRecords = getByPersonAndVaccine(dto.getOsobaId(), dto.getVakcinaId());
            
            OsobaVakcina newRecord = new OsobaVakcina();
            newRecord.setOsoba(osoba);
            newRecord.setVakcina(vakcina);
            newRecord.setDatumAplikacie(dto.getDatumAplikacie());
            
            if (!existingRecords.isEmpty()) {
                // Find the highest dose number and add 1
                int nextDoseNumber = existingRecords.stream()
                    .mapToInt(OsobaVakcina::getPoradieDavky)
                    .max()
                    .orElse(0) + 1;
                newRecord.setPoradieDavky(nextDoseNumber);
                
                logger.info("Adding dose {} for person {} and vaccine {}", nextDoseNumber, dto.getOsobaId(), dto.getVakcinaId());
            } else {
                // First dose
                newRecord.setPoradieDavky(dto.getPoradieDavky() != null && dto.getPoradieDavky() > 0 ? dto.getPoradieDavky() : 1);
                logger.info("Adding first dose for person {} and vaccine {}", dto.getOsobaId(), dto.getVakcinaId());
            }
            
            return osobaVakcinaRepository.save(newRecord);
        } catch (Exception e) {
            throw new RuntimeException("Error adding smart vaccination: " + e.getMessage(), e);
        }
    }
    
    public List<OsobaVakcina> getByPersonAndVaccine(Long personId, Long vaccineId) {
        try {
            return osobaVakcinaRepository.findAll().stream()
                .filter(ov -> ov.getOsoba().getId().equals(personId) && 
                             ov.getVakcina().getId().equals(vaccineId))
                .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error getting vaccinations by person and vaccine: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Updates an existing OsobaVakcina entity
     * 
     * @param id The ID of the entity to update
     * @param osobaVakcina The updated entity
     * @return The updated entity
     */
    public Optional<OsobaVakcina> updateOsobaVakcina(Long id, OsobaVakcina osobaVakcina) {
        if (!osobaVakcinaRepository.existsById(id)) {
            throw new EntityNotFoundException("OsobaVakcina with ID " + id + " not found");
        }
        osobaVakcina.setId(id); // Oprava: nastav ID pred uložením
        return Optional.of(osobaVakcinaRepository.save(osobaVakcina));
    }

    /**
     * Updates an existing OsobaVakcina entity from DTO
     * 
     * @param id The ID of the entity to update
     * @param osobaVakcinaDTO The DTO containing updated data
     * @return The updated entity
     */
    public Optional<OsobaVakcina> updateOsobaVakcinaFromDto(Long id, OsobaVakcinaDTO osobaVakcinaDTO) {
        Optional<OsobaVakcina> existingOsobaVakcinaOpt = getOsobaVakcinaById(id);
        
        if (!existingOsobaVakcinaOpt.isPresent()) {
            throw new EntityNotFoundException("OsobaVakcina with ID " + id + " not found");
        }
        
        OsobaVakcina existingOsobaVakcina = existingOsobaVakcinaOpt.get();
        
        // Update fields from DTO
        if (osobaVakcinaDTO.getOsobaId() != null) {
            Optional<OsobaEntity> osoba = osobaService.getOsobaById(osobaVakcinaDTO.getOsobaId());
            if (osoba.isPresent()) {
                existingOsobaVakcina.setOsoba(osoba.get());
            }
        }
        
        if (osobaVakcinaDTO.getVakcinaId() != null) {
            Optional<Vakcina> vakcina = vakcinaService.getVakcinaById(osobaVakcinaDTO.getVakcinaId());
            if (vakcina.isPresent()) {
                existingOsobaVakcina.setVakcina(vakcina.get());
            }
        }
        
        if (osobaVakcinaDTO.getDatumAplikacie() != null) {
            existingOsobaVakcina.setDatumAplikacie(osobaVakcinaDTO.getDatumAplikacie());
        }
        
        return Optional.of(osobaVakcinaRepository.save(existingOsobaVakcina));
    }

    /**
     * Deletes an OsobaVakcina entity by ID
     * 
     * @param id The ID of the entity to delete
     * @return true if deleted, false if not found
     */
    public boolean deleteOsobaVakcina(Long id) {
        if (!osobaVakcinaRepository.existsById(id)) {
            return false;
        }
        osobaVakcinaRepository.deleteById(id);
        return true;
    }

    private void validateOsobaVakcina(OsobaVakcina osobaVakcina) {
        if (osobaVakcina == null) {
            throw new IllegalArgumentException("Vaccination record cannot be null");
        }
        if (osobaVakcina.getOsoba() == null) {
            throw new IllegalArgumentException("Person is required");
        }
        if (osobaVakcina.getVakcina() == null) {
            throw new IllegalArgumentException("Vaccine is required");
        }
        if (osobaVakcina.getDatumAplikacie() == null) {
            throw new IllegalArgumentException("Application date is required");
        }
        if (osobaVakcina.getPoradieDavky() <= 0) {
            throw new IllegalArgumentException("Dose number must be positive");
        }
    }
}
