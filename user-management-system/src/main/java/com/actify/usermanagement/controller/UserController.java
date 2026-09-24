package com.actify.usermanagement.controller;

import com.actify.usermanagement.dto.TaskResponse;
import com.actify.usermanagement.dto.UserResponse;
import com.actify.usermanagement.service.TaskService;
import com.actify.usermanagement.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Any authenticated user. Only ever returns data for the caller (identity comes from the JWT). */
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final TaskService taskService;

    public UserController(UserService userService, TaskService taskService) {
        this.userService = userService;
        this.taskService = taskService;
    }

    @GetMapping("/me")
    public UserResponse myProfile(Authentication authentication) {
        return userService.getProfile(authentication.getName());
    }

    @GetMapping("/tasks")
    public List<TaskResponse> myTasks(Authentication authentication) {
        return taskService.getTasksForUser(authentication.getName());
    }
}
