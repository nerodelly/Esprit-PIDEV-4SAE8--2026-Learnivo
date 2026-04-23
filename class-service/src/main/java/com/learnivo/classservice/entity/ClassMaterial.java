package com.learnivo.classservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "class_materials")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String url;
    private String type;   // pdf, video, link, slide
}
