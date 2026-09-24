package com.actify.usermanagement.config;

import com.actify.usermanagement.entity.Role;
import com.actify.usermanagement.entity.Task;
import com.actify.usermanagement.entity.TaskStatus;
import com.actify.usermanagement.entity.User;
import com.actify.usermanagement.repository.RoleRepository;
import com.actify.usermanagement.repository.TaskRepository;
import com.actify.usermanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

/** Seeds roles, sample users and sample tasks on startup. Safe to run repeatedly (e.g. against MySQL). */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository,
                           TaskRepository taskRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Role admin = ensureRole(Role.ADMIN);
        Role manager = ensureRole(Role.MANAGER);
        Role user = ensureRole(Role.USER);

        createUserIfMissing("Alice Admin", "admin@example.com", "Admin@123", Set.of(admin));
        User manager1 = createUserIfMissing("Mark Manager", "manager@example.com", "Manager@123", Set.of(manager));
        User john = createUserIfMissing("John User", "user@example.com", "User@1234", Set.of(user));
        User jane = createUserIfMissing("Jane Multi", "jane@example.com", "Jane@1234", Set.of(manager, user));

        if (taskRepository.count() == 0) {
            addTask(john, "Prepare weekly report", "Summarise this week's activity", TaskStatus.PENDING);
            addTask(john, "Update documentation", "Refresh the onboarding guide", TaskStatus.IN_PROGRESS);
            addTask(jane, "Review pull requests", "Review open PRs for the API module", TaskStatus.PENDING);
            addTask(manager1, "Plan sprint", "Draft the next sprint backlog", TaskStatus.DONE);
        }

        log.info("Sample logins -> admin@example.com / Admin@123, manager@example.com / Manager@123, "
                + "user@example.com / User@1234, jane@example.com / Jane@1234 (Manager + User)");
    }

    private Role ensureRole(String name) {
        return roleRepository.findByName(name).orElseGet(() -> roleRepository.save(new Role(name)));
    }

    private User createUserIfMissing(String name, String email, String rawPassword, Set<Role> roles) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setName(name);
            u.setEmail(email);
            u.setPassword(passwordEncoder.encode(rawPassword));
            u.setRoles(new HashSet<>(roles));
            return userRepository.save(u);
        });
    }

    private void addTask(User assignee, String title, String description, TaskStatus status) {
        Task t = new Task();
        t.setTitle(title);
        t.setDescription(description);
        t.setStatus(status);
        t.setAssignedTo(assignee);
        taskRepository.save(t);
    }
}
