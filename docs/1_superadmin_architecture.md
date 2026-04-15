# 1. Superadmin Panel Architecture

The Superadmin architecture represents the "God Mode" tier. Its primary function is high-level orchestration, separated cleanly from company-specific tenant data to avoid permission crossover.

```mermaid
flowchart TB
    Client((Superadmin Browser))
    
    subgraph Frontend["Next.js Application Layer"]
        UI_Dash["Dashboard Router"]
        UI_Curriculum["Global Curriculum Manager"]
        UI_Entities["Entity Overview (Command Center)"]
    end

    subgraph Backend["Express API Layer"]
        router["/api/superadmin/*"]
        middleware["RequireRole('superadmin')"]
        controllers["Superadmin Controllers"]
    end

    subgraph Subsystems
        DB[(PostgreSQL Primary)]
        SMTP[Email Automation SMTP]
    end

    Client <--> Frontend
    Frontend <--> |JWT Authenticated Array| Backend
    router --> middleware --> controllers
    controllers <--> |Elevated SQL Queries| DB
    controllers ---> |Triggers Security Alerts| SMTP
```
