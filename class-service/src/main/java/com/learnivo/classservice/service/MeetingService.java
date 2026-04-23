package com.learnivo.classservice.service;

import com.learnivo.classservice.entity.PlatformClass;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

/**
 * Génère un lien Google Meet pour une classe.
 *
 * meeting.provider=mock   → lien fictif (défaut, aucun credential requis)
 * meeting.provider=google → appel Google Calendar API (credentials requis)
 */
@Service
@Slf4j
public class MeetingService {

    @Value("${meeting.provider:mock}")
    private String provider;

    @Value("${google.client-id:}")
    private String clientId;

    @Value("${google.client-secret:}")
    private String clientSecret;

    @Value("${google.refresh-token:}")
    private String refreshToken;

    @Value("${google.calendar-id:primary}")
    private String calendarId;

    // ── Point d'entrée ────────────────────────────────────────────────

    public String generateMeetLink(PlatformClass cls) {
        if ("google".equalsIgnoreCase(provider)) {
            log.info("[MEET] Mode GOOGLE pour '{}'", cls.getTitle());
            return createGoogleMeeting(cls);
        }
        log.info("[MEET] Mode MOCK pour '{}'", cls.getTitle());
        return createMockMeeting(cls);
    }

    // ── MOCK ──────────────────────────────────────────────────────────

    private String createMockMeeting(PlatformClass cls) {
        String code = buildMeetCode(cls.getId(), cls.getTitle());
        String link = "https://meet.google.com/" + code;
        log.info("[MEET][MOCK] {} → {}", cls.getTitle(), link);
        return link;
    }

    /** Format meet.google.com/abc-defg-hij — déterministe */
    private String buildMeetCode(Long id, String title) {
        int hash = Math.abs((id + "-" + title).hashCode());
        String chars = "abcdefghijkmnopqrstuvwxyz";
        StringBuilder sb = new StringBuilder();
        long val = hash;
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt((int)(val % chars.length())));
            val = val / chars.length() + id;
        }
        String s = sb.toString();
        return s.substring(0, 3) + "-" + s.substring(3, 7) + "-" + s.substring(7, 10);
    }

    // ── GOOGLE CALENDAR API ───────────────────────────────────────────

    private String createGoogleMeeting(PlatformClass cls) {
        try {
            String accessToken = fetchAccessToken();
            String eventJson   = buildEventJson(cls);
            String meetLink    = callCalendarApi(accessToken, eventJson);
            log.info("[MEET][GOOGLE] {} → {}", cls.getTitle(), meetLink);
            return meetLink;
        } catch (Exception e) {
            log.error("[MEET][GOOGLE] Erreur : {} — fallback mock", e.getMessage());
            return createMockMeeting(cls);
        }
    }

    private String fetchAccessToken() throws Exception {
        String body = "client_id=" + clientId
                + "&client_secret=" + clientSecret
                + "&refresh_token=" + refreshToken
                + "&grant_type=refresh_token";

        HttpResponse<String> response = HttpClient.newHttpClient().send(
                HttpRequest.newBuilder()
                        .uri(URI.create("https://oauth2.googleapis.com/token"))
                        .header("Content-Type", "application/x-www-form-urlencoded")
                        .POST(HttpRequest.BodyPublishers.ofString(body))
                        .build(),
                HttpResponse.BodyHandlers.ofString());

        String resp = response.body().replaceAll("\\s+", "");
        int start = resp.indexOf("\"access_token\":\"") + 16;
        int end   = resp.indexOf("\"", start);
        if (start < 16) throw new RuntimeException("access_token absent : " + resp);
        return resp.substring(start, end);
    }

    private String buildEventJson(PlatformClass cls) {
        String start = "2025-09-01T" + safeTime(cls.getTime(), 0) + ":00";
        String end   = "2025-09-01T" + safeTime(cls.getTime(), 2) + ":00";
        return "{"
                + "\"summary\":\"" + cls.getTitle() + "\","
                + "\"description\":\"" + cls.getType() + " — " + cls.getLevel() + "\","
                + "\"start\":{\"dateTime\":\"" + start + "\",\"timeZone\":\"Africa/Tunis\"},"
                + "\"end\":{\"dateTime\":\"" + end + "\",\"timeZone\":\"Africa/Tunis\"},"
                + "\"recurrence\":[\"RRULE:FREQ=WEEKLY\"],"
                + "\"conferenceData\":{"
                +   "\"createRequest\":{"
                +     "\"requestId\":\"learnivo-" + cls.getId() + "-" + System.currentTimeMillis() + "\","
                +     "\"conferenceSolutionKey\":{\"type\":\"hangoutsMeet\"}"
                +   "}"
                + "}"
                + "}";
    }

    private String callCalendarApi(String accessToken, String eventJson) throws Exception {
        HttpResponse<String> response = HttpClient.newHttpClient().send(
                HttpRequest.newBuilder()
                        .uri(URI.create("https://www.googleapis.com/calendar/v3/calendars/"
                                + calendarId + "/events?conferenceDataVersion=1"))
                        .header("Authorization", "Bearer " + accessToken)
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(eventJson))
                        .build(),
                HttpResponse.BodyHandlers.ofString());

        String body = response.body().replaceAll("\\s+", "");
        String hm = "\"hangoutLink\":\"";
        int hi = body.indexOf(hm);
        if (hi >= 0) {
            int s = hi + hm.length();
            return body.substring(s, body.indexOf("\"", s));
        }
        String um = "\"uri\":\"https://meet.google.com/";
        int ui = body.indexOf(um);
        if (ui >= 0) {
            int s = ui + 7;
            return body.substring(s, body.indexOf("\"", s));
        }
        throw new RuntimeException("Lien Meet absent : " + body);
    }

    private String safeTime(String time, int addHours) {
        if (time == null || time.isBlank()) return String.format("%02d:00", 10 + addHours);
        String clean = time.replaceAll("(?i)\\s?(am|pm)", "").trim();
        try {
            int h = Integer.parseInt(clean.split(":")[0]) + addHours;
            String m = clean.contains(":") ? clean.split(":")[1] : "00";
            return String.format("%02d:%s", h, m);
        } catch (Exception e) {
            return String.format("%02d:00", 10 + addHours);
        }
    }
}
