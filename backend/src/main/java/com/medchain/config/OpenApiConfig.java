package com.medchain.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI medChainOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MedChain API")
                        .description("Production-ready API foundation for MedChain")
                        .version("1.0.0"));
    }
}
