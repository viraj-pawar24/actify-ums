package com.actify.usermanagement.dto;

import com.actify.usermanagement.validation.StrongPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record CreateUserRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Email format is invalid")
        String email,

        @NotBlank(message = "Password is required")
        @StrongPassword
        String password,

        /** Optional. Defaults to USER when omitted. Values: ADMIN, MANAGER, USER. */
        Set<String> roles) {
}
