package com.actify.usermanagement.dto;

import com.actify.usermanagement.entity.User;

import java.util.List;
import java.util.Set;

public record UserWithTasksResponse(
        Long id,
        String name,
        String email,
        Set<String> roles,
        List<TaskResponse> tasks) {

    public static UserWithTasksResponse from(User user) {
        return new UserWithTasksResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                UserResponse.roleNames(user),
                user.getTasks().stream().map(TaskResponse::from).toList());
    }
}
