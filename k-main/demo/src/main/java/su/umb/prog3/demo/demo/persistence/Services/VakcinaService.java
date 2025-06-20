package su.umb.prog3.demo.demo.persistence.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import su.umb.prog3.demo.demo.persistence.entity.Vakcina;
import su.umb.prog3.demo.demo.persistence.repos.VakcinaRepository;
import su.umb.prog3.demo.demo.persistence.dto.VakcinaDTO;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VakcinaService {

    private static final Logger logger = LoggerFactory.getLogger(VakcinaService.class);
    private final VakcinaRepository vakcinaRepository;

    @Autowired
    public VakcinaService(VakcinaRepository vakcinaRepository) {
        this.vakcinaRepository = vakcinaRepository;
    }

    // Get all vaccines
    public List<Vakcina> getAllVakciny() {
        return vakcinaRepository.findAll();
    }

    // Get vaccine by ID
    public Optional<Vakcina> getVakcinaById(Long id) {
        return vakcinaRepository.findById(id);
    }

    // Create a new vaccine
    public Vakcina createVakcina(Vakcina vakcina) {
        try {
            logger.info("Creating vaccine: {}", vakcina);
            validateVakcina(vakcina);
            Vakcina saved = vakcinaRepository.save(vakcina);
            logger.info("Vaccine created successfully with ID: {}", saved.getId());
            return saved;
        } catch (Exception e) {
            logger.error("Error creating vaccine: ", e);
            throw new RuntimeException("Error creating vaccine: " + e.getMessage(), e);
        }
    }

    // Update an existing vaccine
    public Optional<Vakcina> updateVakcina(Long id, Vakcina vakcina) {
        try {
            logger.info("Updating vaccine ID: {} with data: {}", id, vakcina);
            Optional<Vakcina> existingVakcina = vakcinaRepository.findById(id);
            if (existingVakcina.isPresent()) {
                Vakcina existing = existingVakcina.get();
                
                // Validate input before updating
                if (vakcina.getNazov() != null && !vakcina.getNazov().trim().isEmpty()) {
                    existing.setNazov(vakcina.getNazov().trim());
                }
                if (vakcina.getTyp() != null) {
                    existing.setTyp(vakcina.getTyp());
                }
                if (vakcina.getVyrobca() != null && !vakcina.getVyrobca().trim().isEmpty()) {
                    existing.setVyrobca(vakcina.getVyrobca().trim());
                }
                if (vakcina.getPocetDavok() != null && vakcina.getPocetDavok() > 0) {
                    existing.setPocetDavok(vakcina.getPocetDavok());
                }
//                if (vakcina.getIntervalyDni() != null) {
//                    existing.setIntervalyDni(vakcina.getIntervalyDni());
//                }
                
                validateVakcina(existing);
                Vakcina updated = vakcinaRepository.save(existing);
                logger.info("Vaccine updated successfully: {}", updated);
                return Optional.of(updated);
            } else {
                logger.warn("Vaccine with ID {} not found for update", id);
                return Optional.empty();
            }
        } catch (Exception e) {
            logger.error("Error updating vaccine: ", e);
            throw new RuntimeException("Error updating vaccine: " + e.getMessage(), e);
        }
    }

    // Search vaccines by query
    public List<VakcinaDTO> searchVaccines(String query) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return getAllVakciny().stream().map(VakcinaDTO::new).collect(Collectors.toList());
            }

            String lowerQuery = query.toLowerCase();
            return getAllVakciny().stream()
                    .filter(vakcina -> {
                        if (vakcina == null) return false;
                        boolean nazovMatch = vakcina.getNazov() != null && 
                                           vakcina.getNazov().toLowerCase().contains(lowerQuery);
                        boolean vyrobcaMatch = vakcina.getVyrobca() != null && 
                                             vakcina.getVyrobca().toLowerCase().contains(lowerQuery);
                        boolean typMatch = vakcina.getTyp() != null && 
                                         vakcina.getTyp().toString().toLowerCase().contains(lowerQuery);
                        return nazovMatch || vyrobcaMatch || typMatch;
                    })
                    .map(VakcinaDTO::new)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error searching vaccines: ", e);
            return new ArrayList<>();
        }
    }

    // Enhanced delete with relationship check
    public boolean deleteVakcina(Long id) {
        try {
            logger.info("Attempting to delete vaccine ID: {}", id);
            if (!vakcinaRepository.existsById(id)) {
                logger.warn("Vaccine with ID {} not found for deletion", id);
                return false;
            }
            
            // Check if vaccine is used in any vaccination records
            try {
                long vaccinationCount = vakcinaRepository.countVaccinationsByVaccineId(id);
                long campaignCount = vakcinaRepository.countVaccinationCampaignsByVaccineId(id);
                
                if (vaccinationCount > 0 || campaignCount > 0) {
                    throw new IllegalStateException("Cannot delete vaccine - it is being used in vaccination records or campaigns");
                }
            } catch (Exception e) {
                logger.warn("Could not check vaccine relationships: {}", e.getMessage());
            }
            
            vakcinaRepository.deleteById(id);
            logger.info("Vaccine with ID {} deleted successfully", id);
            return true;
        } catch (Exception e) {
            logger.error("Error deleting vaccine: ", e);
            throw new RuntimeException("Error deleting vaccine: " + e.getMessage(), e);
        }
    }

    // Validate vaccine before save or update
    private void validateVakcina(Vakcina vakcina) {
        if (vakcina == null) {
            throw new IllegalArgumentException("Vaccine data cannot be null");
        }
        if (vakcina.getNazov() == null || vakcina.getNazov().trim().isEmpty()) {
            throw new IllegalArgumentException("Vaccine name is required");
        }
        if (vakcina.getTyp() == null) {
            throw new IllegalArgumentException("Vaccine type is required");
        }
        if (vakcina.getVyrobca() == null || vakcina.getVyrobca().trim().isEmpty()) {
            throw new IllegalArgumentException("Manufacturer is required");
        }
        if (vakcina.getPocetDavok() == null || vakcina.getPocetDavok() <= 0) {
            throw new IllegalArgumentException("Number of doses must be greater than 0");
        }
        // Check intervals if more than one dose
        if (vakcina.getPocetDavok() > 1) {
//            if (vakcina.getIntervalyDni() == null) {
//                throw new IllegalArgumentException("IntervalyDni is required");
//            }
//            List<Integer> intervals = vakcina.getIntervalyDni();
//            if (intervals.isEmpty()) {
//                throw new IllegalArgumentException("IntervalyDni cannot be empty");
//            }
//            for (Integer interval : intervals) {
//                if (interval == null || interval <= 0) {
//                    throw new IllegalArgumentException("Interval days must be greater than 0");
//                }
//            }
        }
    }
}