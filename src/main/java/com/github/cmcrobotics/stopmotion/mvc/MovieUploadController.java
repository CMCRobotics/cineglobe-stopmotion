package com.github.cmcrobotics.stopmotion.mvc;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.github.cmcrobotics.stopmotion.mvc.dto.UploadResult;
import com.github.cmcrobotics.stopmotion.service.MovieEncodingService;

@RestController
public class MovieUploadController {
    @Autowired
    private StorageService storageService;
    @Autowired
    private MovieEncodingService movieEncodingService;

    @PostMapping("/movie/upload")
    public UploadResult uploadMultipleFiles(@RequestParam("uuid") String uuid,
            @RequestParam("files") MultipartFile[] files) {
        UploadResult result = new UploadResult();
        if(uuid.isEmpty()){
            result.error("Please specify a UUID");
        }else{
            try {
                storageService.deleteAll(uuid);
                Arrays.asList(files).forEach(file -> {
                    storageService.store(uuid + "/", file);
                    result.inc();
                });
                movieEncodingService.dispatch(uuid, 7.0);
            } catch (Exception e) {
               result.error(e.getMessage());
            }
        }
        
        return result;
    }
    
    @GetMapping("/movie/get/{movieUuid:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(@PathVariable String movieUuid) {

        Resource file = storageService.loadAsResource(movieUuid+".mp4");
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + file.getFilename() + "\"").contentType(MediaType.APPLICATION_OCTET_STREAM).body(file);
    }
//    @GetMapping("/movie/status.json")
//    public MovieConversionStatus getStatus(@RequestParam("uuid") String uuid){
//        
//    }
}
