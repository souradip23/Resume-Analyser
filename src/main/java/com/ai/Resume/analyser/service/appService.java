package com.ai.Resume.analyser.service;


import com.ai.Resume.analyser.model.*;
import com.ai.Resume.analyser.repository.prevTable;
import com.ai.Resume.analyser.repository.usersTableRepo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.*;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.transaction.Transactional;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class appService {

    @Value("${genKey}")
    private String genKey;

    @Autowired
    private prevTable previousTableRepo;

    @Autowired
    private usersTableRepo usersTableRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public ResponseEntity<?> extract(String roles, MultipartFile file) throws TikaException, IOException, InterruptedException {

        Tika tika = new Tika();
        ByteArrayInputStream inputFile = new ByteArrayInputStream(file.getBytes());
        String extracted = tika.parseToString(inputFile);

        if(extracted.trim().isEmpty() || extracted.length()>5000){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please upload a valid resume");
        }

        String results;
        Client client = Client.builder().apiKey(genKey).build();
        Content content = Content.builder().parts(Part.fromText(extracted), Part.fromText("You are now an advanced enterprise-grade ATS resume checker, brutally honest career auditor, hiring-manager brain, and growth strategist combined. Your task is to analyze the given resume strictly based on industry-level ATS standards and evaluate it for the specified roles. The evaluation should be moderate to strict (not lenient). A resume should only receive a score between 90 and 100 if it is nearly perfect across all aspects and the content is highly relevant to the specified roles. If any section content is irrelevant to the role, give zero points for that section.\n" +
                "\nBefore analyzing, ensure the roles and resume content match each other and that the resume content is actual content of a real resume (refer: 1. rules and instructions). If it is unrelated, simply treat it as irrelevant content and follow the instructions for irrelevant content. " +
                "Analyze this resume for roles: " + roles + "\n" +
                "Resume Content:\n" +
                "\n" +
                "Rules and Instructions:\n" +
                "1. Evaluation Categories and Score Allocation (Total 100 points, conditional on role relevance):\n" +
                "- Contact Information (name, email, phone, LinkedIn/GitHub) – 15 points (always scored if present)\n" +
                "- Professional Summary / Objective – 10 points (only score if aligned with role)\n" +
                "- Skills (hard skills, tools, technologies) – 7 points (zero if skills not relevant to role)\n" +
                "- Education (degree, college, graduation year) – 10 points (score only if relevant for role)\n" +
                "- Achievements / Projects (relevant and measurable) – 15 points (zero if not relevant to role)\n" +
                "- Keywords / ATS readiness – 10 points (score only for role-relevant keywords)\n" +
                "- Formatting / Presentation – 5 points (always scored if well formatted)\n" +
                "- No grammatical or spelling mistakes (deduct 5 points if any) – 10 points\n" +
                "- Basic resume evaluation (must meet ATS parsing requirements) – 10 points (score only if structured properly for role content)\n" +
                "- Professional structure and proper layout – 5 points (always scored if proper layout)\n" +
                "- Skills matched with roles – 8 points (zero if skills do not match role)\n" +
                "\n" +
                "2. ATS Optimization Score (0-100):\n" +
                "- Score separately based on ATS parsing readiness, keyword usage, readability, section clarity, lack of graphics/tables, content relevance, and alignment with target role.\n" +
                "- If resume contains irrelevant content for the role, give 0 for the atsoptimizationscore.\n" +
                "\n" +
                "3. Scoring Philosophy:\n" +
                "- Be strict with scoring.\n" +
                "- A resume should only score 90–100 if nearly flawless and fully relevant to the role.\n" +
                "- If any section content is irrelevant to the role, assign zero points for that section.\n" +
                "- 50–89 → Resume is partially relevant but may lack keywords, formatting, or role alignment.\n" +
                "- Below 50 → Resume has significant relevance or ATS issues.\n" +
                "\n" +
                "4. Evaluation Criteria (industrial ATS rules, all relevance-dependent):\n" +
                "- Proper headings: Contact Information, Summary, Skills, Education, Experience, Projects, Achievements.\n" +
                "- Bullet points for readability.\n" +
                "- No images, graphics, or tables that disrupt ATS parsing.\n" +
                "- Chronological or functional structure.\n" +
                "- Action-oriented language in achievements.\n" +
                "- Only include role-relevant keywords; irrelevant keywords give zero points.\n" +
                "- Balanced hard skills (technical) and soft skills relevant to role.\n" +
                "- Professional formatting: consistent fonts, bold section titles, simple layout.\n" +
                "- Concise, measurable content; no long irrelevant descriptions.\n" +
                "- No spelling or grammar mistakes.\n" +
                "- Education and work history clearly structured with dates and relevant to role.\n" +
                "\n" +
                "5. Irrelevant content:\n" +
                "- If the resume is completely irrelevant to the role, return score and atsoptimizationscore as 0, and empty arrays for pros, cons, and suggestions.\n" +
                "\n" +
                "6. Output Format and Constraints:\n" +
                "- You MUST cover ALL pros and ALL cons found in the resume. Do not truncate or summarize them into a short list.\n" +
                "- the 'pros', 'cons', and 'suggestions' arrays may have different sizes (no of elements) based on resume quality ex : (good resume has more points in 'pros' and bad resume has less points in 'pros') and minimum of 5 elements to 8 elements in each array and also make sure that not all '3 arrays have same sizes' . \n" +
                "- For each individual point, break it down into a short, atomic sentence .\n" +
                "- Inside the 'pros', 'cons', and 'suggestions' arrays, each text string element MUST be strictly under 275 characters and above 50 characters .\n" +
                "- The text strings must contain clean alphanumeric text only.\n" +
                "- Do not include any conversational preambles, introductions, or trailing explanations outside the JSON structure." +
                "{\n" +
                "  \"score\": number,\n" +
                "  \"atsoptimizationscore\": number,\n" +
                "  \"pros\": [array of strings],\n" +
                "  \"cons\": [array of strings],\n" +
                "  \"suggestions\": [array of strings]\n" +
                "}\n"

        )).build();
        while (true) {
            try {
                GenerateContentConfig generateContentConfig = GenerateContentConfig.builder()
                        .temperature(0.0f)
                        .thinkingConfig(
                                ThinkingConfig.builder()
                                        .thinkingLevel(ThinkingLevel.Known.HIGH)
                                        .includeThoughts(true)
                                        .build())
                        .build();
                GenerateContentResponse response = client.models.generateContent("gemini-3.5-flash-lite", content, generateContentConfig);
                results = response.text();
                break;
            } catch (Exception e) {
                Thread.sleep(1500);
                System.out.println(e);
            }
        }
        if ( results!= null && results.startsWith("```")) {
            int firstBrace = results.indexOf("{");
            int lastBrace = results.lastIndexOf("}");
            if (firstBrace != -1 && lastBrace != -1) {
                results = results.substring(firstBrace, lastBrace + 1);
            }
        }

        ObjectMapper objectMapper = new ObjectMapper();
        resultsDto resultsDto = objectMapper.readValue(results, resultsDto.class);
        if (resultsDto.getScore() != 0) {
            String uname = SecurityContextHolder.getContext().getAuthentication().getName();
            String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "Resume.pdf";
            String contentType = file.getContentType() != null ? file.getContentType() : "application/pdf";
            String base64FileData = "data:" + contentType + ";base64," + java.util.Base64.getEncoder().encodeToString(file.getBytes());

            previousTable processedData = new previousTable(
                null,
                uname, 
                resultsDto.getScore(), 
                resultsDto.getAtsoptimizationscore(), 
                roles, 
                originalFileName, 
                base64FileData, 
                resultsDto.getPros(), 
                resultsDto.getCons(), 
                resultsDto.getSuggestions(),
                null
            );
            previousTableRepo.save(processedData);
            usersTable usermod = usersTableRepository.findById(uname).orElse(null);
            if (usermod != null) {
                usermod.setPreviousResults(true);
                usersTableRepository.save(usermod);
            }
            return new ResponseEntity<>("Analysed successfully", HttpStatus.OK);
        }

        return new ResponseEntity<>("Invalid document", HttpStatus.NOT_ACCEPTABLE);


    }

    public ResponseEntity<?> lastReport() {
        String uname = SecurityContextHolder.getContext().getAuthentication().getName();
        List<previousTable> reports = previousTableRepo.findByEmailOrderByIdDesc(uname);
        
        if (reports == null || reports.isEmpty()) {
            migrateOldDataIfPresent(uname);
            reports = previousTableRepo.findByEmailOrderByIdDesc(uname);
        }

        if (reports != null && !reports.isEmpty()) {
            List<resultsDto> dtoList = reports.stream().map(p -> new resultsDto(
                p.getId(),
                p.getScore(),
                p.getAtsoptimizationscore(),
                p.getRoles(),
                p.getFileName(),
                p.getFileData(),
                p.getPros(),
                p.getCons(),
                p.getSuggestions(),
                new ArrayList<>(),
                p.getCreatedAt()
            )).collect(Collectors.toList());
            return ResponseEntity.ok(dtoList);
        } else {
            return new ResponseEntity<>("No previous Analysis", HttpStatus.NOT_FOUND);
        }
    }

    private void migrateOldDataIfPresent(String uname) {
        try {
            List<java.util.Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM previous_table WHERE email = ?", uname);
            for (java.util.Map<String, Object> row : rows) {
                int score = row.get("score") != null ? ((Number) row.get("score")).intValue() : 0;
                int ats = row.get("atsoptimizationscore") != null ? ((Number) row.get("atsoptimizationscore")).intValue() : 0;
                String roles = (String) row.get("roles");
                String fileName = (String) row.get("file_name");
                String fileData = (String) row.get("file_data");

                List<String> pros = new ArrayList<>();
                try {
                    pros = jdbcTemplate.queryForList("SELECT pros FROM previous_table_pros WHERE previous_table_email = ?", String.class, uname);
                } catch (Exception e) {}

                List<String> cons = new ArrayList<>();
                try {
                    cons = jdbcTemplate.queryForList("SELECT cons FROM previous_table_cons WHERE previous_table_email = ?", String.class, uname);
                } catch (Exception e) {}

                List<String> sug = new ArrayList<>();
                try {
                    sug = jdbcTemplate.queryForList("SELECT suggestions FROM previous_table_suggestions WHERE previous_table_email = ?", String.class, uname);
                } catch (Exception e) {}

                previousTable newData = new previousTable(
                    null,
                    uname,
                    score,
                    ats,
                    roles,
                    fileName,
                    fileData,
                    pros,
                    cons,
                    sug,
                    new Date()
                );
                previousTableRepo.save(newData);
            }
        } catch (Exception e) {
            // Ignore if old table does not exist
        }
    }

    public ResponseEntity<?> logout() {
        HttpHeaders headers = new HttpHeaders();
        ResponseCookie cookie = ResponseCookie.from("entrypasstoken", "").httpOnly(true).secure(false).sameSite("Strict").maxAge(0).path("/").build();
        headers.add(HttpHeaders.SET_COOKIE, cookie.toString());
        return new ResponseEntity<>("Successfully loggedOut", headers, HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<?> deleteAccount() {

        try {
            String uname = SecurityContextHolder.getContext().getAuthentication().getName();
            usersTableRepository.deleteById(uname);
            previousTableRepo.deleteByEmail(uname);
            HttpHeaders headers = new HttpHeaders();
            ResponseCookie cookie = ResponseCookie.from("entrypasstoken", "").httpOnly(true).secure(false).sameSite("Strict").maxAge(0).path("/").build();
            headers.add(HttpHeaders.SET_COOKIE, cookie.toString());
            return new ResponseEntity<>("Account deleted successfully", headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to delete", HttpStatus.NOT_FOUND);
        }
    }

    public ResponseEntity<?> tokenValidation() {
        String name = SecurityContextHolder.getContext().getAuthentication().getName();
        usersTable user = usersTableRepository.findById(name).orElse(null);
        if(user == null ){
            return ResponseEntity.badRequest().body("Invalid token");
        }
        loginResponse loginRes = new loginResponse(user.getUsername(), user.getEmail(), user.getPreviousResults());
        return new ResponseEntity<>(loginRes, HttpStatus.OK);
    }
}
