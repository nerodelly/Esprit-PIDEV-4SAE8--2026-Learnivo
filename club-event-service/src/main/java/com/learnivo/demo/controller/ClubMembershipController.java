package com.learnivo.demo.controller;

import com.learnivo.demo.dto.ClubMembershipRequest;
import com.learnivo.demo.dto.ClubMembershipResponse;
import com.learnivo.demo.service.ClubMembershipService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/club-memberships")

public class ClubMembershipController {

    private final ClubMembershipService membershipService;

    public ClubMembershipController(ClubMembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @GetMapping
    public ResponseEntity<List<ClubMembershipResponse>> getAll() {
        return ResponseEntity.ok(membershipService.findAllResponse());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClubMembershipResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(membershipService.findByIdResponse(id));
    }

    @PostMapping
    public ResponseEntity<ClubMembershipResponse> create(@Valid @RequestBody ClubMembershipRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(membershipService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClubMembershipResponse> update(@PathVariable Long id, @Valid @RequestBody ClubMembershipRequest request) {
        return ResponseEntity.ok(membershipService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        membershipService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
