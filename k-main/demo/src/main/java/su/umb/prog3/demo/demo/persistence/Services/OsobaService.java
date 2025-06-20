package su.umb.prog3.demo.demo.persistence.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import su.umb.prog3.demo.demo.persistence.entity.OsobaEntity;
import su.umb.prog3.demo.demo.persistence.entity.OsobaVakcina;
import su.umb.prog3.demo.demo.persistence.entity.Vakcina;
import su.umb.prog3.demo.demo.persistence.repos.OsobaRepository;
import su.umb.prog3.demo.demo.persistence.repos.OsobaVakcinaRepository;
import su.umb.prog3.demo.demo.persistence.repos.VakcinaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OsobaService {

    private static final Logger logger = LoggerFactory.getLogger(OsobaService.class);
    private final OsobaRepository osobaRepository;
    private final VakcinaRepository vakcinaRepository;
    private final OsobaVakcinaRepository osobaVakcinaRepository;

    @Autowired
    public OsobaService(OsobaRepository osobaRepository, VakcinaRepository vakcinaRepository, OsobaVakcinaRepository osobaVakcinaRepository) {
        this.osobaRepository = osobaRepository;
        this.vakcinaRepository = vakcinaRepository;
        this.osobaVakcinaRepository = osobaVakcinaRepository;
    }

    // Create Person
    public OsobaEntity createOsoba(OsobaEntity osoba) {
        try {
            logger.info("Creating person: {}", osoba);
            if (osoba == null) {
                throw new IllegalArgumentException("Person data cannot be null");
            }
            if (osoba.getMeno() == null || osoba.getMeno().trim().isEmpty()) {
                throw new IllegalArgumentException("First name is required");
            }
            if (osoba.getPriezvisko() == null || osoba.getPriezvisko().trim().isEmpty()) {
                throw new IllegalArgumentException("Last name is required");
            }
            // Oprava: validácia na LocalDate datumNarodenia
            if (osoba.getDatumNarodenia() == null) {
                throw new IllegalArgumentException("Date of birth is required");
            }
            
            OsobaEntity saved = osobaRepository.save(osoba);
            logger.info("Person created successfully with ID: {}", saved.getId());
            return saved;
        } catch (Exception e) {
            logger.error("Error creating person: ", e);
            throw new RuntimeException("Error creating person: " + e.getMessage(), e);
        }
    }

    // Get Person by ID
    public Optional<OsobaEntity> getOsobaById(Long id) {
        return osobaRepository.findById(id);
    }

    // Update Person
    public Optional<OsobaEntity> updateOsoba(Long id, OsobaEntity osoba) {
        try {
            logger.info("Updating person ID: {} with data: {}", id, osoba);
            if (osobaRepository.existsById(id)) {
                osoba.setId(id);
                OsobaEntity updated = osobaRepository.save(osoba);
                logger.info("Person updated successfully: {}", updated);
                return Optional.of(updated);
            }
            logger.warn("Person with ID {} not found for update", id);
            return Optional.empty();
        } catch (Exception e) {
            logger.error("Error updating person: ", e);
            throw new RuntimeException("Error updating person: " + e.getMessage(), e);
        }
    }

    // Remove Person
    public boolean removeOsoba(Long id) {
        try {
            logger.info("Attempting to delete person ID: {}", id);
            if (osobaRepository.existsById(id)) {
                osobaRepository.deleteById(id);
                logger.info("Person with ID {} deleted successfully", id);
                return true;
            }
            logger.warn("Person with ID {} not found for deletion", id);
            return false;
        } catch (Exception e) {
            logger.error("Error deleting person: ", e);
            throw new RuntimeException("Error deleting person: " + e.getMessage(), e);
        }
    }

    // Get all Persons
    public List<OsobaEntity> getAllOsoby() {
        List<OsobaEntity> osoby = new ArrayList<>();
        osobaRepository.findAll().forEach(osoby::add);
        return osoby;
    }

    // Add Vaccination Record (updated to use consistent method names)
    public OsobaVakcina addVakcinaToOsoba(Long osobaId, Long vakcinaId, LocalDate datumAplikacie, int poradieDavky) {
        OsobaEntity osoba = osobaRepository.findById(osobaId)
            .orElseThrow(() -> new IllegalArgumentException("Person not found"));
        
        Vakcina vakcina = vakcinaRepository.findById(vakcinaId)
            .orElseThrow(() -> new IllegalArgumentException("Vaccine not found"));
        
        OsobaVakcina osobaVakcina = new OsobaVakcina();
        osobaVakcina.setOsoba(osoba);
        osobaVakcina.setVakcina(vakcina);
        osobaVakcina.setDatumAplikacie(datumAplikacie);
        osobaVakcina.setPoradieDavky(poradieDavky);
        
        return osobaVakcinaRepository.save(osobaVakcina);
    }
    
    // Remove Vaccination Record
    public void removeVakcinaFromOsoba(Long id) {
        if (!osobaVakcinaRepository.existsById(id)) {
            throw new IllegalArgumentException("Vaccination record not found");
        }
        osobaVakcinaRepository.deleteById(id);
    }
    
    // Search Persons
    public List<OsobaEntity> searchPersons(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllOsoby();
        }
        
        String lowerQuery = query.toLowerCase();
        return getAllOsoby().stream()
            .filter(osoba -> {
                String fullName = (osoba.getMeno() + " " + osoba.getPriezvisko()).toLowerCase();
                return fullName.contains(lowerQuery) || 
                       osoba.getMeno().toLowerCase().contains(lowerQuery) ||
                       osoba.getPriezvisko().toLowerCase().contains(lowerQuery);
            })
            .collect(Collectors.toList());
    }
}