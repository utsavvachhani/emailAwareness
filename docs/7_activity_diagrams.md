# 7. Comprehensive Activity Diagrams

Visualizes the step-by-step logic loop paths individual actors take.

```mermaid
stateDiagram-v2
    %% Employee Loop
    state "Employee Activity Loop" as Employee {
        [*] --> CheckEmail
        CheckEmail --> PortalLogin
        PortalLogin --> ReadDocuments
        ReadDocuments --> TakeQuiz
        
        state take_quiz <<choice>>
        TakeQuiz --> take_quiz
        take_quiz --> FailScore : Score < 3
        take_quiz --> PassScore : Score >= 3
        
        FailScore --> ReadDocuments
        PassScore --> DownloadPDF
        DownloadPDF --> [*]
    }

    ---

    %% Admin Loop
    state "Admin Payment Activity Loop" as Admin {
        [*] --> Register
        Register --> AwaitApproval
        
        state admin_approve <<choice>>
        AwaitApproval --> admin_approve
        admin_approve --> PortalAccess : Approved
        
        PortalAccess --> SelectStripePlan
        SelectStripePlan --> StripeHostedPage
        StripeHostedPage --> VerifyWebhookSuccess
        VerifyWebhookSuccess --> UnlockFeatures
        UnlockFeatures --> [*]
    }
```
