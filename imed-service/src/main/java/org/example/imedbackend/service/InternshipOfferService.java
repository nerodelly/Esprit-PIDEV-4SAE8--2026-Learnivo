package org.example.imedbackend.service;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.example.imedbackend.entity.InternshipOffer;
import org.example.imedbackend.repository.InternshipOfferRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InternshipOfferService {

    private final InternshipOfferRepository internshipOfferRepository;

    public List<InternshipOffer> getAll() {
        return internshipOfferRepository.findAll();
    }

    public Optional<InternshipOffer> getById(Long id) {
        return internshipOfferRepository.findById(id);
    }

    public InternshipOffer create(InternshipOffer internshipOffer) {
        return internshipOfferRepository.save(internshipOffer);
    }

    public Optional<InternshipOffer> update(Long id, InternshipOffer internshipOffer) {
        if (!internshipOfferRepository.existsById(id)) {
            return Optional.empty();
        }
        internshipOffer.setId(id);
        return Optional.of(internshipOfferRepository.save(internshipOffer));
    }

    public boolean delete(Long id) {
        if (!internshipOfferRepository.existsById(id)) {
            return false;
        }
        internshipOfferRepository.deleteById(id);
        return true;
    }
}
