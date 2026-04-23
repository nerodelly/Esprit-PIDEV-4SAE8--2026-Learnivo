package org.example.imedbackend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.example.imedbackend.repository.CertificateRepository;
import org.example.imedbackend.repository.CertificateVerificationRepository;
import org.example.imedbackend.repository.CertificationRuleRepository;
import org.example.imedbackend.repository.InternshipApplicationRepository;
import org.example.imedbackend.repository.InternshipDocumentRepository;
import org.example.imedbackend.repository.InternshipEvaluationRepository;
import org.example.imedbackend.repository.InternshipOfferRepository;
import org.example.imedbackend.repository.InternshipRepository;

@SpringBootTest(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,"
                + "org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration,"
                + "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration",
        "eureka.client.enabled=false"
})
class ImedBackendApplicationTests {

    @MockBean
    private InternshipOfferRepository internshipOfferRepository;

    @MockBean
    private InternshipApplicationRepository internshipApplicationRepository;

    @MockBean
    private InternshipRepository internshipRepository;

    @MockBean
    private InternshipEvaluationRepository internshipEvaluationRepository;

    @MockBean
    private InternshipDocumentRepository internshipDocumentRepository;

    @MockBean
    private CertificateRepository certificateRepository;

    @MockBean
    private CertificateVerificationRepository certificateVerificationRepository;

    @MockBean
    private CertificationRuleRepository certificationRuleRepository;

    @Test
    void contextLoads() {
    }

}
