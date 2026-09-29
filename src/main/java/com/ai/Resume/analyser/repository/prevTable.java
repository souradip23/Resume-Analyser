package com.ai.Resume.analyser.repository;

import com.ai.Resume.analyser.model.previousTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface prevTable extends JpaRepository<previousTable, Long> {
    List<previousTable> findByEmailOrderByIdDesc(String email);
    void deleteByEmail(String email);
}
