package su.umb.prog3.demo.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import su.umb.prog3.demo.demo.persistence.Services.VakcinaciaService;
import su.umb.prog3.demo.demo.persistence.dto.VakcinaciaDTO;
import su.umb.prog3.demo.demo.persistence.entity.VakcinaciaEntity;
import su.umb.prog3.demo.demo.persistence.dto.VakcinaciaResponseDTO;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/vaccination")
@CrossOrigin(origins = "http://localhost:4200")
public class VakcinaciaController {

    private final VakcinaciaService vakcinaciaService;

    public VakcinaciaController(VakcinaciaService vakcinaciaService) {
        this.vakcinaciaService = vakcinaciaService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createVakcinácia(@RequestBody VakcinaciaDTO dto) {
        try {
            System.out.println("Creating vaccination campaign: " + dto);
            System.out.println("Current authentication: " + org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication());
            
            // Add basic validation
            if (dto.getOsobaId() == null || dto.getVakcinaId() == null) {
                return ResponseEntity.badRequest().body("Person ID and Vaccine ID are required");
            }
            
            VakcinaciaEntity created = vakcinaciaService.createVakcinácia(dto);
            return ResponseEntity.ok(VakcinaciaResponseDTO.fromEntity(created));
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Validation error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error creating vaccination campaign: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating vaccination campaign: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<VakcinaciaEntity>> getAllVaccinations() {
        try {
            return ResponseEntity.ok(vakcinaciaService.getAllVaccinations());
        } catch (Exception e) {
            System.err.println("Error getting all vaccinations: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<VakcinaciaEntity>> getActiveVaccinations() {
        try {
            return ResponseEntity.ok(vakcinaciaService.getAllActiveVaccinations());
        } catch (Exception e) {
            System.err.println("Error getting active vaccinations: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVakcinaciaById(@PathVariable Long id) {
        try {
            return vakcinaciaService.getVakcinaciaById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error getting vaccination by ID: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVakcinácia(@PathVariable Long id, @RequestBody VakcinaciaDTO dto) {
        try {
            System.out.println("Updating vaccination campaign ID: " + id + " with data: " + dto);
            VakcinaciaEntity updated = vakcinaciaService.updateVakcinácia(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Validation error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error updating vaccination campaign: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error updating vaccination campaign: " + e.getMessage());
        }
    }

    @GetMapping("/person/{personId}")
    public ResponseEntity<List<VakcinaciaEntity>> getVaccinationsByPerson(@PathVariable Long personId) {
        try {
            return ResponseEntity.ok(vakcinaciaService.getActiveVaccinationsByPerson(personId));
        } catch (Exception e) {
            System.err.println("Error getting vaccinations by person: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/dose/{doseId}/apply")
    public ResponseEntity<?> applyDose(@PathVariable Long doseId, @RequestParam LocalDate actualDate) {
        try {
            vakcinaciaService.markDoseAsApplied(doseId, actualDate);
            return ResponseEntity.ok("Dose applied successfully");
        } catch (Exception e) {
            System.err.println("Error applying dose: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error applying dose: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVakcinácia(@PathVariable Long id) {
        try {
            System.out.println("Attempting to delete vaccination campaign ID: " + id);
            if (vakcinaciaService.deleteVakcinácia(id)) {
                return ResponseEntity.ok("Vaccination campaign deleted successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error deleting vaccination campaign: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error deleting vaccination campaign: " + e.getMessage());
        }
    }
}
