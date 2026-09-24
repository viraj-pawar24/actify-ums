package com.actify.usermanagement.dto;

import com.actify.usermanagement.entity.Task;
import com.actify.usermanagement.entity.TaskStatus;

import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        LocalDateTime createdAt) {

    public static TaskResponse from(Task task) {
        return new TaskResponse(task.getId(), task.getTitle(), task.getDescription(),
                task.getStatus(), task.getCreatedAt());
    }
}
