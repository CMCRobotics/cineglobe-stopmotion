package com.github.cmcrobotics.stopmotion.config;

import java.io.Serializable;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;

import lombok.Data;

@ConfigurationProperties(prefix="stopmotion")
@Data
public class StopMotionConfig implements Serializable {
    private static final long serialVersionUID = -2968261158073338700L;
    public List<Camera> cameras;
    @JsonProperty(access = Access.WRITE_ONLY)
    private String location = "upload-dir";
    
    public Integer framerate = 7;
    
    public String ffmpeg = "ffmpeg";
    public String ffprobe = "ffprobe";
    
    public Integer downloadwait = 3000;
}
