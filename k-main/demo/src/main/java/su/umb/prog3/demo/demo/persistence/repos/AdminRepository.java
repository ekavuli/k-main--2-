package su.umb.prog3.demo.demo.persistence.repos;

import org.springframework.data.jpa.repository.JpaRepository;
import su.umb.prog3.demo.demo.persistence.entity.AdminEntity;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<AdminEntity, Long> {
    Optional<AdminEntity> findByUsername(String username);
}
