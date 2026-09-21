package com.redpen.service;

import com.redpen.dto.PaperDto;
import com.redpen.entity.Paper;
import com.redpen.exception.ApiException;
import com.redpen.repository.PaperRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaperService {

    private final PaperRepository repository;

    public PaperService(PaperRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<PaperDto> listForStudent(String studentId) {
        return repository.findByStudentIdOrderByCreatedAtDesc(studentId).stream()
                .map(PaperDto::from)
                .toList();
    }

    @Transactional
    public PaperDto create(String studentId, PaperDto.CreateRequest req) {
        Paper paper = Paper.builder()
                .studentId(studentId)
                .boardClass(req.boardClass())
                .subject(req.subject())
                .paperNumber(req.paperNumber())
                .build();
        return PaperDto.from(repository.save(paper));
    }

    @Transactional(readOnly = true)
    public PaperDto getById(String studentId, String id) {
        Paper paper = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PAPER_NOT_FOUND", "Paper not found."));
        if (!paper.getStudentId().equals(studentId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "PAPER_FORBIDDEN", "You do not have access to this paper.");
        }
        return PaperDto.from(paper);
    }
}
