package com.learnivo.classservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "enrolled_students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrolledStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String enrolledAt;
}
