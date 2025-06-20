package su.umb.prog3.demo.demo.persistence.Services;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import su.umb.prog3.demo.demo.persistence.dto.NotifikaciaDTO;
import su.umb.prog3.demo.demo.persistence.entity.OsobaVakcina;
import su.umb.prog3.demo.demo.persistence.repos.OsobaVakcinaRepository;
import su.umb.prog3.demo.demo.persistence.repos.VakcinaciaRepository;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final OsobaVakcinaRepository osobaVakcinaRepository;
    private final VakcinaciaRepository vakcinaciaRepository;

    public NotificationService(OsobaVakcinaRepository osobaVakcinaRepository, VakcinaciaRepository vakcinaciaRepository) {
        this.osobaVakcinaRepository = osobaVakcinaRepository;
        this.vakcinaciaRepository = vakcinaciaRepository;
    }

    public List<NotifikaciaDTO> getOverdueDoses() {
        LocalDate today = LocalDate.now();

        return osobaVakcinaRepository.findAll().stream()
            .filter(ov -> ov.getDatumAplikacie() == null) // Not yet applied
            .filter(ov -> ov.getPlanovanyDatum() != null) // Has planned date
            .filter(ov -> ov.getPlanovanyDatum().isBefore(today)) // Overdue
            .map(ov -> {
                int daysOverdue = (int) ChronoUnit.DAYS.between(ov.getPlanovanyDatum(), today);
                return new NotifikaciaDTO(
                    ov.getOsoba().getId(),
                    ov.getOsoba().getMeno(),
                    ov.getOsoba().getPriezvisko(),
                    ov.getVakcina().getNazov(),
                    ov.getPlanovanyDatum(),
                    ov.getPoradieDavky(),
                    -daysOverdue // Negative for overdue
                );
            })
            .sorted((a, b) -> a.getDniDoAplikacie().compareTo(b.getDniDoAplikacie())) // Most overdue first
            .collect(Collectors.toList());
    }

    public List<NotifikaciaDTO> getUpcomingDoses() {
        LocalDate today = LocalDate.now();
        LocalDate nextWeek = today.plusDays(7);

        return osobaVakcinaRepository.findAll().stream()
            .filter(ov -> ov.getDatumAplikacie() == null) // Not yet applied
            .filter(ov -> ov.getPlanovanyDatum() != null) // Has planned date
            .filter(ov -> !ov.getPlanovanyDatum().isBefore(today)) // Not overdue
            .filter(ov -> ov.getPlanovanyDatum().isBefore(nextWeek) || ov.getPlanovanyDatum().isEqual(nextWeek)) // Within next week
            .map(ov -> {
                int daysUntil = (int) ChronoUnit.DAYS.between(today, ov.getPlanovanyDatum());
                return new NotifikaciaDTO(
                    ov.getOsoba().getId(),
                    ov.getOsoba().getMeno(),
                    ov.getOsoba().getPriezvisko(),
                    ov.getVakcina().getNazov(),
                    ov.getPlanovanyDatum(),
                    ov.getPoradieDavky(),
                    daysUntil // Positive for upcoming
                );
            })
            .sorted((a, b) -> a.getDniDoAplikacie().compareTo(b.getDniDoAplikacie())) // Soonest first
            .collect(Collectors.toList());
    }

    public List<NotifikaciaDTO> getPriorityNotifications() {
        List<NotifikaciaDTO> overdue = getOverdueDoses();
        List<NotifikaciaDTO> upcoming = getUpcomingDoses();
        
        // Combine and sort by priority (overdue first, then by days)
        List<NotifikaciaDTO> combined = new ArrayList<>();
        combined.addAll(overdue);
        combined.addAll(upcoming);
        
        return combined.stream()
            .sorted((a, b) -> {
                // Overdue doses have highest priority (negative days)
                if (a.getDniDoAplikacie() < 0 && b.getDniDoAplikacie() >= 0) return -1;
                if (a.getDniDoAplikacie() >= 0 && b.getDniDoAplikacie() < 0) return 1;
                
                // Both overdue: most overdue first
                if (a.getDniDoAplikacie() < 0 && b.getDniDoAplikacie() < 0) {
                    return Integer.compare(a.getDniDoAplikacie(), b.getDniDoAplikacie());
                }
                
                // Both upcoming: soonest first
                return Integer.compare(a.getDniDoAplikacie(), b.getDniDoAplikacie());
            })
            .collect(Collectors.toList());
    }

    public List<NotifikaciaDTO> getAllNotifications() {
        LocalDate today = LocalDate.now();
        LocalDate futureLimit = today.plusDays(30); // Show notifications for next 30 days

        return osobaVakcinaRepository.findAll().stream()
            .filter(ov -> ov.getDatumAplikacie() == null) // Not yet applied
            .filter(ov -> ov.getPlanovanyDatum() != null) // Has planned date
            .filter(ov -> ov.getPlanovanyDatum().isBefore(futureLimit) || ov.getPlanovanyDatum().isEqual(futureLimit))
            .map(ov -> {
                int daysUntil = (int) ChronoUnit.DAYS.between(today, ov.getPlanovanyDatum());
                return new NotifikaciaDTO(
                    ov.getOsoba().getId(),
                    ov.getOsoba().getMeno(),
                    ov.getOsoba().getPriezvisko(),
                    ov.getVakcina().getNazov(),
                    ov.getPlanovanyDatum(),
                    ov.getPoradieDavky(),
                    daysUntil
                );
            })
            .sorted((a, b) -> a.getDniDoAplikacie().compareTo(b.getDniDoAplikacie()))
            .collect(Collectors.toList());
    }

    public void markAsContacted(Long doseId) {
        // This could update a "contacted" flag in the database
        // For now, we'll just log it
        System.out.println("Marked dose " + doseId + " as contacted at " + LocalDate.now());
    }

    @Scheduled(cron = "0 0 12 * * ?")  // Run every day at 12:00 PM
    public void checkVaccinationExpiry() {
        List<NotifikaciaDTO> overdue = getOverdueDoses();

        for (NotifikaciaDTO notification : overdue) {
            System.out.println("OVERDUE: " + notification.getOsobaMeno() + " " + 
                             notification.getOsobaPriezvisko() + " is " + 
                             Math.abs(notification.getDniDoAplikacie()) + " days overdue for " + 
                             notification.getVakcinaNazov() + " dose " + 
                             notification.getPoradieDavky());
        }
    }
}