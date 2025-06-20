package su.umb.prog3.demo.demo.controllers;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import su.umb.prog3.demo.demo.persistence.entity.OsobaVakcina;
import su.umb.prog3.demo.demo.persistence.Services.OsobaVakcinaService;
import su.umb.prog3.demo.demo.persistence.dto.OsobaVakcinaDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/osobavakcina")
@CrossOrigin(origins = "http://localhost:4200")
public class OsobaVakcinaController {

    private final OsobaVakcinaService osobaVakcinaService;

    public OsobaVakcinaController(OsobaVakcinaService osobaVakcinaService) {
        this.osobaVakcinaService = osobaVakcinaService;
    }

    // Get all osoba_vakcina records
    @GetMapping
    public ResponseEntity<List<OsobaVakcinaDTO>> getAllOsobaVakcina() {
        try {
            List<OsobaVakcinaDTO> dtos = osobaVakcinaService.getAllOsobaVakcina().stream()
                    .map(OsobaVakcinaDTO::new)
                    .toList();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            System.err.println("Error getting all vaccinations: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get osoba_vakcina by ID
    @GetMapping("/{id}")
    public ResponseEntity<OsobaVakcina> getOsobaVakcinaById(@PathVariable Long id) {
        return osobaVakcinaService.getOsobaVakcinaById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new osoba_vakcina record
    @PostMapping("/add")
    public ResponseEntity<?> createOsobaVakcina(@RequestBody OsobaVakcinaDTO dto) {
        try {
            System.out.println("Admin adding vaccination - Auth: " + org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication());
            
            if (dto == null) {
                return ResponseEntity.badRequest().body("Vaccination data is required");
            }
            
            System.out.println("Received DTO: " + dto);
            
            // Add validation
            if (dto.getOsobaId() == null || dto.getVakcinaId() == null) {
                return ResponseEntity.badRequest().body("Person ID and Vaccine ID are required");
            }
            
            if (dto.getDatumAplikacie() == null) {
                return ResponseEntity.badRequest().body("Application date is required");
            }
            
            OsobaVakcina saved = osobaVakcinaService.createOsobaVakcinaFromDto(dto);
            System.out.println("Saved vaccination: " + saved);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Validation error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error creating vaccination: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error creating vaccination: " + e.getMessage());
        }
    }

    // Add smart vaccination (handles existing records)
    @PostMapping("/add-smart")
    public ResponseEntity<?> addSmartVaccination(@RequestBody OsobaVakcinaDTO dto) {
        try {
            System.out.println("Smart vaccination DTO: " + dto);
            
            // Add validation
            if (dto.getOsobaId() == null || dto.getVakcinaId() == null) {
                return ResponseEntity.badRequest().body("{\"error\":\"Person ID and Vaccine ID are required\"}");
            }
            
            if (dto.getDatumAplikacie() == null) {
                return ResponseEntity.badRequest().body("{\"error\":\"Application date is required\"}");
            }
            
            OsobaVakcina result = osobaVakcinaService.addSmartVaccination(dto);
            System.out.println("Smart vaccination result: " + result);
            return ResponseEntity.ok(new OsobaVakcinaDTO(result));
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body("{\"error\":\"Validation error: " + e.getMessage() + "\"}");
        } catch (Exception e) {
            System.err.println("Error in smart vaccination: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("{\"error\":\"Error in smart vaccination: " + e.getMessage() + "\"}");
        }
    }

    // Update an existing osoba_vakcina record
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOsobaVakcina(@PathVariable Long id, @RequestBody OsobaVakcina osobaVakcina) {
        try {
            Optional<OsobaVakcina> updated = osobaVakcinaService.updateOsobaVakcina(id, osobaVakcina);
            if (updated.isPresent()) {
                return ResponseEntity.ok(updated.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error updating vaccination: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error updating vaccination: " + e.getMessage());
        }
    }

    // Update vaccination record
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateOsobaVakcinaFromDto(@PathVariable Long id, @RequestBody OsobaVakcinaDTO dto) {
        try {
            System.out.println("Updating vaccination record ID: " + id + " with DTO: " + dto);
            
            Optional<OsobaVakcina> updated = osobaVakcinaService.updateOsobaVakcinaFromDto(id, dto);
            if (updated.isPresent()) {
                return ResponseEntity.ok(new OsobaVakcinaDTO(updated.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Validation error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error updating vaccination: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error updating vaccination: " + e.getMessage());
        }
    }

    // Delete osoba_vakcina by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOsobaVakcina(@PathVariable Long id) {
        try {
            System.out.println("Attempting to delete vaccination record ID: " + id);
            
            if (osobaVakcinaService.deleteOsobaVakcina(id)) {
                return ResponseEntity.ok(java.util.Collections.singletonMap("success", true));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error deleting vaccination: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error deleting vaccination: " + e.getMessage());
        }
    }

    // Enhanced search with date filtering
    @GetMapping("/search")
    public ResponseEntity<List<OsobaVakcinaDTO>> searchOsobaVakcina(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        
        try {
            List<OsobaVakcinaDTO> results = osobaVakcinaService.searchWithFilters(query, dateFrom, dateTo);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("Error searching vaccinations: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get by person and vaccine
    @GetMapping("/person/{personId}/vaccine/{vaccineId}")
    public ResponseEntity<List<OsobaVakcina>> getByPersonAndVaccine(
            @PathVariable Long personId, @PathVariable Long vaccineId) {
        try {
            List<OsobaVakcina> records = osobaVakcinaService.getByPersonAndVaccine(personId, vaccineId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            System.err.println("Error getting records by person and vaccine: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}