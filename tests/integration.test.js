const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../server");

let server;
let base;

test.before(() => {
  server = app.listen(0);
  const port = server.address().port;
  base = `http://127.0.0.1:${port}`;
});

test.after(() => server.close());

test("loads predictable internship records", async () => {
  const response = await fetch(`${base}/api/internships`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.ok(body.data.length >= 4);
});

test("accepts a valid application", async () => {
  const response = await fetch(`${base}/api/applications`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      internshipId: 1,
      name: "Eswar R",
      email: "eswar@example.com",
      phone: "+91 9876543210",
      coverLetter: "I am interested in this internship and would like to learn."
    })
  });
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.success, true);
});

test("rejects invalid application", async () => {
  const response = await fetch(`${base}/api/applications`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      internshipId: 1,
      name: "A",
      email: "not-an-email",
      phone: "1",
      coverLetter: "short"
    })
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.success, false);
});
