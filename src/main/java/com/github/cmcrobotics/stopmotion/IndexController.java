package com.github.cmcrobotics.stopmotion;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Controller
public class IndexController {
    @Autowired
    StopMotionConfig config;
    
    ObjectMapper mapper = new ObjectMapper();

    @GetMapping({"/","/index","/index.html"})
    public String index(Model model) throws JsonProcessingException {
        model.addAttribute("config", mapper.writeValueAsString((StopMotionConfig) config));
        return "index";
    }

}