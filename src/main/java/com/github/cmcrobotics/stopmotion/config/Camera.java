package com.github.cmcrobotics.stopmotion.config;

import lombok.Data;

@Data
public class Camera {
  String host;
  Integer port;
  Integer robotPort;
  String path;
  String name;
}
