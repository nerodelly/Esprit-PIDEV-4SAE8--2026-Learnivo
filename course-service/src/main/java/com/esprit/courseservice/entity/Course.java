package com.esprit.courseservice.entity;

import com.esprit.courseservice.domain.CourseDifficulty;
import com.esprit.courseservice.domain.CourseStatus;
import com.esprit.courseservice.domain.CourseType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 800)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private CourseType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private CourseStatus status;

    @Column(nullable = false, length = 32)
    private String level;

    @Lob
    @Column(nullable = false)
    private String image;

    @Lob
    @Column(nullable = false)
    private String banner;

    @Column(nullable = false, unique = true, length = 150)
    private String slug;

    @Column(nullable = false, length = 32)
    private String actionLabel;

    @Column(nullable = false, length = 80)
    private String instructor;

    @Column(nullable = false, length = 80)
    private String category;

    @Column(nullable = false)
    private Integer chapters;

    @Column(nullable = false, length = 40)
    private String duration;

    @Enumerated(EnumType.STRING)
    @Column(length = 16)
    private CourseDifficulty difficultyLabel;

    private Double difficultyScore;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("number ASC")
    private List<CourseChapter> chaptersData = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
