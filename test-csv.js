const https = require('https');

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSq-soguK5YPLMqa4x5Vtsk-heiPhZArBs84u8MzgZhbCxqngm10iukY8e--gUJ8xkh9Gna4bKgHYhn/pub?output=csv";

function parseCsv(text) {
  const rows = [];
  let currentRow = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      if (char === '\r') i++; // skip \n
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  const validRows = rows.filter(row => row.some(cell => cell !== ""));
  if (validRows.length < 2) return [];

  const headers = validRows[0];
  return validRows.slice(1).map((row) => {
    return Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""]));
  });
}

https.get(CSV_URL, (res) => {
  let data = '';
  // Handle redirects
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    console.log("Redirected to:", res.headers.location);
    https.get(res.headers.location, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
         try {
           console.log("Fetched bytes:", data2.length);
           const parsed = parseCsv(data2);
           console.log("Parsed rows:", parsed.length);
           console.log("Sample row:", parsed[0]);
         } catch (e) {
           console.error("Parse error:", e);
         }
      });
    });
    return;
  }
  
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
     try {
       console.log("Fetched bytes:", data.length);
       const parsed = parseCsv(data);
       console.log("Parsed rows:", parsed.length);
       console.log("Sample row:", parsed[0]);
     } catch (e) {
       console.error("Parse error:", e);
     }
  });
}).on('error', (e) => {
  console.error("Fetch error:", e);
});
