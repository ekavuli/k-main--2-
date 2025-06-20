package su.umb.prog3.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@ComponentScan(basePackages = "su.umb.prog3.demo.demo")
@EnableScheduling
public class DemoApplication {
    private static final Logger logger = LoggerFactory.getLogger(DemoApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
        logger.info("Application started successfully.");
    }
}