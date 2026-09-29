package com.ai.Resume.analyser.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class resultsDto {
    private Long id;
    private int score;
    private int atsoptimizationscore;
    private String roles;
    private String fileName;
    private String fileData;
    private List<String> pros;
    private List<String> cons;
    private List<String> suggestions;
    private List<Job> jobs;
    private Date createdAt;
}
