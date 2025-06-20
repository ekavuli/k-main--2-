package su.umb.prog3.demo.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import su.umb.prog3.demo.demo.persistence.Services.NotificationService;
import su.umb.prog3.demo.demo.persistence.dto.NotifikaciaDTO;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/priority")
    public ResponseEntity<List<NotifikaciaDTO>> getPriorityNotifications() {
        try {
            List<NotifikaciaDTO> notifications = notificationService.getPriorityNotifications();
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error getting priority notifications: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<NotifikaciaDTO>> getOverdueDoses() {
        try {
            List<NotifikaciaDTO> notifications = notificationService.getOverdueDoses();
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error getting overdue doses: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<NotifikaciaDTO>> getUpcomingDoses() {
        try {
            List<NotifikaciaDTO> notifications = notificationService.getUpcomingDoses();
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error getting upcoming doses: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<NotifikaciaDTO>> getAllNotifications() {
        try {
            List<NotifikaciaDTO> notifications = notificationService.getAllNotifications();
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error getting all notifications: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/mark-contacted/{doseId}")
    public ResponseEntity<String> markAsContacted(@PathVariable Long doseId) {
        try {
            notificationService.markAsContacted(doseId);
            return ResponseEntity.ok("Marked as contacted");
        } catch (Exception e) {
            System.err.println("Error marking as contacted: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
