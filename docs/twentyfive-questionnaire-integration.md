# TwentyFive → FutureTree Questionnaire Integration

## Overview

When a team member submits the JDA AI Readiness Questionnaire in TwentyFive, send a webhook to FutureTree for storage and analysis.

## Webhook Endpoint

```
POST /api/integrations/twentyfive/webhook
```

## Authentication

Use HMAC-SHA256 signature with the shared webhook secret.

### Required Headers

| Header                   | Description                            |
| ------------------------ | -------------------------------------- |
| `X-TwentyFive-Signature` | HMAC-SHA256 signature of request body  |
| `X-TwentyFive-Timestamp` | Unix timestamp (for replay protection) |
| `X-TwentyFive-Event`     | Event type: `questionnaire_response`   |

### Signature Generation

```typescript
const crypto = require("crypto");

const timestamp = Date.now().toString();
const signature = crypto
  .createHmac("sha256", WEBHOOK_SECRET)
  .update(`${timestamp}.${requestBody}`)
  .digest("hex");
```

## Payload Schema

```typescript
interface WebhookPayload {
  event: "questionnaire_response";
  timestamp: string; // ISO 8601
  correlationId: string; // Unique ID for this submission
  data: QuestionnaireResponseData;
}

interface QuestionnaireResponseData {
  // Respondent info (required)
  respondentId: string; // TwentyFive contact ID
  respondentEmail: string; // Email address
  respondentName?: string; // Optional display name
  respondentRole: "architect" | "designer" | "admin" | "principal" | "other";

  // Company routing (optional, for multi-tenant)
  companyId?: string; // Maps to FutureTree clientContexts.sessionId

  // Metadata
  submittedAt: string; // ISO 8601 timestamp
  questionnaireVersion?: string; // e.g., 'v1', 'v2'

  // Responses (required)
  responses: QuestionnaireResponse[];

  // Pre-calculated scores (optional, FutureTree can calculate if not provided)
  scores?: {
    aiReadinessScore?: number; // 1-100
    sentimentCategory?: "skeptic" | "curious" | "eager";
    adoptionBarriers?: string[];
    highValueOpportunities?: string[];
  };
}

interface QuestionnaireResponse {
  questionId: string; // Unique question identifier
  questionText?: string; // Human-readable question (for logs)
  answerType: "text" | "number" | "scale" | "multiselect" | "boolean";
  answer: string | number | string[] | boolean;
}
```

## Example Payload

```json
{
  "event": "questionnaire_response",
  "timestamp": "2024-12-09T15:30:00Z",
  "correlationId": "resp_abc123",
  "data": {
    "respondentId": "contact_xyz789",
    "respondentEmail": "sarah@jamesdixonarchitect.com",
    "respondentName": "Sarah Chen",
    "respondentRole": "architect",
    "companyId": "jda-main",
    "submittedAt": "2024-12-09T15:29:45Z",
    "questionnaireVersion": "v1",
    "responses": [
      {
        "questionId": "current_ai_usage",
        "questionText": "How much do you currently interact with AI tools?",
        "answerType": "scale",
        "answer": 3
      },
      {
        "questionId": "tasks_using_ai",
        "questionText": "What tasks do you currently use AI for?",
        "answerType": "multiselect",
        "answer": ["research", "email drafting", "image generation"]
      },
      {
        "questionId": "tasks_could_use_ai",
        "questionText": "What tasks could you use AI for?",
        "answerType": "text",
        "answer": "Field reports take forever. Would love help with documentation."
      },
      {
        "questionId": "goals",
        "questionText": "What are your goals for AI adoption?",
        "answerType": "text",
        "answer": "Spend less time on administrative work, more time on design."
      },
      {
        "questionId": "uncertain_tasks",
        "questionText": "What tasks are you uncertain about using AI for?",
        "answerType": "text",
        "answer": "Client presentations - not sure if AI can match our style."
      },
      {
        "questionId": "tasks_not_for_ai",
        "questionText": "What tasks should AI NOT be used for?",
        "answerType": "text",
        "answer": "Final design decisions, client relationship management."
      },
      {
        "questionId": "ai_feeling",
        "questionText": "How do you feel about AI in your work?",
        "answerType": "scale",
        "answer": 4
      }
    ],
    "scores": {
      "aiReadinessScore": 65,
      "sentimentCategory": "curious",
      "adoptionBarriers": ["time_to_learn", "quality_concerns"],
      "highValueOpportunities": ["field_reports", "documentation"]
    }
  }
}
```

## Jesse's 7 Core Questions

The questionnaire is based on Jesse Gugliotta's change management strategy:

| Question ID          | Purpose            | Hidden Strategy                         |
| -------------------- | ------------------ | --------------------------------------- |
| `current_ai_usage`   | Baseline data      | Normalize that everyone uses AI         |
| `tasks_using_ai`     | Current state      | Find existing patterns to build on      |
| `tasks_could_use_ai` | Aspirations        | Surface hidden hopes (motivate)         |
| `goals`              | Success definition | Create shared vision                    |
| `uncertain_tasks`    | Discovery          | Find the gold mine (high-value targets) |
| `tasks_not_for_ai`   | Boundaries         | Establish trust (we won't cross lines)  |
| `ai_feeling`         | Sentiment          | Surface hidden fears (address them)     |

### Additional Questions (Optional)

| Question ID             | Purpose                                   |
| ----------------------- | ----------------------------------------- |
| `ip_ownership_concerns` | Jim's concern about intellectual property |
| `reputation_concerns`   | Professional identity worries             |
| `creative_control`      | Where AI shouldn't override               |
| `quality_expectations`  | Success metrics                           |
| `learning_preferences`  | How to train the team                     |

## Response Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success - response stored            |
| 401  | Invalid signature or missing headers |
| 500  | Server error - check logs            |

## Testing

### Webhook Verification

```bash
curl -X GET "https://futuretree.ai/api/integrations/twentyfive/webhook?challenge=test123"
# Response: {"challenge":"test123"}
```

### Status Check

```bash
curl -X GET "https://futuretree.ai/api/integrations/twentyfive/webhook"
# Response: {"status":"active"}
```

## Notes for TwentyFive Dev

1. **Company ID**: Use `jda-main` for JDA responses. This maps to the pre-seeded client context.

2. **Scores**: If you calculate sentiment scores on the TwentyFive side, include them. Otherwise, FutureTree can calculate them later.

3. **Question IDs**: Use the exact IDs listed above for Jesse's core questions. This ensures consistent analytics.

4. **Replay Protection**: Timestamps older than 5 minutes will be rejected.

5. **Idempotency**: Each `respondentId` + `submittedAt` combination should be unique. Re-sending the same response will create duplicates.
