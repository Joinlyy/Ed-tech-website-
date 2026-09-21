package com.redpen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

/**
 * We handle auth via JWT ({@link com.redpen.security.JwtAuthenticationFilter}), so
 * Spring's default in-memory UserDetailsService is unwanted — it prints an alarming
 * "Using generated security password" line at every boot even though the account it
 * creates is never reachable through our SecurityFilterChain.
 */
@SpringBootApplication(exclude = { UserDetailsServiceAutoConfiguration.class })
public class RedpenApplication {
    public static void main(String[] args) {
        SpringApplication.run(RedpenApplication.class, args);
    }
}
