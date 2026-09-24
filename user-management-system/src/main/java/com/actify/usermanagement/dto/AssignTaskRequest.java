package com.actify.usermanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AssignTaskRequest(
        @NotNull(message = "userId is required")
        Long userId,

        @NotBlank(message = "Title is required")
        @Size(max = 150, message = "Title must be at most 150 characters")
        String title,

        @Size(max = 1000, message = "Description must be at most 1000 characters")
        String description) {
}
