package com.krisaleth.scriptify.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException e) {
        if ("Account not verified!".equals(e.getMessage())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "code", "ACCOUNT_NOT_VERIFIED",
                    "message", "Tài khoản của bồ chưa xác thực. Điền OTP nhé!"
            ));
        }

        return ResponseEntity.badRequest().body(Map.of(
                "code", "BAD_REQUEST",
                "message", e.getMessage()
        ));
    }
}
