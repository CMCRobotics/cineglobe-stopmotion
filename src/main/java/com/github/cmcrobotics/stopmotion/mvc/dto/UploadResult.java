package com.github.cmcrobotics.stopmotion.mvc.dto;

import lombok.Data;

@Data
public class UploadResult {
    int fileCount;
    boolean error;
    String errorMessage;
    
    public void inc(){
        fileCount++;
    }
    
    public void error(String msg){
        error = true;
        errorMessage = msg;
    }
}
