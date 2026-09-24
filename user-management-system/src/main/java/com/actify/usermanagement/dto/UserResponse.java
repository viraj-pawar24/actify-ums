package com.actify.usermanagement.dto;

import com.actify.usermanagement.entity.Role;
import com.actify.usermanagement.entity.User;

import java.util.Set;
import java.util.TreeSet;

public record UserResponse(
        Long id,
        String name,
        String email,
        Set<String> roles) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), roleNames(user));
    }

    static Set<String> roleNames(User user) {
        Set<String> names = new TreeSet<>();
        for (Role role : user.getRoles()) {
            names.add(role.getName());
        }
        return names;
    }
}
