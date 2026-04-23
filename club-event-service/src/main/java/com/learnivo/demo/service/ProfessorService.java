package com.learnivo.demo.service;

import com.learnivo.demo.dto.ProfessorRequest;
import com.learnivo.demo.entity.Club;
import com.learnivo.demo.entity.Event;
import com.learnivo.demo.entity.Professor;
import com.learnivo.demo.repository.ProfessorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProfessorService {

    private final ProfessorRepository professorRepository;

    public ProfessorService(ProfessorRepository professorRepository) {
        this.professorRepository = professorRepository;
    }

    public List<Professor> findAll() {
        return professorRepository.findAll();
    }

    public Professor findById(Long id) {
        return professorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Professor not found with id: " + id));
    }

    public Professor create(ProfessorRequest request) {
        Professor professor = new Professor();
        professor.setName(request.name());
        professor.setEmail(request.email());
        professor.setUserId(System.currentTimeMillis()); // auto-generate if not provided
        return professorRepository.save(professor);
    }

    public Professor update(Long id, ProfessorRequest request) {
        Professor professor = findById(id);
        professor.setName(request.name());
        professor.setEmail(request.email());
        return professorRepository.save(professor);
    }

    @Transactional
    public void delete(Long id) {
        Professor professor = findById(id);
        for (Club c : professor.getClubs()) {
            c.getMemberships().size();
            for (Event e : c.getEvents()) {
                e.getRegistrations().size();
            }
        }
        professorRepository.delete(professor);
    }
}
