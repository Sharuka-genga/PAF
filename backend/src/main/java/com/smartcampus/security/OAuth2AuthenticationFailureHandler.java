package com.smartcampus.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        log.error("========================================");
        log.error("OAUTH2 AUTHENTICATION FAILURE DETECTED");
        log.error("========================================");
        log.error("Error Message: {}", exception.getMessage());
        log.error("Exception Class: {}", exception.getClass().getName());
        
        if (exception.getCause() != null) {
            log.error("Root Cause Message: {}", exception.getCause().getMessage());
            log.error("Root Cause Class: {}", exception.getCause().getClass().getName());
        }

        // Print the full stack trace to help debugging database or mapping issues
        log.error("Full Stack Trace:", exception);

        String frontendUrl = allowedOrigins.split(",")[0];
        
        // Ensure we gracefully redirect to the frontend with an oauth2 error flag
        String targetUrl = frontendUrl + "/login?error=oauth2";
        log.info("Redirecting user back to frontend: {}", targetUrl);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
