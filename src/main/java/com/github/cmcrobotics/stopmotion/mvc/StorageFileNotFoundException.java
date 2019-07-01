package com.github.cmcrobotics.stopmotion.mvc;

public class StorageFileNotFoundException extends StorageException {
    private static final long serialVersionUID = 1696604398952478852L;

    public StorageFileNotFoundException() {
        super();
    }

    public StorageFileNotFoundException(String message, Throwable cause, boolean enableSuppression,
            boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }

    public StorageFileNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public StorageFileNotFoundException(String message) {
        super(message);
    }

    public StorageFileNotFoundException(Throwable cause) {
        super(cause);
    }

}
