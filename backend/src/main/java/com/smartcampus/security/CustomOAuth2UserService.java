package com.smartcampus.security;

import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Value("${app.auth.admin-email-regex:^(?i)admin[0-9]*@smartcampus\\\\.edu$}")
    private String adminEmailRegex;

    @Value("${app.auth.technician-email-regex:^(?i)(tech|technician)[0-9]*@smartcampus\\\\.edu$}")
    private String technicianEmailRegex;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        return processOAuth2User(userRequest, oAuth2User);
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");
        String providerId = (String) attributes.get("sub");

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            user.setName(name);
            user.setProfilePicture(picture);
            user = userRepository.save(user);
        } else {
            Set<Role> roles = resolveRolesForEmail(email);
            user = User.builder()
                    .name(name)
                    .email(email)
                    .profilePicture(picture)
                    .provider("GOOGLE")
                    .providerId(providerId)
                    .roles(roles)
                    .build();
            user = userRepository.save(user);
        }

        return UserPrincipal.create(user, attributes);
    }

    private Set<Role> resolveRolesForEmail(String email) {
        Set<Role> roles = new HashSet<>();
        roles.add(Role.USER);

        if (email != null && email.matches(adminEmailRegex)) {
            roles.add(Role.ADMIN);
        }

        if (email != null && email.matches(technicianEmailRegex)) {
            roles.add(Role.TECHNICIAN);
        }

        return roles;
    }
}
