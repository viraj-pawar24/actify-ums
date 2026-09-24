package com.actify.usermanagement.controller;

import com.actify.usermanagement.dto.AssignRolesRequest;
import com.actify.usermanagement.dto.CreateUserRequest;
import com.actify.usermanagement.dto.UpdateUserRequest;
import com.actify.usermanagement.dto.UserResponse;
import com.actify.usermanagement.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Admin-only (enforced in SecurityConfig: /api/admin/** requires ROLE_ADMIN). */
@RestController
@RequestMapping("/api/admin/users")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    @GetMapping
    public List<UserResponse> getAll() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getOne(@PathVariable Long id) {
        return userService.getUser(id);
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return userService.updateUser(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/roles")
    public UserResponse assignRoles(@PathVariable Long id, @Valid @RequestBody AssignRolesRequest request) {
        return userService.assignRoles(id, request.roles());
    }
}
