package com.learnivo.demo.service;

import com.learnivo.demo.entity.Event;
import com.learnivo.demo.entity.EventRegistration;
import com.learnivo.demo.entity.Student;
import com.learnivo.demo.repository.EventRegistrationRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

/**
 * Certificat au template Learnivo : paysage, fond crème, cadre double, bloc marque, sceau, signatures.
 */
@Service
public class CertificateService {

    private static final String ORGANIZATION_NAME = "LEARNIVO";
    private static final String TAGLINE = "certificats de participation";

    private static final float MARGIN = 48;
    private static final float HEADER_HEIGHT = 56;
    private static final Color CREAM = new Color(0xFA, 0xF0, 0xE6);
    private static final Color BROWN_HEADER = new Color(0x5C, 0x4A, 0x32);
    private static final Color BORDER_BROWN = new Color(0x8B, 0x73, 0x55);
    private static final Color DARK_BROWN = new Color(0x2C, 0x18, 0x10);

    private final EventRegistrationRepository registrationRepository;

    public CertificateService(EventRegistrationRepository registrationRepository) {
        this.registrationRepository = registrationRepository;
    }

    public byte[] generateParticipationCertificate(Long eventId, Long studentId) throws DocumentException, IOException {
        List<EventRegistration> list = registrationRepository.findByEvent_Id(eventId);
        EventRegistration registration = list.stream()
                .filter(r -> r.getStudent() != null && studentId.equals(r.getStudent().getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Cet étudiant n'est pas inscrit à cet événement."));
        return buildCertificatePdf(registration.getEvent(), registration.getStudent());
    }

    private byte[] buildCertificatePdf(Event event, Student student) throws DocumentException, IOException {
        Document document = new Document(PageSize.A4.rotate(), MARGIN, MARGIN, HEADER_HEIGHT + 24, MARGIN);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(document, out);
        writer.setPageEvent(new LearnivoTemplateEvent());
        document.open();

        BaseFont timesRoman = BaseFont.createFont(BaseFont.TIMES_ROMAN, BaseFont.WINANSI, false);
        BaseFont helvetica = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, false);
        BaseFont helveticaBold = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.WINANSI, false);
        BaseFont helveticaOblique = BaseFont.createFont(BaseFont.HELVETICA_OBLIQUE, BaseFont.WINANSI, false);

        Font fontCert = new Font(timesRoman, 32, Font.NORMAL, DARK_BROWN);
        Font fontOfCompletion = new Font(helvetica, 11, Font.NORMAL, DARK_BROWN);
        Font fontPresented = new Font(helveticaOblique, 12, Font.NORMAL, DARK_BROWN);
        Font fontName = new Font(helveticaBold, 16, Font.NORMAL, DARK_BROWN);
        Font fontFor = new Font(helveticaOblique, 10, Font.NORMAL, new Color(0x6B, 0x6B, 0x6B));
        Font fontEvent = new Font(helveticaBold, 14, Font.NORMAL, DARK_BROWN);
        Font fontSig = new Font(helvetica, 10, Font.NORMAL, DARK_BROWN);
        Font fontSigTitle = new Font(helvetica, 8, Font.NORMAL, new Color(0x6B, 0x6B, 0x6B));

        document.add(Chunk.NEWLINE);

        Paragraph pCert = new Paragraph("CERTIFICATE", fontCert);
        pCert.setAlignment(Element.ALIGN_CENTER);
        pCert.setSpacingAfter(2);
        document.add(pCert);

        Paragraph pOf = new Paragraph("OF COMPLETION", fontOfCompletion);
        pOf.setAlignment(Element.ALIGN_CENTER);
        pOf.setSpacingAfter(14);
        document.add(pOf);

        Paragraph pPresented = new Paragraph("proudly presented to", fontPresented);
        pPresented.setAlignment(Element.ALIGN_CENTER);
        pPresented.setSpacingAfter(14);
        document.add(pPresented);

        LineSeparator line1 = new LineSeparator(1.2f, 100, BORDER_BROWN, Element.ALIGN_CENTER, 1);
        document.add(line1);
        document.add(new Chunk("\n"));

        String name = student.getName() != null ? student.getName() : "—";
        Paragraph pName = new Paragraph(name, fontName);
        pName.setAlignment(Element.ALIGN_CENTER);
        pName.setSpacingAfter(6);
        document.add(pName);

        LineSeparator line2 = new LineSeparator(1.2f, 100, BORDER_BROWN, Element.ALIGN_CENTER, 1);
        document.add(line2);
        document.add(new Chunk("\n"));

        Paragraph pFor = new Paragraph("for participating in", fontFor);
        pFor.setAlignment(Element.ALIGN_CENTER);
        pFor.setSpacingAfter(14);
        document.add(pFor);

        LineSeparator line3 = new LineSeparator(1.2f, 100, BORDER_BROWN, Element.ALIGN_CENTER, 1);
        document.add(line3);
        document.add(new Chunk("\n"));

        String eventTitle = event.getTitle() != null ? event.getTitle() : "—";
        Paragraph pEvent = new Paragraph(eventTitle, fontEvent);
        pEvent.setAlignment(Element.ALIGN_CENTER);
        pEvent.setSpacingAfter(36);
        document.add(pEvent);

        PdfPTable sigTable = new PdfPTable(2);
        sigTable.setWidthPercentage(70f);
        sigTable.setHorizontalAlignment(Element.ALIGN_CENTER);
        sigTable.setWidths(new float[]{1f, 1f});
        sigTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);
        sigTable.getDefaultCell().setHorizontalAlignment(Element.ALIGN_CENTER);
        sigTable.getDefaultCell().setPaddingTop(8);
        sigTable.addCell(createSignatureCell("IYADH CHERNI", "director", fontSig, fontSigTitle));
        sigTable.addCell(createSignatureCell("ABC", "manager", fontSig, fontSigTitle));
        document.add(sigTable);

        document.close();
        return out.toByteArray();
    }

    private static PdfPCell createSignatureCell(String name, String title, Font fontSig, Font fontSigTitle) {
        LineSeparator sigLine = new LineSeparator(0.8f, 80, BORDER_BROWN, Element.ALIGN_CENTER, 1);
        Phrase p = new Phrase();
        p.add(new Chunk(sigLine));
        p.add(new Chunk("\n"));
        p.add(new Chunk(name + "\n", fontSig));
        p.add(new Chunk(title, fontSigTitle));
        PdfPCell cell = new PdfPCell(p);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(4);
        return cell;
    }

    private static class LearnivoTemplateEvent extends com.lowagie.text.pdf.PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte under = writer.getDirectContentUnder();
            float w = document.getPageSize().getWidth();
            float h = document.getPageSize().getHeight();

            under.setColorFill(CREAM);
            under.rectangle(0, 0, w, h);
            under.fill();

            float outer = 28;
            float inner = 34;
            under.setLineWidth(0.8f);
            under.setColorStroke(BORDER_BROWN);
            under.rectangle(outer, outer, w - 2 * outer, h - 2 * outer);
            under.stroke();

            under.setLineWidth(1.5f);
            under.setColorStroke(BORDER_BROWN);
            under.rectangle(inner, inner, w - 2 * inner, h - 2 * inner);
            under.stroke();

            float r = 12;
            float[] corners = {inner + r, inner + r, w - inner - r, inner + r, w - inner - r, h - inner - r, inner + r, h - inner - r};
            under.setLineWidth(1f);
            under.setColorStroke(BORDER_BROWN);
            drawCornerFlourish(under, inner, h - inner, r, true, true);
            drawCornerFlourish(under, w - inner, h - inner, r, false, true);
            drawCornerFlourish(under, w - inner, inner, r, false, false);
            drawCornerFlourish(under, inner, inner, r, true, false);

            under.setColorFill(BROWN_HEADER);
            float headerLeft = w * 0.2f;
            float headerWidth = w * 0.6f;
            under.rectangle(headerLeft, h - HEADER_HEIGHT, headerWidth, HEADER_HEIGHT);
            under.fill();

            PdfContentByte over = writer.getDirectContent();
            over.beginText();
            try {
                BaseFont bf = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.WINANSI, false);
                over.setFontAndSize(bf, 20);
                over.setColorFill(Color.WHITE);
                over.showTextAligned(Element.ALIGN_CENTER, ORGANIZATION_NAME, w / 2, h - HEADER_HEIGHT / 2 - 4, 0);
                over.setFontAndSize(BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, false), 10);
                over.showTextAligned(Element.ALIGN_CENTER, TAGLINE, w / 2, h - HEADER_HEIGHT / 2 - 18, 0);
            } catch (Exception ignored) {
            }
            over.endText();
        }

        private void drawCornerFlourish(PdfContentByte cb, float x, float y, float r, boolean left, boolean top) {
            float dx = left ? r : -r;
            float dy = top ? r : -r;
            cb.moveTo(x, y);
            cb.lineTo(x + dx, y);
            cb.moveTo(x, y);
            cb.lineTo(x, y + dy);
            cb.stroke();
        }
    }
}
