# CyberShield Guard Exhaustive Use Case Flow

This expanded diagram models the highly detailed interaction loops, email communication triggers, and sequential approval processes mapped between Employees, Company Admins, and Superadmins.

```mermaid
flowchart LR
    %% Style Definitions
    classDef actor fill:#f8fafc,stroke:#cbd5e1,stroke-width:2px,color:#0f172a,shape:circle
    classDef usecase fill:#e0f2fe,stroke:#38bdf8,stroke-width:2px,color:#0c4a6e,rx:20,ry:20
    classDef system fill:#fdf4ff,stroke:#e879f9,stroke-width:2px,color:#701a75,stroke-dasharray: 5 5

    %% Primary Actors
    SA((("👑 Superadmin")))
    A((("🏢 Company Admin")))
    U((("🧑‍💻 Employee (User)")))
    MAIL(("📧 Internal Email System"))

    %% ----------------------------------------------------
    %% Superadmin Boundaries
    %% ----------------------------------------------------
    subgraph SGA["Superadmin Operations (God Mode)"]
        direction TB
        SA1("Secure Login (Fixed ID / MFA)"):::usecase
        SA2("Receive Security Login Alert"):::usecase
        SA3("Approve Admin Registrations"):::usecase
        SA4("Approve Company Entity Creation"):::usecase
        SA5("Approve Custom Assigned Courses"):::usecase
        SA6("Dashboard Impersonation (Redirect to Admin)"):::usecase
    end
    
    %% Direct SA assignments
    SA ---> SA1
    SA1 -.-> |Triggers Notification| SA2
    SA2 -.-> MAIL
    SA ---> SA3
    SA ---> SA4
    SA ---> SA5
    SA ---> SA6

    %% ----------------------------------------------------
    %% Admin Boundaries
    %% ----------------------------------------------------
    subgraph ADMIN_AREA["Admin Operations & Billing"]
        direction TB
        A1("Register Account & Login"):::usecase
        A2("Receive Account Verification Email"):::usecase
        A3("Create Corporate Company Profile"):::usecase
        A4("Complete Stripe Payment Integration"):::usecase
        A5("Formulate New Course Framework"):::usecase
        A6("Create Modules & Publish Course"):::usecase
        A7("Add Employees & Assign Curriculum"):::usecase
        A8("View Employee Progress & Download KPI Reports"):::usecase
    end

    A ---> A1
    A1 -.-> |Requires Authorization| SA3
    SA3 -.-> |Validation Fires| A2
    A2 -.-> MAIL
    
    A ---> A3
    A3 -.-> |Requires Entity Review| SA4
    A ---> A4
    
    A ---> A5
    A5 -.-> |Requires Curriculum Review| SA5
    SA5 -.-> |Unlocks Publishing| A6
    A ---> A6
    
    A ---> A7
    A ---> A8

    %% ----------------------------------------------------
    %% Employee Boundaries
    %% ----------------------------------------------------
    subgraph USER_AREA["Employee Learning Phase"]
        direction TB
        U1("Receive Login Credentials Email"):::usecase
        U2("Login to Training Portal"):::usecase
        U3("Watch Assigned Modules/Courses"):::usecase
        U4("Take Final Assessment (Requires 4/5 Score)"):::usecase
        U5("Download Security Certificate"):::usecase
        U6("Receive Certificate Copy via Email"):::usecase
    end

    A7 -.-> |Onboarding Routine| U1
    U1 -.-> MAIL
    
    U ---> U2
    U ---> U3
    U ---> U4
    U4 -.-> |Achieves 4/5 standard| U5
    U ---> U5
    U5 -.-> |System Dispatch| U6
    U6 -.-> MAIL
```
