package org.example.imedbackend.service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class ChatService {

    private static final int MAX_HISTORY_PER_ROOM = 300;
    private static final int MAX_CONTENT_LENGTH = 2000;
    private final AtomicLong messageIdSequence = new AtomicLong(0);
    private final Map<String, CopyOnWriteArrayList<ChatMessage>> roomMessages = new ConcurrentHashMap<>();
    private final Map<String, CopyOnWriteArrayList<SseEmitter>> roomEmitters = new ConcurrentHashMap<>();

    public List<ChatMessage> getMessages(String roomId) {
        String normalizedRoomId = normalizeRoomId(roomId);
        return new ArrayList<>(roomMessages.computeIfAbsent(normalizedRoomId, key -> new CopyOnWriteArrayList<>()));
    }

    public ChatMessage saveMessage(String roomId, String senderRole, String senderName, String content) {
        String normalizedRoomId = normalizeRoomId(roomId);
        String normalizedSenderRole = normalizeSenderRole(senderRole);
        String normalizedSenderName = normalizeSenderName(senderName, normalizedSenderRole);
        String normalizedContent = normalizeContent(content);
        ChatMessage message = new ChatMessage(
                messageIdSequence.incrementAndGet(),
                normalizedRoomId,
                normalizedSenderRole,
                normalizedSenderName,
                normalizedContent,
                OffsetDateTime.now().toString()
        );
        CopyOnWriteArrayList<ChatMessage> messages = roomMessages.computeIfAbsent(normalizedRoomId, key -> new CopyOnWriteArrayList<>());
        messages.add(message);
        if (messages.size() > MAX_HISTORY_PER_ROOM) {
            messages.remove(0);
        }
        publishMessage(message);
        return message;
    }

    public SseEmitter subscribe(String roomId) {
        String normalizedRoomId = normalizeRoomId(roomId);
        SseEmitter emitter = new SseEmitter(0L);
        CopyOnWriteArrayList<SseEmitter> emitters = roomEmitters.computeIfAbsent(normalizedRoomId, key -> new CopyOnWriteArrayList<>());
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(error -> emitters.remove(emitter));
        try {
            emitter.send(SseEmitter.event().name("connected").data("connected"));
        } catch (Exception exception) {
            emitters.remove(emitter);
            emitter.complete();
        }
        return emitter;
    }

    private void publishMessage(ChatMessage message) {
        CopyOnWriteArrayList<SseEmitter> emitters = roomEmitters.get(message.roomId());
        if (emitters == null || emitters.isEmpty()) {
            return;
        }
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("message").data(message));
            } catch (Exception exception) {
                emitters.remove(emitter);
                emitter.complete();
            }
        }
    }

    private String normalizeRoomId(String roomId) {
        String normalizedRoomId = roomId == null ? "" : roomId.trim();
        if (normalizedRoomId.isEmpty() || normalizedRoomId.length() > 120) {
            throw new IllegalArgumentException("Room chat invalide");
        }
        return normalizedRoomId;
    }

    private String normalizeSenderRole(String senderRole) {
        String normalizedSenderRole = senderRole == null ? "" : senderRole.trim().toUpperCase();
        if (!normalizedSenderRole.equals("ADMIN") && !normalizedSenderRole.equals("CLIENT")) {
            throw new IllegalArgumentException("Rôle expéditeur invalide");
        }
        return normalizedSenderRole;
    }

    private String normalizeSenderName(String senderName, String senderRole) {
        String normalizedSenderName = senderName == null ? "" : senderName.trim();
        if (normalizedSenderName.isEmpty()) {
            return senderRole.equals("ADMIN") ? "Admin" : "Client";
        }
        if (normalizedSenderName.length() > 120) {
            throw new IllegalArgumentException("Nom expéditeur trop long");
        }
        return normalizedSenderName;
    }

    private String normalizeContent(String content) {
        String normalizedContent = content == null ? "" : content.trim();
        if (normalizedContent.isEmpty()) {
            throw new IllegalArgumentException("Message vide");
        }
        if (normalizedContent.length() > MAX_CONTENT_LENGTH) {
            throw new IllegalArgumentException("Message trop long");
        }
        return normalizedContent;
    }

    public record ChatMessage(
            long id,
            String roomId,
            String senderRole,
            String senderName,
            String content,
            String sentAt
    ) {
    }
}
