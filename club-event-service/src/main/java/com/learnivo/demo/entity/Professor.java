package com.learnivo.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "professors")
public class Professor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    @Column(name = "linked_service", nullable = false)
    private String linkedService = "user-service";

    @Column(name = "owner_context")
    private String ownerContext = "mohamed-work";

    @OneToMany(mappedBy = "professor", cascade = CascadeType.ALL)
    private List<Club> clubs = new ArrayList<>();

    public Professor() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLinkedService() {
        return linkedService;
    }

    public void setLinkedService(String linkedService) {
        this.linkedService = linkedService;
    }

    public String getOwnerContext() {
        return ownerContext;
    }

    public void setOwnerContext(String ownerContext) {
        this.ownerContext = ownerContext;
    }

    @JsonIgnore
    public List<Club> getClubs() {
        return clubs;
    }

    public void setClubs(List<Club> clubs) {
        this.clubs = clubs;
    }
}
