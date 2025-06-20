package su.umb.prog3.demo.demo.security;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import su.umb.prog3.demo.demo.persistence.Services.AdminService;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final AdminService adminService;

    public AdminInitializer(AdminService adminService) {
        this.adminService = adminService;
    }

    @Override
    public void run(String... args) {
        // Vytvorím jedného admin používateľa pri štarte aplikácie
        adminService.createAdminIfNotExists("admin", "admin123");
    }
}
