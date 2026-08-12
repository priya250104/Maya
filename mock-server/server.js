const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));

function buildToolResponse(toolCallId, payload) {
  return {
    results: [
      {
        toolCallId,
        result: JSON.stringify(payload)
      }
    ]
  };
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'maya-kapture-mock-server' });
});

app.post('/webhook', (req, res) => {
  const { message } = req.body || {};

  if (!message || message.type !== 'tool-calls' || !Array.isArray(message.toolCalls)) {
    return res.status(200).json({ status: 'acknowledged' });
  }

  const toolCall = message.toolCalls[0];
  if (!toolCall || !toolCall.function) {
    return res.status(400).json({ error: 'Invalid tool call payload' });
  }

  const { name, arguments: args } = toolCall.function;
  const toolCallId = toolCall.id || 'unknown-call-id';

  console.log(`[Tool Call Received]: ${name}`, args);

  let response = { success: false, message: 'Unknown function call' };

  switch (name) {
    case 'verify_customer': {
      const allowedCodes = ['1234', '1995'];
      const verificationCode = String(args?.verification_code || '');

      if (allowedCodes.includes(verificationCode)) {
        response = {
          verified: true,
          customer_name: 'Rahul Sharma',
          message: 'Identity verified successfully.'
        };
      } else {
        response = {
          verified: false,
          customer_name: null,
          message: 'Verification failed. Incorrect code.'
        };
      }
      break;
    }

    case 'log_promise_to_pay': {
      response = {
        success: true,
        ptp_id: `PTP-${Math.floor(1000 + Math.random() * 9000)}`,
        confirmed_date: args?.ptp_date || null,
        amount: Number(args?.amount || 0)
      };
      break;
    }

    case 'send_payment_link': {
      response = {
        success: true,
        message: `Payment link sent successfully via ${args?.channel || 'SMS'} to registered mobile number.`
      };
      break;
    }

    case 'escalate_to_agent': {
      response = {
        success: true,
        escalation_id: `ESC-${Math.floor(1000 + Math.random() * 9000)}`,
        reason: args?.reason || 'UNKNOWN',
        queued: true
      };
      break;
    }

    case 'mark_disposition': {
      response = {
        success: true,
        disposition_logged: args?.status || 'UNKNOWN',
        timestamp: new Date().toISOString()
      };
      break;
    }

    default:
      break;
  }

  return res.status(200).json(buildToolResponse(toolCallId, response));
});

app.listen(PORT, () => {
  console.log(`Kapture Mock Collections Webhook Server running on port ${PORT}`);
});
