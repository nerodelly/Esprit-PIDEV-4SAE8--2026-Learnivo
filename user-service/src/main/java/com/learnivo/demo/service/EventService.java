package com.learnivo.demo.service;

import com.learnivo.demo.dto.EventRequest;
import com.learnivo.demo.entity.Event;
import com.learnivo.demo.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    public List<Event> findAll() {
        return eventRepository.findAll();
    }

    public Event findById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
    }

    public Event create(EventRequest request) {
        Event event = Event.builder()
                .title(request.title())
                .description(request.description())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .location(request.location())
                .status(request.status())
                .createdByUserId(request.createdByUserId())
                .linkedService(request.linkedService() != null ? request.linkedService() : "user-service")
                .ownerContext(request.ownerContext() != null ? request.ownerContext() : "mohamed-work")
                .build();
        return eventRepository.save(event);
    }

    public Event update(Long id, EventRequest request) {
        Event event = findById(id);
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setLocation(request.location());
        event.setStatus(request.status());
        if (request.createdByUserId() != null) {
            event.setCreatedByUserId(request.createdByUserId());
        }
        return eventRepository.save(event);
    }

    public void delete(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }
}
