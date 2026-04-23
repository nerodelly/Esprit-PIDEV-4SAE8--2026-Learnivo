package com.learnivo.classservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "classes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String instructor;
    private String day;
    private String time;
    private String duration;
    private String level;
    private String type;
    private String link;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    private Integer maxCapacity = 20;
    private Boolean recurring = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "class_id")
    @Builder.Default
    private List<EnrolledStudent> enrolled = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "class_id")
    @Builder.Default
    private List<AttendanceRecord> attendance = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "class_id")
    @Builder.Default
    private List<ClassMaterial> materials = new ArrayList<>();

    public boolean isRecurring() {
        return Boolean.TRUE.equals(recurring);
    }

    public enum Status { ACTIVE, FULL, CANCELLED; }
}
