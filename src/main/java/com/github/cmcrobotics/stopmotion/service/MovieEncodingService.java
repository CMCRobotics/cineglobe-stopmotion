package com.github.cmcrobotics.stopmotion.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.logging.Level;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.github.cmcrobotics.stopmotion.config.StopMotionConfig;
import com.github.cmcrobotics.stopmotion.mvc.StorageService;

import lombok.Data;
import lombok.extern.java.Log;

@Service
@Log
@Data
public class MovieEncodingService {

   
    final StopMotionConfig stopMotionConfig;
    
    final StorageService storageService;
    
    protected ExecutorService executorService = Executors.newFixedThreadPool(4);
    
    protected Map<String, Future<Boolean>> encodingJobs = new HashMap<>();
    
    @Autowired
    public MovieEncodingService(StopMotionConfig stopMotionConfig, StorageService storageService) throws IOException{
        this.stopMotionConfig = stopMotionConfig;
        this.storageService = storageService;
    }
    public Future<Boolean> dispatch(final String movieIdentifier, double framerate){
        ProcessBuilder pb = new ProcessBuilder(
                stopMotionConfig.getFfmpeg()
               ,"-y","-v","error"
               ,"-f","image2"
               ,"-s","800x480"
               ,"-r", ""+framerate
               ,"-i",Paths.get(this.stopMotionConfig.getLocation(),movieIdentifier,"slide%05d.jpg").toString()
               ,"-r", "30"
               ,Paths.get(this.stopMotionConfig.getLocation(),movieIdentifier+".mp4").toString())
                .redirectErrorStream(true);
        
        Future<Boolean> future = executorService.submit(() -> {
            try{
                Process process = pb.start();

                BufferedReader reader =
                        new BufferedReader(new InputStreamReader(process.getInputStream()));

                String line;
                while ((line = reader.readLine()) != null) {
                    log.info(line);
                }

                int exitCode = process.waitFor();
                log.info("Movie encoding for "+movieIdentifier+" exited with error code : " + exitCode);
                if(exitCode != 0){
                    throw new RuntimeException("Non-zero exit code for movie encoding - consult logs");
                }
            }catch(Throwable t){
                log.log(Level.SEVERE, "Encoding operation for "+movieIdentifier+" failed", t);
                return false;
            }
            return true;
        });
        // Store the Future result to provide status.
        encodingJobs.put(movieIdentifier, future);
        
        return future;
    }
    
    public Boolean isCompleted(final String movieIdentifier){
        if(encodingJobs.containsKey(movieIdentifier)){
            return encodingJobs.get(movieIdentifier).isDone()|| 
                    encodingJobs.get(movieIdentifier).isCancelled();
        }else{
            throw new IllegalArgumentException("No movie "+movieIdentifier+" has been registered for conversion");
        }
    }
    public Boolean isInError(final String movieIdentifier) throws InterruptedException, ExecutionException{
        return (isCompleted(movieIdentifier) && (!encodingJobs.get(movieIdentifier).get()) );
    }

}
