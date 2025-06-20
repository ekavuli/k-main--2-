package su.umb.prog3.demo.demo.persistence.dto;

public class ErrorResponseDTO {
    private String error;
    private String message;
    
    public ErrorResponseDTO(String error) {
        this.error = error;
        this.message = error;
    }
    
    public ErrorResponseDTO(String error, String message) {
        this.error = error;
        this.message = message;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
