package org.example.imedbackend.service;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.example.imedbackend.entity.Internship;
import org.example.imedbackend.repository.InternshipRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InternshipService {

    private final InternshipRepository internshipRepository;

    public List<Internship> getAll() {
        return internshipRepository.findAll();
    }

    public Optional<Internship> getById(Long id) {
        return internshipRepository.findById(id);
    }

    public Internship create(Internship internship) {
        return internshipRepository.save(internship);
    }

    public Optional<Internship> update(Long id, Internship internship) {
        if (!internshipRepository.existsById(id)) {
            return Optional.empty();
        }
        internship.setId(id);
        return Optional.of(internshipRepository.save(internship));
    }

    public boolean delete(Long id) {
        if (!internshipRepository.existsById(id)) {
            return false;
        }
        internshipRepository.deleteById(id);
        return true;
    }
}
