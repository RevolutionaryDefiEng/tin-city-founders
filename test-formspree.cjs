const https = require('https');

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xljdlzwz";

const payload = JSON.stringify({
  organizationName: "Test Organisation",
  contactName: "System Auditor",
  contactEmail: "test@example.com",
  organizationType: "other",
  intendedSupport: "other",
  activationTiming: "exploring",
  message: "This is an automated test to verify the Formspree endpoint is active.",
  _subject: "Partnership Enquiry: Automated Test"
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log(`Sending test payload to ${FORMSPREE_ENDPOINT}...`);

const req = https.request(FORMSPREE_ENDPOINT, options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`\n--- Response from Formspree ---`);
    console.log(`Status Code: ${res.statusCode} ${res.statusMessage}`);
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`✅ SUCCESS! The endpoint is valid and accepting submissions.`);
    } else {
      console.log(`❌ FAILED. Formspree rejected the submission.`);
    }
    
    try {
      const json = JSON.parse(data);
      console.log("Body:", JSON.stringify(json, null, 2));
    } catch (e) {
      console.log("Body:", data);
    }
  });
});

req.on('error', (e) => {
  console.error("\n❌ Network Error:", e.message);
  console.log("This usually means your local network/firewall is blocking the connection.");
});

req.write(payload);
req.end();
