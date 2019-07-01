package com.github.cmcrobotics.stopmotion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.github.cmcrobotics.stopmotion.config.StopMotionConfig;
import com.github.cmcrobotics.stopmotion.config.StorageProperties;

@SpringBootApplication(scanBasePackages={"com.github.cmcrobotics.stopmotion"})
@EnableConfigurationProperties({StopMotionConfig.class, StorageProperties.class})
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
