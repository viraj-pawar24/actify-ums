package com.actify.usermanagement;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UserManagementApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String login(String email, String password) throws Exception {
        String body = """
                {"email":"%s","password":"%s"}
                """.formatted(email, password);
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asText();
    }

    private String bearer(String email, String password) throws Exception {
        return "Bearer " + login(email, password);
    }

    @Test
    void loginWithValidCredentialsReturnsToken() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@example.com\",\"password\":\"Admin@123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.roles[0]").value("ADMIN"));
    }

    @Test
    void loginWithWrongPasswordIsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@example.com\",\"password\":\"Wrong@123\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointWithoutTokenIsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidTokenIsUnauthorizedWithMessage() throws Exception {
        mockMvc.perform(get("/api/user/me").header("Authorization", "Bearer not.a.jwt"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid JWT token"));
    }

    @Test
    void adminCanListUsers() throws Exception {
        mockMvc.perform(get("/api/admin/users").header("Authorization", bearer("admin@example.com", "Admin@123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].password").doesNotExist());
    }

    @Test
    void regularUserCannotAccessAdminApis() throws Exception {
        mockMvc.perform(get("/api/admin/users").header("Authorization", bearer("user@example.com", "User@1234")))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCannotAccessManagerApis() throws Exception {
        mockMvc.perform(get("/api/manager/users").header("Authorization", bearer("admin@example.com", "Admin@123")))
                .andExpect(status().isForbidden());
    }

    @Test
    void managerCanViewUsersWithTasks() throws Exception {
        mockMvc.perform(get("/api/manager/users").header("Authorization", bearer("manager@example.com", "Manager@123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tasks").isArray());
    }

    @Test
    void userSeesOnlyOwnProfile() throws Exception {
        mockMvc.perform(get("/api/user/me").header("Authorization", bearer("user@example.com", "User@1234")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"));
    }

    @Test
    void duplicateUserIsRejectedWithConflict() throws Exception {
        String auth = bearer("admin@example.com", "Admin@123");
        String body = "{\"name\":\"Dup Person\",\"email\":\"dup@example.com\",\"password\":\"Strong@123\"}";

        mockMvc.perform(post("/api/admin/users").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.roles[0]").value("USER"));

        mockMvc.perform(post("/api/admin/users").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void invalidEmailAndWeakPasswordAreRejected() throws Exception {
        String auth = bearer("admin@example.com", "Admin@123");
        String body = "{\"name\":\"Bad Input\",\"email\":\"not-an-email\",\"password\":\"weak\"}";

        mockMvc.perform(post("/api/admin/users").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.email").exists())
                .andExpect(jsonPath("$.validationErrors.password").exists());
    }
}
