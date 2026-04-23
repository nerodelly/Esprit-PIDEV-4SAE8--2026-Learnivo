package com.learnivo.demo.service;

import com.learnivo.demo.dto.ClubRequest;
import com.learnivo.demo.entity.Club;
import com.learnivo.demo.entity.Event;
import com.learnivo.demo.entity.Professor;
import com.learnivo.demo.repository.ClubRepository;
import com.learnivo.demo.repository.ProfessorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClubService {

    private final ClubRepository clubRepository;
    private final ProfessorRepository professorRepository;

    public ClubService(ClubRepository clubRepository, ProfessorRepository professorRepository) {
        this.clubRepository = clubRepository;
        this.professorRepository = professorRepository;
    }

    public List<Club> findAll() {
        return clubRepository.findAll();
    }

    public Club findById(Long id) {
        return clubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + id));
    }

    public Club create(ClubRequest request) {
        Club club = new Club();
        club.setName(request.name());
        club.setDescription(request.description());
        club.setStatus(request.status());
        if (request.professorId() != null) {
            Professor prof = professorRepository.findById(request.professorId())
                    .orElseThrow(() -> new RuntimeException("Professor not found with id: " + request.professorId()));
            club.setProfessor(prof);
        }
        return clubRepository.save(club);
    }

    public Club update(Long id, ClubRequest request) {
        Club club = findById(id);
        club.setName(request.name());
        club.setDescription(request.description());
        club.setStatus(request.status());
        if (request.professorId() != null) {
            Professor prof = professorRepository.findById(request.professorId())
                    .orElseThrow(() -> new RuntimeException("Professor not found with id: " + request.professorId()));
            club.setProfessor(prof);
        } else {
            club.setProfessor(null);
        }
        return clubRepository.save(club);
    }

    @Transactional
    public void delete(Long id) {
        Club club = findById(id);
        club.getMemberships().size();
        for (Event e : club.getEvents()) {
            e.getRegistrations().size();
        }
        clubRepository.delete(club);
    }
}
