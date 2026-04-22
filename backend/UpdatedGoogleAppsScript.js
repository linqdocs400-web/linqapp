const SHEET_ID = "1ttYEg5VDLyo-Rche3B3HYieIQUrCPPUnXk8sZCIYK04";
const SHEET_NAME = "Sheet1";

function getSheet() {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
}

// ===== GET =====
function doGet() {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();

    const result = data.map(row => {
      let obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      .setHeader("Access-Control-Allow-Headers", "Content-Type");
  } catch (error) {
    Logger.log(error);
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  }
}

// ===== POST =====
function doPost(e) {
  try {
    const sheet = getSheet();
    const body = JSON.parse(e.postData.contents);

    // Check for duplicates (email or phone)
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const emailColumn = headers.indexOf("email");
    const phoneColumn = headers.indexOf("phone");
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][emailColumn] === body.email || data[i][phoneColumn] === body.phone) {
        return ContentService
          .createTextOutput(JSON.stringify({ error: "A user with this email or phone already exists" }))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeader("Access-Control-Allow-Origin", "*");
      }
    }

    // Append new row with college_office field
    sheet.appendRow([
      body.id,
      body.name,
      body.email,
      body.phone,
      body.gender,
      body.has_vehicle,
      body.vehicle_type,
      body.seats,
      body.from,
      body.to,
      body.morning_time,
      body.evening_connect,
      body.evening_time,
      body.message,
      body.travel_frequency,
      body.travel_days,
      body.status,
      body.created_at,
      body.from_lat,
      body.from_lng,
      body.to_lat,
      body.to_lng,
      body.college_office || "" // NEW FIELD - at the end
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", id: body.id }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      .setHeader("Access-Control-Allow-Headers", "Content-Type");
  } catch (error) {
    Logger.log(error);
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  }
}

// ===== OPTIONS (for CORS preflight) =====
function doOptions() {
  return ContentService
    .createTextOutput("")
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
