package com.github.cmcrobotics.stopmotion.mvc;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.github.cmcrobotics.stopmotion.config.StopMotionConfig;

@RestController
public class RESTController {
    @Autowired
    StopMotionConfig config;
    
    @GetMapping({"/config.json"})
    public StopMotionConfig index(Model model) throws JsonProcessingException {
        return config;
    }
}
