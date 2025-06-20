package su.umb.prog3.demo.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    // Public endpoints that should skip JWT processing
    private final List<String> publicEndpoints = Arrays.asList(
        "/api/auth/login",
        "/api/vakcina/all",
        "/api/osoby/all",
        "/api/osobavakcina",
        "/api/osobavakcina/search",
        "/api/osobavakcina/person/",
        "/api/osobavakcina/add-smart",
        "/api/notifications/"
    );

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String requestURI = request.getRequestURI();
        final String method = request.getMethod();
        
        System.out.println("=== JWT Filter Processing ===");
        System.out.println("Processing request: " + method + " " + requestURI);

        // Skip JWT processing for public endpoints
        if (isPublicEndpoint(requestURI, method)) {
            System.out.println("Skipping JWT processing for public endpoint: " + requestURI);
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        System.out.println("Auth header: " + (authHeader != null ? "Bearer ***" : "null"));

        // Ak auth header neexistuje alebo nemá správny formát, pokračujeme na ďalší filter
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("No valid auth header, continuing without authentication");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Authentication required - no token provided\"}");
            return;
        }

        // Extrahujeme JWT token z auth headeru
        jwt = authHeader.substring(7);
        System.out.println("Extracted JWT token (length: " + jwt.length() + ")");

        try {
            // Extrahujeme username z tokenu
            username = jwtService.extractUsername(jwt);
            System.out.println("Extracted username from JWT: " + username);

            // Ak username existuje a používateľ ešte nie je autentifikovaný
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Načítame user details z databázy
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                // Validujeme token
                if (jwtService.validateToken(jwt, userDetails)) {
                    System.out.println("Token validated successfully for user: " + username);
                    
                    // Extrahujeme roly z tokenu
                    List<String> roles = jwtService.extractRoles(jwt);
                    var authorities = roles.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());
                    
                    System.out.println("Extracted roles from token: " + roles);
                    
                    // Vytvoríme autentifikačný token s rolami z JWT
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            authorities
                    );

                    // Nastavíme detaily
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Nastavíme autentifikáciu v security contexte
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    System.out.println("Token validation failed for user: " + username);
                }
            }
        } catch (io.jsonwebtoken.security.SecurityException e) {
            System.err.println("JWT signature validation failed: " + e.getMessage());
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            System.err.println("JWT token is malformed: " + e.getMessage());
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            System.err.println("JWT token is expired: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("JWT processing error: " + e.getMessage());
            e.printStackTrace();
        }

        // Pokračujeme na ďalší filter
        filterChain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String requestURI, String method) {
        // Allow only GET requests on public endpoints for read operations
        // Admin operations (POST, PUT, DELETE) always require JWT
        if (!method.equals("GET") && !requestURI.equals("/api/auth/login") && !requestURI.equals("/api/osobavakcina/add-smart")) {
            return false; // All non-GET operations need authentication except login and smart add
        }
        
        return publicEndpoints.stream().anyMatch(endpoint -> {
            if (endpoint.endsWith("/")) {
                return requestURI.startsWith(endpoint);
            }
            return requestURI.equals(endpoint) || requestURI.startsWith(endpoint + "/");
        });
    }
}
