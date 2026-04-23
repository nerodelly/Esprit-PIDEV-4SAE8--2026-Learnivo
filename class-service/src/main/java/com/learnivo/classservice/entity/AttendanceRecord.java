package com.learnivo.classservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "attendance_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String date;

    @ElementCollection
    @CollectionTable(name = "attendance_attendees",
                     joinColumns = @JoinColumn(name = "attendance_id"))
    @Column(name = "student_id")
    @Builder.Default
    private List<Long> attendees = new ArrayList<>();
}
