import { NextResponse } from "next/server";

const docs = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CRM Mobile REST API</title>
    <style>
      body { margin: 0; font-family: Arial, sans-serif; color: #111827; background: #f8fafc; }
      main { max-width: 960px; margin: 0 auto; padding: 32px 20px; }
      h1 { margin: 0 0 8px; font-size: 32px; }
      h2 { margin-top: 32px; font-size: 22px; }
      section { border: 1px solid #e5e7eb; border-radius: 8px; background: white; padding: 18px; margin-top: 14px; }
      code, pre { font-family: Consolas, Monaco, monospace; }
      pre { overflow: auto; background: #111827; color: #f9fafb; border-radius: 6px; padding: 14px; }
      .method { display: inline-block; min-width: 52px; font-weight: 700; color: #1d4ed8; }
      .path { font-weight: 700; }
      p { line-height: 1.55; color: #374151; }
    </style>
  </head>
  <body>
    <main>
      <h1>CRM Mobile REST API</h1>
      <p>Use this API from the Expo mobile app. Authenticate with <code>POST /api/auth/login</code>, then send <code>Authorization: Bearer &lt;token&gt;</code> on protected requests.</p>

      <h2>Authentication</h2>
      <section>
        <p><span class="method">POST</span> <span class="path">/api/auth/login</span></p>
        <pre>{
  "email": "demo@example.com",
  "password": "demo12345"
}</pre>
        <p>Returns <code>token</code>, <code>tokenType</code>, <code>expiresIn</code>, and <code>user</code>.</p>
      </section>

      <h2>Customers</h2>
      <section>
        <p><span class="method">GET</span> <span class="path">/api/customers?page=1&pageSize=20</span></p>
        <p>Lists customers assigned to the current sales rep, managed team, or all customers for admins.</p>
      </section>
      <section>
        <p><span class="method">GET</span> <span class="path">/api/customers/[id]</span></p>
        <p>Returns customer details when the authenticated user has access.</p>
      </section>

      <h2>Activities</h2>
      <section>
        <p><span class="method">GET</span> <span class="path">/api/activities?page=1&pageSize=20</span></p>
        <p>Lists active activities, excluding completed and cancelled records.</p>
      </section>
      <section>
        <p><span class="method">GET</span> <span class="path">/api/activities/[id]</span></p>
        <p>Returns activity details.</p>
      </section>
      <section>
        <p><span class="method">POST</span> <span class="path">/api/activities</span></p>
        <pre>{
  "customerId": 1,
  "type": "visit",
  "title": "On-site visit",
  "description": "Discuss renewal",
  "startDate": "2026-06-08T09:00:00.000Z",
  "endDate": "2026-06-08T10:00:00.000Z",
  "nextAction": "Send recap"
}</pre>
      </section>
      <section>
        <p><span class="method">POST</span> <span class="path">/api/activities/[id]/complete</span></p>
        <pre>{
  "outcome": "Customer agreed to review the proposal.",
  "nextAction": "Send revised offer"
}</pre>
      </section>
      <section>
        <p><span class="method">POST</span> <span class="path">/api/activities/[id]/cancel</span></p>
        <p>Cancels an accessible activity.</p>
      </section>
      <section>
        <p><span class="method">POST</span> <span class="path">/api/activities/[id]/follow-up</span></p>
        <pre>{
  "title": "Follow up on offer",
  "type": "phone call",
  "description": "Check decision timeline",
  "startDate": "2026-06-10T12:00:00.000Z",
  "nextAction": "Confirm next meeting"
}</pre>
      </section>
    </main>
  </body>
</html>`;

export async function GET() {
  return new NextResponse(docs, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
