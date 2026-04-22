// Google Apps Script for Linq Rideshare Backend
// This script handles CRUD operations for the Google Sheets database

// Global variables
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE"; // Replace with your actual Google Sheet ID
const SHEET_NAME = "Rideshare Data"; // Replace with your sheet name

// Main function to handle all requests
function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function doPut(e) {
  return handleRequest(e, 'PUT');
}

function doDelete(e) {
  return handleRequest(e, 'DELETE');
}

function handleRequest(e, method) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      return createResponse(500, { error: "Sheet not found" });
    }

    const path = e.pathInfo || "";
    const params = typeof e.parameter === 'string' ? JSON.parse(e.parameter) : e.parameter;

    // Handle different endpoints
    if (method === 'GET' && !path) {
      // GET all records
      const data = getAllRecords(sheet);
      return createResponse(200, data);
    } else if (method === 'GET' && path) {
      // GET specific record
      const record = getRecordById(sheet, path);
      if (record) {
        return createResponse(200, record);
      } else {
        return createResponse(404, { error: "Record not found" });
      }
    } else if (method === 'POST') {
      // POST new record
      const newRecord = createRecord(sheet, params);
      return createResponse(201, newRecord);
    } else if (method === 'PUT' && path) {
      // PUT update record
      const updatedRecord = updateRecord(sheet, path, params);
      if (updatedRecord) {
        return createResponse(200, updatedRecord);
      } else {
        return createResponse(404, { error: "Record not found" });
      }
    } else if (method === 'DELETE' && path) {
      // DELETE record
      const deleted = deleteRecord(sheet, path);
      if (deleted) {
        return createResponse(200, { message: "Record deleted successfully" });
      } else {
        return createResponse(404, { error: "Record not found" });
      }
    } else {
      return createResponse(405, { error: "Method not allowed" });
    }
  } catch (error) {
    Logger.log(error);
    return createResponse(500, { error: error.message });
  }
}

// Helper function to create HTTP response
function createResponse(statusCode, data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type")
    .setHeader("status", statusCode.toString());
}

// Get all records from the sheet
function getAllRecords(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find column indices (updated to include college_office)
  const columnIndex = {
    id: headers.indexOf("id"),
    name: headers.indexOf("name"),
    email: headers.indexOf("email"),
    phone: headers.indexOf("phone"),
    gender: headers.indexOf("gender"),
    has_vehicle: headers.indexOf("has_vehicle"),
    vehicle_type: headers.indexOf("vehicle_type"),
    seats: headers.indexOf("seats"),
    from: headers.indexOf("from"),
    to: headers.indexOf("to"),
    from_lat: headers.indexOf("from_lat"),
    from_lng: headers.indexOf("from_lng"),
    to_lat: headers.indexOf("to_lat"),
    to_lng: headers.indexOf("to_lng"),
    morning_time: headers.indexOf("morning_time"),
    evening_connect: headers.indexOf("evening_connect"),
    evening_time: headers.indexOf("evening_time"),
    message: headers.indexOf("message"),
    travel_frequency: headers.indexOf("travel_frequency"),
    travel_days: headers.indexOf("travel_days"),
    college_office: headers.indexOf("college_office"), // NEW FIELD
    partner_id: headers.indexOf("partner_id"),
    status: headers.indexOf("status"),
    created_at: headers.indexOf("created_at")
  };

  const records = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[columnIndex.id]) { // Skip empty rows
      records.push({
        id: row[columnIndex.id] || "",
        name: row[columnIndex.name] || "",
        email: row[columnIndex.email] || "",
        phone: row[columnIndex.phone] || "",
        gender: row[columnIndex.gender] || "",
        has_vehicle: row[columnIndex.has_vehicle] || "",
        vehicle_type: row[columnIndex.vehicle_type] || "",
        seats: row[columnIndex.seats] || "",
        from: row[columnIndex.from] || "",
        to: row[columnIndex.to] || "",
        from_lat: row[columnIndex.from_lat] || "",
        from_lng: row[columnIndex.from_lng] || "",
        to_lat: row[columnIndex.to_lat] || "",
        to_lng: row[columnIndex.to_lng] || "",
        morning_time: row[columnIndex.morning_time] || "",
        evening_connect: row[columnIndex.evening_connect] || "",
        evening_time: row[columnIndex.evening_time] || "",
        message: row[columnIndex.message] || "",
        travel_frequency: row[columnIndex.travel_frequency] || "",
        travel_days: row[columnIndex.travel_days] || "",
        college_office: row[columnIndex.college_office] || "", // NEW FIELD
        partner_id: row[columnIndex.partner_id] || "",
        status: row[columnIndex.status] || "",
        created_at: row[columnIndex.created_at] || ""
      });
    }
  }
  
  return records;
}

// Get a specific record by ID
function getRecordById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idColumn = headers.indexOf("id");
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idColumn] === id) {
      return getAllRecords(sheet).find(record => record.id === id);
    }
  }
  
  return null;
}

// Create a new record
function createRecord(sheet, params) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idColumn = headers.indexOf("id");
  
  // Generate unique ID
  const newId = Date.now().toString();
  
  // Check for duplicates (phone or email)
  const emailColumn = headers.indexOf("email");
  const phoneColumn = headers.indexOf("phone");
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][emailColumn] === params.email || data[i][phoneColumn] === params.phone) {
      throw new Error("A user with this email or phone already exists");
    }
  }
  
  // Create new row with all fields including college_office
  const newRow = headers.map(header => {
    switch(header) {
      case "id": return newId;
      case "name": return params.name || "";
      case "email": return params.email || "";
      case "phone": return params.phone || "";
      case "gender": return params.gender || "";
      case "has_vehicle": return params.has_vehicle || "";
      case "vehicle_type": return params.vehicle_type || "";
      case "seats": return params.seats || "";
      case "from": return params.from || "";
      case "to": return params.to || "";
      case "from_lat": return params.from_lat || "";
      case "from_lng": return params.from_lng || "";
      case "to_lat": return params.to_lat || "";
      case "to_lng": return params.to_lng || "";
      case "morning_time": return params.morning_time || "";
      case "evening_connect": return params.willing_return || "";
      case "evening_time": return params.return_time || "";
      case "message": return params.message || "";
      case "travel_frequency": return params.travel_frequency || "";
      case "travel_days": return params.travel_days || "";
      case "college_office": return params.college_office || ""; // NEW FIELD
      case "partner_id": return params.partner_id || "";
      case "status": return params.status || "New";
      case "created_at": return params.created_at || new Date().toISOString();
      default: return "";
    }
  });
  
  sheet.appendRow(newRow);
  
  return getRecordById(sheet, newId);
}

// Update an existing record
function updateRecord(sheet, id, params) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idColumn = headers.indexOf("id");
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idColumn] === id) {
      // Update the row with new values
      headers.forEach((header, index) => {
        if (params.hasOwnProperty(header)) {
          data[i][index] = params[header];
        }
      });
      
      // Write the updated data back to the sheet
      sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
      
      return getRecordById(sheet, id);
    }
  }
  
  return null;
}

// Delete a record
function deleteRecord(sheet, id) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idColumn = headers.indexOf("id");
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idColumn] === id) {
      sheet.deleteRow(i + 1); // +1 because sheet rows are 1-indexed
      return true;
    }
  }
  
  return false;
}

// Setup function to create the sheet with proper headers
function setupSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  
  // Set up headers including the new college_office field at the end
  const headers = [
    "id", "name", "email", "phone", "gender", "has_vehicle", "vehicle_type", "seats",
    "from", "to", "morning_time", "evening_connect", "evening_time", "message",
    "travel_frequency", "travel_days", "status", "created_at", "from_lat", "from_lng", 
    "to_lat", "to_lng", "college_office" // NEW FIELD added at the end
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange("A1:Z1").setFontWeight("bold");
  sheet.autoResizeColumns();
  
  Logger.log("Sheet setup completed with college_office field");
}
