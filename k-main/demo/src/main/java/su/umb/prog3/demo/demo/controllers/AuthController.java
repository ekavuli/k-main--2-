package su.umb.prog3.demo.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import su.umb.prog3.demo.demo.persistence.Services.AdminService;
import su.umb.prog3.demo.demo.persistence.dto.AuthResponseDTO;
import su.umb.prog3.demo.demo.persistence.dto.LoginRequestDTO;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final AdminService adminService;

    public AuthController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        try {
            return ResponseEntity.ok(adminService.authenticate(loginRequest));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
