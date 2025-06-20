package su.umb.prog3.demo.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import su.umb.prog3.demo.demo.persistence.entity.OsobaEntity;
import su.umb.prog3.demo.demo.persistence.entity.OsobaVakcina;
import su.umb.prog3.demo.demo.persistence.Services.OsobaService;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/osoby")
@CrossOrigin(origins = "http://localhost:4200")
public class OsobaController {

    private final OsobaService osobaService;

    @Autowired
    public OsobaController(OsobaService osobaService) {
        this.osobaService = osobaService;
    }

    // Get all persons
    @GetMapping("/all")
    public ResponseEntity<List<OsobaEntity>> getAllOsoby() {
        try {
            List<OsobaEntity> osoby = osobaService.getAllOsoby();
            return ResponseEntity.ok(osoby);
        } catch (Exception e) {
            System.err.println("Error getting all persons: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get person by ID
    @GetMapping("/{id}")
    public ResponseEntity<OsobaEntity> getOsobaById(@PathVariable Long id) {
        return osobaService.getOsobaById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new person
    @PostMapping("/add")
    public ResponseEntity<?> createOsoba(@RequestBody OsobaEntity osoba) {
        try {
            System.out.println("Creating person: " + osoba);
            
            if (osoba == null) {
                return ResponseEntity.badRequest().body("Person data is required");
            }
            
            OsobaEntity savedOsoba = osobaService.createOsoba(osoba);
            System.out.println("Person created successfully: " + savedOsoba);
            return ResponseEntity.ok(savedOsoba);
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Error creating person: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    // Update an existing person
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateOsoba(@PathVariable Long id, @RequestBody OsobaEntity osoba) {
        try {
            System.out.println("Updating person ID: " + id + " with data: " + osoba);
            
            if (id == null) {
                return ResponseEntity.badRequest().body("Person ID is required");
            }
            if (osoba == null) {
                return ResponseEntity.badRequest().body("Person data is required");
            }
            
            Optional<OsobaEntity> updated = osobaService.updateOsoba(id, osoba);
            if (updated.isPresent()) {
                System.out.println("Person updated successfully: " + updated.get());
                return ResponseEntity.ok(updated.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Error updating person: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    // Delete person by ID
    @DeleteMapping("/remove/{id}")
    public ResponseEntity<?> deleteOsoba(@PathVariable Long id) {
        try {
            System.out.println("Attempting to delete person ID: " + id);
            
            if (id == null) {
                return ResponseEntity.badRequest().body("Person ID is required");
            }
            
            if (osobaService.removeOsoba(id)) {
                return ResponseEntity.ok("Person deleted successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error deleting person: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    // Search persons
    @GetMapping("/search")
    public ResponseEntity<List<OsobaEntity>> searchPersons(@RequestParam String query) {
        try {
            List<OsobaEntity> results = osobaService.searchPersons(query);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("Error searching persons: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/vakcina/add")
    public ResponseEntity<?> addVakcinaToOsoba(
            @RequestParam Long osobaId,
            @RequestParam Long vakcinaId,
            @RequestParam LocalDate datumAplikacie,
            @RequestParam int poradieDavky) {
        try {
            OsobaVakcina result = osobaService.addVakcinaToOsoba(osobaId, vakcinaId, datumAplikacie, poradieDavky);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Validation error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error adding vaccination: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error adding vaccination: " + e.getMessage());
        }
    }

    @DeleteMapping("/vakcina/remove/{id}")
    public ResponseEntity<?> removeVakcinaFromOsoba(@PathVariable Long id) {
        try {
            osobaService.removeVakcinaFromOsoba(id);
            return ResponseEntity.ok("Vaccination record removed successfully");
        } catch (Exception e) {
            System.err.println("Error removing vaccination: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error removing vaccination: " + e.getMessage());
        }
    }
}
