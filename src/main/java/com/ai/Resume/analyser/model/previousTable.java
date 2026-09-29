package com.ai.Resume.analyser.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "previous_analysis_table")
public class previousTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private int score;
    private int atsoptimizationscore;
    private String roles;

    private String fileName;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String fileData;

    @ElementCollection
    @CollectionTable(name = "analysis_pros", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "pro", length = 450)
    private List<String> pros;

    @ElementCollection
    @CollectionTable(name = "analysis_cons", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "con", length = 450)
    private List<String> cons;

    @ElementCollection
    @CollectionTable(name = "analysis_suggestions", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "suggestion", length = 450)
    private List<String> suggestions;

    @CreationTimestamp
    private Date createdAt;

}
