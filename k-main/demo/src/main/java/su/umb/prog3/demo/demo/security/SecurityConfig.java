package su.umb.prog3.demo.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AdminUserDetailsService adminUserDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, AdminUserDetailsService adminUserDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.adminUserDetailsService = adminUserDetailsService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/vakcina/all").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/osoby/all").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/osobavakcina").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/osobavakcina/search").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/osobavakcina/person/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/osobavakcina/add-smart").permitAll()
                .requestMatchers("/api/notifications/**").permitAll()

                // Admin-only endpoints (require ADMIN role)
                .requestMatchers(HttpMethod.POST, "/api/osoby/add").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/osoby/update/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/osoby/remove/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/vakcina/add").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/vakcina/update/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/vakcina/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/vakcina/delete/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/vakcina/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/osobavakcina/add").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/osobavakcina/update/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/osobavakcina/**").hasRole("ADMIN")
                .requestMatchers("/api/vaccination/**").hasRole("ADMIN")
                // Default - require authentication for everything else
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    System.err.println("Authentication failed: " + authException.getMessage());
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Authentication required\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    System.err.println("Access denied: " + accessDeniedException.getMessage());
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Access denied\"}");
                })
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(adminUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}