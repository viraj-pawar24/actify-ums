package com.actify.usermanagement.service;

import com.actify.usermanagement.dto.AssignTaskRequest;
import com.actify.usermanagement.dto.TaskResponse;
import com.actify.usermanagement.entity.Task;
import com.actify.usermanagement.entity.User;
import com.actify.usermanagement.exception.ResourceNotFoundException;
import com.actify.usermanagement.repository.TaskRepository;
import com.actify.usermanagement.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public TaskResponse assignTask(AssignTaskRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + request.userId()));

        Task task = new Task();
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setAssignedTo(user);
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksForUser(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return taskRepository.findByAssignedToId(user.getId()).stream().map(TaskResponse::from).toList();
    }
}
