package su.umb.prog3.demo.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import su.umb.prog3.demo.demo.persistence.entity.Vakcina;
import su.umb.prog3.demo.demo.persistence.Services.VakcinaService;
import su.umb.prog3.demo.demo.persistence.dto.VakcinaDTO;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vakcina")
@CrossOrigin(origins = "http://localhost:4200")
public class VakcinaController {

    private final VakcinaService vakcinaService;

    public VakcinaController(VakcinaService vakcinaService) {
        this.vakcinaService = vakcinaService;
    }

    // Get all vaccines
    @GetMapping("/all")
    public ResponseEntity<List<VakcinaDTO>> getAllVakciny() {
        try {
            List<VakcinaDTO> dtos = vakcinaService.getAllVakciny().stream()
                .map(VakcinaDTO::new)
                .toList();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            System.err.println("Error getting vaccines: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get vaccine by ID
    @GetMapping("/{id}")
    public ResponseEntity<Vakcina> getVakcinaById(@PathVariable Long id) {
        return vakcinaService.getVakcinaById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new vaccine
    @PostMapping("/add")
    public ResponseEntity<?> createVakcina(@RequestBody Vakcina vakcina) {
        try {
            System.out.println("Received vaccine request: " + vakcina);
            
            if (vakcina == null) {
                return ResponseEntity.badRequest().body("Vaccine data is required");
            }
            
            Vakcina savedVakcina = vakcinaService.createVakcina(vakcina);
            System.out.println("Vaccine created successfully: " + savedVakcina);
            return ResponseEntity.ok(savedVakcina);
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Error creating vaccine: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    // Update an existing vaccine
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateVakcina(@PathVariable Long id, @RequestBody Vakcina vakcina) {
        try {
            System.out.println("Updating vaccine ID: " + id + " with data: " + vakcina);
            
            if (id == null) {
                return ResponseEntity.badRequest().body("Vaccine ID is required");
            }
            if (vakcina == null) {
                return ResponseEntity.badRequest().body("Vaccine data is required");
            }
            
            Optional<Vakcina> updated = vakcinaService.updateVakcina(id, vakcina);
            if (updated.isPresent()) {
                System.out.println("Vaccine updated successfully: " + updated.get());
                return ResponseEntity.ok(updated.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Error updating vaccine: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    // Delete vaccine by ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteVakcina(@PathVariable Long id) {
        try {
            System.out.println("Attempting to delete vaccine ID: " + id);
            
            if (id == null) {
                return ResponseEntity.badRequest().body("Vaccine ID is required");
            }
            
            if (vakcinaService.deleteVakcina(id)) {
                return ResponseEntity.ok("Vaccine deleted successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalStateException e) {
            System.err.println("Cannot delete vaccine: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Error deleting vaccine: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    // Search vaccines
    @GetMapping("/search")
    public ResponseEntity<List<VakcinaDTO>> searchVaccines(@RequestParam String query) {
        List<VakcinaDTO> results = vakcinaService.searchVaccines(query);
        return ResponseEntity.ok(results);
    }
}
