# Maya: Kapture Collections Voice AI Agent

This repository contains the project package for the outbound Voice AI Collections Agent for Kapture Finance. It includes the High-Level Design document, mock webhook server for Vapi tool-calling, tool schemas, and evaluation scenarios for the Maya voicebot.

## Contents

- `docs/HLD_Document.md` — engineer-ready High-Level Design document
- `docs/System_Architecture.png` — architecture flow diagram
- `vapi/system_prompt.txt` — production-ready system prompt for Vapi
- `vapi/tool_definitions.json` — tool definitions for assistant integration
- `mock-server/server.js` — mock Express server for Vapi webhooks
- `mock-server/package.json` — Node.js project definition
- `mock-server/.env.example` — environment variable template
- `tests/test_cases.json` — evaluation matrix for guardrails and edge cases

## Business Objective

Maya is a compliant outbound collections assistant that:

- authenticates the customer before any debt details are disclosed
- handles PTP collection, hardship scenarios, payment-link dispatch, and escalations
- logs dispositions cleanly for downstream collections operations
- enforces guardrails to prevent non-compliant or unverified disclosure

## Architecture Summary

The call flow is:

1. Customer answers the call
2. Vapi telephony pipeline streams audio to Deepgram STT
3. The orchestrator (GPT-4o / GPT-4o-mini) evaluates the current call state
4. Before verification, the agent cannot reveal any debt terms
5. Once `verify_customer(status: success)` returns success, the agent can disclose only approved account details and negotiate payment
6. Tool calls to the mock server log PTP, send a payment link, or escalate the call
7. Final disposition is logged with `mark_disposition`

## Local Setup

### 1. Install dependencies

```bash
cd mock-server
npm install
```

### 2. Configure environment

Copy the example environment file and update values if needed:

```bash
cp .env.example .env
```

### 3. Start the server

```bash
npm start
```

Default local endpoint:

```text
http://localhost:3000/webhook
```

### 4. Expose via ngrok

```bash
ngrok http 3000
```

Then use the created HTTPS URL in your Vapi Tools configuration, e.g.:

```text
https://your-ngrok-subdomain.ngrok-free.app/webhook
```

## Vapi Configuration

Recommended configuration:

- Transcriber: Deepgram `nova-2`
- Model: OpenAI `gpt-4o` or `gpt-4o-mini`
- TTS: ElevenLabs or Cartesia, voice such as Sarah
- Temperature: `0.1`
- First message: `Hello, this is Maya calling from Kapture Finance. Am I speaking with Mr. Rahul Sharma?`

Register the following functions in Vapi:

- `verify_customer`
- `log_promise_to_pay`
- `send_payment_link`
- `escalate_to_agent`
- `mark_disposition`

## Verified Mock Tool Behavior

The mock server validates these sample verification codes:

- `1234`
- `1995`

These simulate identity validation for Rahul Sharma and allow the agent to progress into the collections disclosure phase.

## Test Scenarios

See `tests/test_cases.json` for the evaluation matrix. Key scenarios include:

- authentication gate enforcement
- wrong-person handling
- do-not-call logging
- bilingual switch handling
- promise-to-pay success path
- already-paid call resolution

## Compliance Notes

The system enforces these rules:

- No debt disclosure before successful authentication
- No mention of “overdue”, “loan”, “EMI”, or “Kapture Finance debt” before verification
- Identity confirmation required before account status details are revealed
- DNC/opt-out requests are logged immediately and the call ends
- Unauthorized waivers beyond the permitted threshold are blocked by system prompt guardrails

## Debugging Log / Notes

Common implementation issues to watch for when deploying to Vapi:

- tool schemas must use strict JSON schema and function names that match the assistant instructions exactly
- tool response payloads must be returned in Vapi-compatible `results` format
- the assistant must be prompted to wait for tool outputs before disclosing any sensitive account details
- low-latency TTS/STT tuning is required for the sub-1.2 second target

## Future Enhancements

- add real CRM integration and secure customer record lookups
- add AI sentence-level compliance checks before TTS output
- integrate operator handoff and queue-based escalation workflows
- add DNC registry syncing
- build call analytics dashboards for containment, PTP rate, and FCR

## License

This project is intended for demo and educational use within the Kapture assignment context.
