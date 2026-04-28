package com.attenx.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "forward:/index.html";
    }

    @GetMapping("/api")
    public ResponseEntity<Map<String, String>> apiRoot() {
        return ResponseEntity.ok(Map.of(
                "message", "Use /api/auth/login or /api/auth/register",
                "note", "This application does not expose a generic /api root."
        ));
    }

    @GetMapping("/favicon.ico")
    public ResponseEntity<Void> favicon() {
        return ResponseEntity.noContent().build();
    }
}
