package com.krisaleth.scriptify.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfiguration(
            AuthenticationProvider authenticationProvider,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.authenticationProvider = authenticationProvider;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                // 1. Áp dụng cấu hình CORS mới bên dưới
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 2. Disable CSRF vì tui mình dùng JWT/Stateless
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        // Khi BE có context /api, requestMatchers CHỈ cần ghi phần đuôi
                        .requestMatchers("/auth/**", "/error").permitAll()

                        // ✅ Sửa lỗi 403 cho endpoint /me (vốn cần đăng nhập nhưng load lúc init)
                        .requestMatchers("/user/me").permitAll()

                        // ✅ Cho phép lấy data công khai
                        .requestMatchers("/songs/**", "/artists/**", "/albums/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                        // Tất cả các thao tác khác (Admin, Upload...) yêu cầu đăng nhập
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return httpSecurity.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ QUAN TRỌNG: Thêm http://localhost (Cổng 80 của Nginx) vào danh sách cho phép
        configuration.setAllowedOrigins(List.of(
                "http://localhost",       // Cổng 80 Nginx
                "https://localhost",      // Cổng 443 Nginx
                "http://localhost:3000",  // Dev mode Frontend trực tiếp
                "https://localhost:3000"
        ));

        // ✅ Cho phép tất cả các Header phổ biến
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*")); // Cho phép tất cả header để tránh bị chặn

        // ✅ Cho phép gửi kèm Cookie/Credentials (BẮT BUỘC cho cơ chế xác thực của bồ)
        configuration.setAllowCredentials(true);

        // Expose Header nếu bồ cần đọc Token từ Header phía Client
        configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}