package org.example.imedbackend.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.imedbackend.service.ChatService;
import org.example.imedbackend.service.ChatService.ChatMessage;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/chat")

@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/rooms/{roomId}/messages")
    public List<ChatMessage> getMessages(@PathVariable String roomId) {
        return chatService.getMessages(roomId);
    }

    @PostMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ChatMessage> sendMessage(@PathVariable String roomId, @Valid @RequestBody ChatMessageRequest request) {
        try {
            ChatMessage savedMessage = chatService.saveMessage(roomId, request.senderRole(), request.senderName(), request.content());
            return ResponseEntity.ok(savedMessage);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping(value = "/rooms/{roomId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable String roomId) {
        return chatService.subscribe(roomId);
    }

    public record ChatMessageRequest(
            @NotBlank String senderRole,
            String senderName,
            @NotBlank String content
    ) {
    }
}
