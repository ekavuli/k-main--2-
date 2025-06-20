package su.umb.prog3.demo.demo.persistence.repos;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import su.umb.prog3.demo.demo.persistence.entity.OsobaEntity;

@Repository
public interface OsobaRepository extends CrudRepository<OsobaEntity, Long> {
}
