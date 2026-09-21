package com.redpen.repository;

import com.redpen.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, String> {
    List<Subject> findByBoardClass(String boardClass);
    List<Subject> findByBoardClassAndStream(String boardClass, String stream);
    Optional<Subject> findByCode(String code);
}
