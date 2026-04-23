package com.learnivo.demo.controller;

import com.learnivo.demo.dto.ClubRequest;
import com.learnivo.demo.dto.ClubResponse;
import com.learnivo.demo.entity.Club;
import com.learnivo.demo.service.ClubService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clubs")

public class ClubController {

    private final ClubService clubService;

    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    @GetMapping
    public ResponseEntity<List<ClubResponse>> getAll() {
        List<ClubResponse> list = clubService.findAll().stream()
                .map(ClubResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClubResponse> getById(@PathVariable Long id) {
        Club club = clubService.findById(id);
        return ResponseEntity.ok(ClubResponse.from(club));
    }

    @PostMapping
    public ResponseEntity<ClubResponse> create(@Valid @RequestBody ClubRequest request) {
        Club club = clubService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ClubResponse.from(club));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClubResponse> update(@PathVariable Long id, @Valid @RequestBody ClubRequest request) {
        Club club = clubService.update(id, request);
        return ResponseEntity.ok(ClubResponse.from(club));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clubService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
