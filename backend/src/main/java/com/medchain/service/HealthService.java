package com.medchain.service;

import org.springframework.stereotype.Service;

@Service
public class HealthService {
    public String getServiceStatus() {
        return "UP";
    }
}
