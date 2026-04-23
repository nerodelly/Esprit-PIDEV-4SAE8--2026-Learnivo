package org.example.imedbackend.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.imedbackend.entity.InternshipDocumentType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipDocumentDto {

    private Long id;
    private InternshipDocumentType type;
    private String url;
    private LocalDateTime uploadedAt;
    private String comment;
    private boolean isValidated;
}
