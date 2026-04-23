package com.learnivo.demo.dto;

import java.util.List;

/**
 * Réponse paginée pour les listes (recherche avancée + pagination).
 */
public record PageResponse<T>(
        List<T> content,
        long totalElements,
        int totalPages,
        int number,
        int size,
        boolean first,
        boolean last
) {}
