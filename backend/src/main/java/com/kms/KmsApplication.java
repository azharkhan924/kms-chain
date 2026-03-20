package com.kms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
@EnableJpaAuditing
public class KmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(KmsApplication.class, args);
    }
}
