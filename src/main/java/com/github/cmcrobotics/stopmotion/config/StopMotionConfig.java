package com.github.cmcrobotics.stopmotion;

import java.io.Serializable;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.jsonschema.JsonSerializableSchema;

import lombok.Data;

@ConfigurationProperties(prefix="stopmotion")
@Data
public class StopMotionConfig implements Serializable {
    private static final long serialVersionUID = -2968261158073338700L;
    public List<Camera> cameras;
}
