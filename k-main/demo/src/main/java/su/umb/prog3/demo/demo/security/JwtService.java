package su.umb.prog3.demo.demo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // Use a consistent base64-encoded secret key for JWT tokens
    private static final String SECRET_KEY_STRING = "mySecretKeyForJWTTokensThisShouldBeAtLeast32CharactersLongForHS256Algorithm";
    private static final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET_KEY_STRING.getBytes());

    // Expirácia tokenu - 24 hodín
    private static final long EXPIRATION_TIME = 24 * 60 * 60 * 1000;

    // Extrakcia username z tokenu
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extrakcia expiracie z tokenu
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Generická metóda pre extrakciu claims z tokenu
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Extrakcia všetkých claims z tokenu
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            System.err.println("JWT parsing error: " + e.getMessage());
            throw e;
        }
    }

    // Kontrola, či token expiroval
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Generovanie tokenu s rolami
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // Pridáme roly do claims
        claims.put("roles", userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .toList());
        return createToken(claims, userDetails.getUsername());
    }

    // Vytvorenie tokenu s claims
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    // Extrakcia rolí z tokenu
    public List<String> extractRoles(String token) {
        List<?> roles = extractClaim(token, claims -> claims.get("roles", List.class));
        if (roles == null) {
            return List.of();
        }
        return roles.stream()
                .filter(role -> role instanceof String)
                .map(role -> (String) role)
                .toList();
    }

    // Validácia tokenu
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
