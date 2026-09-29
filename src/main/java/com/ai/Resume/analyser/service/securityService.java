package com.ai.Resume.analyser.service;

import com.ai.Resume.analyser.jwt.jwtService;
import com.ai.Resume.analyser.mail.mailService;
import com.ai.Resume.analyser.model.*;
import com.ai.Resume.analyser.repository.otpVerifyRepo;
import com.ai.Resume.analyser.repository.usersTableRepo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.util.Date;

@Service
public class securityService {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

    @Autowired
    private jwtService jwt;

    @Autowired
    private AuthenticationProvider authenticationProvider;

    @Autowired
    private usersTableRepo usersTableRepository;

    @Autowired
    private mailService mailservice;
    @Autowired
    private otpVerifyRepo otpVerifyRepository;

    public ResponseEntity<?> register(userRegister reg) {
        if (reg.getEmail() == null || reg.getPassword() == null) {
            return new ResponseEntity<>("Email and Password are required", HttpStatus.BAD_REQUEST);
        }
        String cleanEmail = reg.getEmail().trim().toLowerCase();

        // Verify OTP if an OTP request was initiated
        otpVerify otpRecord = otpVerifyRepository.findById(cleanEmail).orElse(null);
        if (otpRecord != null) {
            if (reg.getVerifyotp() == null || !otpRecord.getVerifyOtp().equals(reg.getVerifyotp())) {
                return new ResponseEntity<>("Invalid OTP", HttpStatus.BAD_REQUEST);
            }
            if (otpRecord.getVerifyExpiration().before(new Date())) {
                return new ResponseEntity<>("OTP Expired", HttpStatus.BAD_REQUEST);
            }
        }

        if (!usersTableRepository.existsById(cleanEmail)) {
            usersTable newUser = usersTable.builder()
                    .username(reg.getUsername() != null ? reg.getUsername().trim() : "")
                    .email(cleanEmail)
                    .password(passwordEncoder.encode(reg.getPassword()))
                    .previousResults(false)
                    .resetOtp(null)
                    .resetExpiration(null)
                    .build();
            usersTableRepository.save(newUser);
            otpVerifyRepository.deleteById(cleanEmail);
            return new ResponseEntity<>("Successfully created for " + newUser.getUsername(), HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>("Email already Registered", HttpStatus.CONFLICT);
        }
    }

    public ResponseEntity<?> verifyEmail(@Valid verifyEmailOtp verifyEmail) {
        String cleanEmail = verifyEmail.getEmail().trim().toLowerCase();

        System.out.println("=== DEBUG: SIGN UP EMAIL CHECK ===");
        System.out.println("Checking email: '" + cleanEmail + "'");
        boolean exists = usersTableRepository.existsById(cleanEmail);
        System.out.println("Exists in DB: " + exists);
        System.out.println("=================================");

        if (!exists) {
            SecureRandom secure = new SecureRandom();
            String otp = String.valueOf(secure.nextInt(900000) + 100000);
            otpVerify otpverify = new otpVerify(cleanEmail, otp,
                    new Date(System.currentTimeMillis() + 10 * 60 * 1000));
            try {
                mailservice.sentVerifyOtp(verifyEmail.getUsername(), cleanEmail, otp);
            } catch (Exception e) {
                System.out.println("=== [WARNING] SMTP Mail Sending Failed! ===");
                System.out.println("Error: " + e.getMessage());
                System.out.println("Bypassing mail delivery for local testing. Your OTP is: " + otp);
                System.out.println("==========================================");
            }
            otpVerifyRepository.save(otpverify);
            return new ResponseEntity<>("OTP sent successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Email already Registered", HttpStatus.CONFLICT);
        }
    }

    public ResponseEntity<?> login(@Valid userLogin req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();

        System.out.println("\n==========================================");
        System.out.println("=== DEBUG LOGIN ATTEMPT ===");
        System.out.println("Attempting login for email: '" + cleanEmail + "'");
        usersTable user = usersTableRepository.findById(cleanEmail).orElse(null);
        if (user == null) {
            System.out.println("--> RESULT: User NOT FOUND in DB for email: '" + cleanEmail + "'");
            try {
                System.out.println("--> Existing emails in DB: " +
                        usersTableRepository.findAll().stream().map(usersTable::getEmail).toList());
            } catch (Exception e) {
                System.out.println("--> Failed to list DB users: " + e.getMessage());
            }
        } else {
            System.out.println("--> RESULT: User FOUND in DB. Stored Email: '" + user.getEmail() + "'");
            System.out.println("--> Stored Password Hash: " + (user.getPassword() != null
                    ? user.getPassword().substring(0, Math.min(15, user.getPassword().length())) + "..."
                    : "NULL"));
            boolean matches = passwordEncoder.matches(req.getPassword(), user.getPassword());
            System.out.println("--> Password Matches BCrypt Hash? " + matches);
        }
        System.out.println("==========================================\n");

        try {
            authenticationProvider
                    .authenticate(new UsernamePasswordAuthenticationToken(cleanEmail, req.getPassword()));
            String token = jwt.generateToken(cleanEmail);
            HttpHeaders headers = new HttpHeaders();
            ResponseCookie cookie = ResponseCookie.from("entrypasstoken", token).path("/").httpOnly(true)
                    .maxAge(20 * 24 * 60 * 60).sameSite("Strict").secure(false).build();
            headers.add(HttpHeaders.SET_COOKIE, cookie.toString());
            loginResponse loginRes = new loginResponse(user.getUsername(), user.getEmail(), user.getPreviousResults());
            return new ResponseEntity<>(loginRes, headers, HttpStatus.OK);
        } catch (Exception e) {
            System.out.println("=== LOGIN FAILED EXCEPTION ===");
            System.out.println("Error Type: " + e.getClass().getName());
            System.out.println("Error Message: " + e.getMessage());
            System.out.println("==============================");
            return new ResponseEntity<>("Invalid credentials ", HttpStatus.UNAUTHORIZED);
        }
    }

    public ResponseEntity<?> sentResetOtp(@Valid resetOtp req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        usersTable user = usersTableRepository.findById(cleanEmail).orElse(null);
        if (user == null) {
            return new ResponseEntity<>("Invalid Email address", HttpStatus.UNAUTHORIZED);
        }
        SecureRandom secure = new SecureRandom();
        String otp = String.valueOf(secure.nextInt(900000) + 100000);
        user.setResetOtp(otp);
        user.setResetExpiration(new Date(System.currentTimeMillis() + 10 * 60 * 1000));
        usersTableRepository.save(user);
        try {
            mailservice.sentResetOtp(user.getUsername(), cleanEmail, otp);
        } catch (Exception e) {
            System.out.println("=== [WARNING] SMTP Reset Password Mail Sending Failed! ===");
            System.out.println("Error: " + e.getMessage());
            System.out.println("Bypassing mail delivery for local testing. Your Password Reset OTP is: " + otp);
            System.out.println("==========================================");
        }
        return new ResponseEntity<>("OTP sent successfully", HttpStatus.OK);
    }

    public ResponseEntity<?> verifyResetOtp(@Valid resetOtpVerification req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        usersTable user = usersTableRepository.findById(cleanEmail).orElse(null);
        if (user == null) {
            return new ResponseEntity<>("Unauthorised request", HttpStatus.UNAUTHORIZED);
        }
        if (!user.getResetOtp().equals(req.getOtp())) {
            return new ResponseEntity<>("Invalid OTP", HttpStatus.NOT_ACCEPTABLE);
        }
        if (user.getResetExpiration().before(new Date(System.currentTimeMillis()))) {
            return new ResponseEntity<>("OTP Expired", HttpStatus.NOT_ACCEPTABLE);
        }
        return new ResponseEntity<>("Verified OTP", HttpStatus.OK);
    }

    public ResponseEntity<?> resetAccountPassword(@Valid resetPasscode req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        usersTable user = usersTableRepository.findById(cleanEmail).orElse(null);
        if (user == null) {
            return new ResponseEntity<>("Unauthorised request", HttpStatus.UNAUTHORIZED);
        }
        if (!user.getResetOtp().equals(req.getOtp())) {
            return new ResponseEntity<>("Invalid OTP", HttpStatus.NOT_ACCEPTABLE);
        }
        if (user.getResetExpiration().before(new Date(System.currentTimeMillis()))) {
            return new ResponseEntity<>("OTP Expired", HttpStatus.NOT_ACCEPTABLE);
        }
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setResetOtp(null);
        user.setResetExpiration(null);
        usersTableRepository.save(user);
        return new ResponseEntity<>("Password changed successfully", HttpStatus.OK);

    }
}
