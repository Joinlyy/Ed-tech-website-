package com.redpen.repository;

import com.redpen.entity.Paper;
import com.redpen.entity.PaperStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperRepository extends JpaRepository<Paper, String> {
    List<Paper> findByStudentIdOrderByCreatedAtDesc(String studentId);

    List<Paper> findByStatusOrderByCreatedAtAsc(PaperStatus status);
}
