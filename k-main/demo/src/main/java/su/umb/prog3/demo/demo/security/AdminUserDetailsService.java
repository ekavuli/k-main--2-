package su.umb.prog3.demo.demo.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import su.umb.prog3.demo.demo.persistence.entity.AdminEntity;
import su.umb.prog3.demo.demo.persistence.repos.AdminRepository;

import java.util.ArrayList;

@Service
public class AdminUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;

    public AdminUserDetailsService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AdminEntity admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found with username: " + username));

        System.out.println("Loading user: " + username + " with ROLE_ADMIN authority");
        
        return new User(
                admin.getUsername(),
                admin.getPassword(),
                true, // enabled
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                java.util.Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
    }
}
