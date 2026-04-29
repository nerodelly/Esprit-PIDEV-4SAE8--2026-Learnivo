package com.learnivo.claimsservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Manages SSE (Server-Sent Events) connections for agents and users.
 * Thread-safe: uses ConcurrentHashMap and CopyOnWriteArraySet.
 */
@Service
@Slf4j
public class SseService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /** All connected agent (admin) SSE clients */
    private final Set<SseEmitter> agentClients = new CopyOnWriteArraySet<>();

    /** Per-user SSE clients: email → set of emitters */
    private final Map<String, Set<SseEmitter>> userClients = new ConcurrentHashMap<>();

    // ── Agent SSE ─────────────────────────────────────────────────────────────

    /**
     * Create and register a new agent SSE emitter.
     */
    public SseEmitter createAgentEmitter() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        agentClients.add(emitter);
        log.info("Agent SSE client connected (total: {})", agentClients.size());

        // Send initial connected event
        sendToEmitter(emitter, Map.of("type", "CONNECTED", "message", "Agent notification stream connected"));

        emitter.onCompletion(() -> {
            agentClients.remove(emitter);
            log.info("Agent SSE client disconnected (total: {})", agentClients.size());
        });
        emitter.onTimeout(() -> {
            agentClients.remove(emitter);
            log.info("Agent SSE client timed out (total: {})", agentClients.size());
        });
        emitter.onError(e -> {
            agentClients.remove(emitter);
            log.debug("Agent SSE client error: {}", e.getMessage());
        });

        return emitter;
    }

    /**
     * Broadcast data to all connected agent clients.
     */
    public void sendToAgents(Object data) {
        Set<SseEmitter> deadEmitters = ConcurrentHashMap.newKeySet();
        for (SseEmitter emitter : agentClients) {
            try {
                emitter.send(SseEmitter.event().data(toJson(data)));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }
        agentClients.removeAll(deadEmitters);
    }

    // ── User SSE ──────────────────────────────────────────────────────────────

    /**
     * Create and register a new user SSE emitter for the given email.
     */
    public SseEmitter createUserEmitter(String email) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        userClients.computeIfAbsent(email, k -> new CopyOnWriteArraySet<>()).add(emitter);
        log.info("User SSE client connected for {}", email);

        // Send initial connected event
        sendToEmitter(emitter, Map.of(
                "type", "CONNECTED",
                "message", "User notification stream connected for " + email
        ));

        Runnable cleanup = () -> {
            Set<SseEmitter> set = userClients.get(email);
            if (set != null) {
                set.remove(emitter);
                if (set.isEmpty()) userClients.remove(email);
            }
            log.info("User SSE client disconnected for {}", email);
        };

        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> {
            cleanup.run();
            log.debug("User SSE client error for {}: {}", email, e.getMessage());
        });

        return emitter;
    }

    /**
     * Send data to all SSE clients connected for a specific user email.
     */
    public void sendToUser(String email, Object data) {
        Set<SseEmitter> clients = userClients.get(email);
        if (clients == null || clients.isEmpty()) return;

        Set<SseEmitter> deadEmitters = ConcurrentHashMap.newKeySet();
        for (SseEmitter emitter : clients) {
            try {
                emitter.send(SseEmitter.event().data(toJson(data)));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }
        clients.removeAll(deadEmitters);
        if (clients.isEmpty()) userClients.remove(email);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void sendToEmitter(SseEmitter emitter, Object data) {
        try {
            emitter.send(SseEmitter.event().data(toJson(data)));
        } catch (IOException e) {
            log.debug("Failed to send initial SSE event: {}", e.getMessage());
        }
    }

    private String toJson(Object data) {
        try {
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return "{}";
        }
    }
}
