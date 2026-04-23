package com.learnivo.demo.service;

import com.learnivo.demo.dto.ClubMembershipRequest;
import com.learnivo.demo.dto.ClubMembershipResponse;
import com.learnivo.demo.entity.Club;
import com.learnivo.demo.entity.ClubMembership;
import com.learnivo.demo.entity.Student;
import com.learnivo.demo.repository.ClubMembershipRepository;
import com.learnivo.demo.repository.ClubRepository;
import com.learnivo.demo.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClubMembershipService {

    private final ClubMembershipRepository membershipRepository;
    private final ClubRepository clubRepository;
    private final StudentRepository studentRepository;

    public ClubMembershipService(ClubMembershipRepository membershipRepository,
                                ClubRepository clubRepository,
                                StudentRepository studentRepository) {
        this.membershipRepository = membershipRepository;
        this.clubRepository = clubRepository;
        this.studentRepository = studentRepository;
    }

    public List<ClubMembership> findAll() {
        return membershipRepository.findAll();
    }

    public ClubMembership findById(Long id) {
        return membershipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Club membership not found with id: " + id));
    }

    @Transactional
    public ClubMembershipResponse create(ClubMembershipRequest request) {
        Club club = clubRepository.findById(request.clubId())
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + request.clubId()));
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + request.studentId()));
        ClubMembership m = new ClubMembership();
        m.setJoinedAt(request.joinedAt());
        m.setStatus(request.status());
        m.setClub(club);
        m.setStudent(student);
        ClubMembership saved = membershipRepository.save(m);
        return ClubMembershipResponse.from(saved);
    }

    @Transactional
    public ClubMembershipResponse update(Long id, ClubMembershipRequest request) {
        ClubMembership m = findById(id);
        m.setJoinedAt(request.joinedAt());
        m.setStatus(request.status());
        Club club = clubRepository.findById(request.clubId())
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + request.clubId()));
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + request.studentId()));
        m.setClub(club);
        m.setStudent(student);
        ClubMembership saved = membershipRepository.save(m);
        return ClubMembershipResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<ClubMembershipResponse> findAllResponse() {
        return membershipRepository.findAll().stream()
                .map(ClubMembershipResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClubMembershipResponse findByIdResponse(Long id) {
        ClubMembership m = findById(id);
        return ClubMembershipResponse.from(m);
    }

    @Transactional
    public void delete(Long id) {
        ClubMembership m = findById(id);
        membershipRepository.delete(m);
    }
}
