package com.actify.usermanagement.dto;

import java.util.Set;

public record AuthResponse(
        String token,
        String tokenType,
        long expiresInMs,
        String email,
        Set<String> roles) {
}
