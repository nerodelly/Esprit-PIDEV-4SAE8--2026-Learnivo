package org.example.imedbackend;

import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableDiscoveryClient
public class ImedBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ImedBackendApplication.class, args);
    }

}
