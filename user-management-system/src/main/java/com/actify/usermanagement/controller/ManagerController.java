package com.actify.usermanagement.controller;

import com.actify.usermanagement.dto.AssignTaskRequest;
import com.actify.usermanagement.dto.TaskResponse;
import com.actify.usermanagement.dto.UserWithTasksResponse;
import com.actify.usermanagement.service.TaskService;
import com.actify.usermanagement.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Manager-only (enforced in SecurityConfig: /api/manager/** requires ROLE_MANAGER). */
@RestController
@RequestMapping("/api/manager")
public class ManagerController {

    private final UserService userService;
    private final TaskService taskService;

    public ManagerController(UserService userService, TaskService taskService) {
        this.userService = userService;
        this.taskService = taskService;
    }

    @GetMapping("/users")
    public List<UserWithTasksResponse> getAllUsersWithTasks() {
        return userService.getAllUsersWithTasks();
    }

    @PostMapping("/tasks")
    public ResponseEntity<TaskResponse> assignTask(@Valid @RequestBody AssignTaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.assignTask(request));
    }
}
