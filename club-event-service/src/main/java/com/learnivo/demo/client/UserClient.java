package com.learnivo.demo.client;

import com.learnivo.demo.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserClient {

    // Uses the internal endpoint — no JWT required, accessible service-to-service via Eureka
    @GetMapping("/api/internal/users/{id}")
    UserDTO getUserById(@PathVariable("id") String id);

    @GetMapping("/api/test/hello")
    String checkHello();

}
