
package cl.vetcloud.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.jwt.*;

import java.util.List;

@Configuration
public class JwtConfig {

    @Bean
    public JwtDecoder jwtDecoder(
            @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
            String issuer,

            @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
            String jwkSetUri,

            @Value("${vetcloud.security.audience}")
            String audience,

            @Value("${vetcloud.security.policy}")
            String policy) {

        NimbusJwtDecoder decoder =
                NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();

        OAuth2TokenValidator<Jwt> issuerValidator =
                JwtValidators.createDefaultWithIssuer(issuer);

        OAuth2TokenValidator<Jwt> audienceValidator = jwt ->
                jwt.getAudience().contains(audience)
                        ? OAuth2TokenValidatorResult.success()
                        : OAuth2TokenValidatorResult.failure(
                            new OAuth2Error(
                                "invalid_token",
                                "Audiencia JWT no válida",
                                null
                            )
                        );

        OAuth2TokenValidator<Jwt> policyValidator = jwt -> {
            String tokenPolicy = jwt.getClaimAsString("tfp");

            if (tokenPolicy == null) {
                tokenPolicy = jwt.getClaimAsString("acr");
            }

            return policy.equalsIgnoreCase(tokenPolicy)
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(
                        new OAuth2Error(
                            "invalid_token",
                            "Política B2C no válida",
                            null
                        )
                    );
        };

        decoder.setJwtValidator(
                new DelegatingOAuth2TokenValidator<>(
                        List.of(
                                issuerValidator,
                                audienceValidator,
                                policyValidator
                        )
                )
        );

        return decoder;
    }
}
