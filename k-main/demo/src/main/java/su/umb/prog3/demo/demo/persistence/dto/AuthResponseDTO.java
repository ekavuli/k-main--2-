package su.umb.prog3.demo.demo.persistence.dto;

import java.util.List;

public class AuthResponseDTO {
    private String token;
    private String username;
    private List<String> roles;

    public AuthResponseDTO(String token, String username, List<String> roles) {
        this.token = token;
        this.username = username;
        this.roles = roles;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
