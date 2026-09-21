package com.redpen.controller;

import com.redpen.dto.PaperDto;
import com.redpen.exception.ApiException;
import com.redpen.service.PaperService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/papers")
public class PaperController {

    private final PaperService paperService;

    public PaperController(PaperService paperService) {
        this.paperService = paperService;
    }

    @GetMapping
    public List<PaperDto> list(Authentication auth) {
        return paperService.listForStudent(currentUserId(auth));
    }

    @PostMapping
    public ResponseEntity<PaperDto> create(Authentication auth, @Valid @RequestBody PaperDto.CreateRequest req) {
        PaperDto created = paperService.create(currentUserId(auth), req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public PaperDto get(Authentication auth, @PathVariable String id) {
        return paperService.getById(currentUserId(auth), id);
    }

    private String currentUserId(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Not signed in.");
        }
        return auth.getName();
    }
}
