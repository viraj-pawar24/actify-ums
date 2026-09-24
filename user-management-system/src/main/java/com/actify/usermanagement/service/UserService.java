package com.actify.usermanagement.service;

import com.actify.usermanagement.dto.CreateUserRequest;
import com.actify.usermanagement.dto.UpdateUserRequest;
import com.actify.usermanagement.dto.UserResponse;
import com.actify.usermanagement.dto.UserWithTasksResponse;
import com.actify.usermanagement.entity.Role;
import com.actify.usermanagement.entity.User;
import com.actify.usermanagement.exception.DuplicateResourceException;
import com.actify.usermanagement.exception.ResourceNotFoundException;
import com.actify.usermanagement.repository.RoleRepository;
import com.actify.usermanagement.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ---------- Admin operations ----------

    public UserResponse createUser(CreateUserRequest request) {
        String email = normalize(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("A user with email '" + email + "' already exists");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));

        Set<String> requested = (request.roles() == null || request.roles().isEmpty())
                ? Set.of(Role.USER)
                : request.roles();
        user.setRoles(resolveRoles(requested));

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(Long id) {
        return UserResponse.from(findById(id));
    }

    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = findById(id);

        String email = normalize(request.email());
        if (!email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("A user with email '" + email + "' already exists");
        }

        user.setName(request.name().trim());
        user.setEmail(email);
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        return UserResponse.from(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        User user = findById(id);
        userRepository.delete(user); // cascades to the user's tasks
    }

    /** Replaces the user's roles with the given set. */
    public UserResponse assignRoles(Long id, Set<String> roleNames) {
        User user = findById(id);
        user.setRoles(resolveRoles(roleNames));
        return UserResponse.from(userRepository.save(user));
    }

    // ---------- Manager operations ----------

    @Transactional(readOnly = true)
    public List<UserWithTasksResponse> getAllUsersWithTasks() {
        return userRepository.findAll().stream().map(UserWithTasksResponse::from).toList();
    }

    // ---------- Self-service operations ----------

    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        return UserResponse.from(findByEmail(email));
    }

    // ---------- helpers ----------

    User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }

    User findByEmail(String email) {
        return userRepository.findByEmail(normalize(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Set<Role> resolveRoles(Set<String> roleNames) {
        Set<Role> roles = new HashSet<>();
        for (String raw : roleNames) {
            String name = raw.trim().toUpperCase();
            if (name.startsWith("ROLE_")) {
                name = name.substring(5);
            }
            final String lookup = name;
            roles.add(roleRepository.findByName(lookup)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Role not found: " + lookup + " (valid roles: ADMIN, MANAGER, USER)")));
        }
        return roles;
    }

    private String normalize(String email) {
        return email.trim().toLowerCase();
    }
}
