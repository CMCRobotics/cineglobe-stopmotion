
class Camera{
    constructor(name, host, port, robotPort, path){
        this.name = name;
        this.host = host;
        this.port = port;
        this.robotPort = robotPort;
        this.path = path;
        this.stepsLeft = 0;
        this.currentStep = 0;
    }
    
    connect(){
        
    }
    
}

export{
    Camera
}