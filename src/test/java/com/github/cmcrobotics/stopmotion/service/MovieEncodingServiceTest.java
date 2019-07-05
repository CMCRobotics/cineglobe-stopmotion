package com.github.cmcrobotics.stopmotion.service;

import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.junit.Test;

import com.github.cmcrobotics.stopmotion.config.StopMotionConfig;
import com.github.cmcrobotics.stopmotion.mvc.FileSystemStorageService;

public class MovieEncodingServiceTest {

    @Test
    public void testMovieGeneration() throws IOException, InterruptedException, ExecutionException, TimeoutException {
        StopMotionConfig cfg = new StopMotionConfig();
        String movieIdentifier = "test-movie";
        File tempDir = Files.createTempDirectory("stopmotion-").toFile();
        Files.createDirectory(Paths.get(tempDir.getAbsolutePath(),movieIdentifier));
        cfg.setLocation(tempDir.getAbsolutePath());
        System.out.println(tempDir.getName());
        for(int i = 1 ; i<=5; i++){
            String name = "slide0000"+i+".jpg";
          URL resource = getClass().getResource(name);
          Path dest = Paths.get(tempDir.getAbsolutePath(),movieIdentifier, name);
          Files.copy(new FileInputStream(new File(resource.getPath())),dest );
        }
        FileSystemStorageService fsss = new FileSystemStorageService(cfg);
        MovieEncodingService mes = new MovieEncodingService(cfg, fsss);
        Future<Boolean> encodingJob = mes.dispatch(movieIdentifier, (double) 7);
        
        Boolean result = encodingJob.get(5, TimeUnit.SECONDS);
        assertTrue("Encoding job failed",result);
    }

}
