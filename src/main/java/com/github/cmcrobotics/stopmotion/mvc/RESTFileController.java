package com.github.cmcrobotics.stopmotion.mvc;

import java.io.InputStream;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.java.Log;

@RestController
@Log
public class RESTFileController {

    @PostMapping("/send")
    public ResponseEntity<String> uploadData(@RequestParam("film") String filmId, @RequestParam("file") MultipartFile file) throws Exception {

        if (file == null) {
            throw new RuntimeException("You must select the a file for uploading");
        }

        InputStream inputStream = file.getInputStream();
        String originalName = file.getOriginalFilename();
        String name = file.getName();
        String contentType = file.getContentType();
        long size = file.getSize();

        log.info("inputStream: " + inputStream);
        log.info("originalName: " + originalName);
        log.info("name: " + name);
        log.info("contentType: " + contentType);
        log.info("size: " + size);

        // Do processing with uploaded file data in Service layer

        return new ResponseEntity<String>(originalName, HttpStatus.OK);
    }

}