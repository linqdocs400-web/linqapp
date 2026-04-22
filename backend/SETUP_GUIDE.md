# Backend Setup Guide for College/Office Feature

This guide will help you update your Google Sheets backend to support the new college/office feature.

## Overview
The backend uses Google Sheets as a database with Google Apps Script as the API layer. We need to:
1. Add a new "College/Office" column to the Google Sheet
2. Update the Google Apps Script to handle the new field
3. Deploy the updated script

## Step 1: Update Google Sheet Structure

### Current Columns (in order):
1. id
2. name
3. email
4. phone
5. gender
6. has_vehicle
7. vehicle_type
8. seats
9. from
10. to
11. from_lat
12. from_lng
13. to_lat
14. to_lng
15. morning_time
16. evening_connect
17. evening_time
18. message
19. travel_frequency
20. travel_days
21. **college_office** (NEW - add this column)
22. partner_id
23. status
24. created_at

### Action Required:
1. Open your Google Sheet
2. Insert a new column after "travel_days" (column U)
3. Name this column "college_office"
4. Make sure the column order matches exactly as shown above

## Step 2: Update Google Apps Script

### Option A: Use the Provided Script
1. Open `GoogleAppsScript.js` from the backend folder
2. Copy the entire script
3. Go to your Google Apps Script project
4. Replace the existing code with the new script
5. Update the `SPREADSHEET_ID` and `SHEET_NAME` variables at the top

### Option B: Manual Updates
If you prefer to update your existing script manually, make these changes:

#### 1. Update the headers array in `setupSheet()` function:
```javascript
const headers = [
  "id", "name", "email", "phone", "gender", "has_vehicle", "vehicle_type", "seats",
  "from", "to", "from_lat", "from_lng", "to_lat", "to_lng",
  "morning_time", "evening_connect", "evening_time", "message",
  "travel_frequency", "travel_days", "college_office", // ADD THIS
  "partner_id", "status", "created_at"
];
```

#### 2. Update the `columnIndex` object in `getAllRecords()` function:
```javascript
const columnIndex = {
  // ... existing columns ...
  travel_days: headers.indexOf("travel_days"),
  college_office: headers.indexOf("college_office"), // ADD THIS
  partner_id: headers.indexOf("partner_id"),
  // ... rest of columns ...
};
```

#### 3. Update the record object in `getAllRecords()` function:
```javascript
records.push({
  // ... existing fields ...
  travel_days: row[columnIndex.travel_days] || "",
  college_office: row[columnIndex.college_office] || "", // ADD THIS
  partner_id: row[columnIndex.partner_id] || "",
  // ... rest of fields ...
});
```

#### 4. Update the `createRecord()` function's newRow mapping:
```javascript
const newRow = headers.map(header => {
  switch(header) {
    // ... existing cases ...
    case "travel_days": return params.travel_days || "";
    case "college_office": return params.college_office || ""; // ADD THIS
    case "partner_id": return params.partner_id || "";
    // ... rest of cases ...
  }
});
```

## Step 3: Deploy the Updated Script

### Deploying Google Apps Script:
1. Open your Google Apps Script project
2. Click "Deploy" > "New deployment"
3. Choose "Web app" as the deployment type
4. Set the following:
   - Description: "Linq Rideshare API with College/Office Support"
   - Execute as: "Me" (your Google account)
   - Who has access: "Anyone" (for public access) or "Anyone with Google account"
5. Click "Deploy"
6. Copy the Web app URL - this is your new API endpoint

### Important:
- After deployment, update your `NEXT_PUBLIC_API_URL` environment variable with the new URL
- Test the API endpoints to ensure they work correctly

## Step 4: Test the Integration

### Test 1: Create a new record with college/office
```bash
curl -X POST "YOUR_APPS_SCRIPT_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "college_office": "Test University",
    "from": "Location A",
    "to": "Location B"
  }'
```

### Test 2: Get all records and verify college_office field
```bash
curl "YOUR_APPS_SCRIPT_URL"
```

### Test 3: Update the frontend environment
Make sure your frontend has the correct API URL:
```javascript
// In .env.local or your environment setup
NEXT_PUBLIC_API_URL="YOUR_APPS_SCRIPT_URL"
```

## Step 5: Verify Frontend Integration

Once the backend is updated, the frontend should automatically:
1. Show the college/office field in the search form
2. Accept college/office data in the submission form
3. Display college/office on profile cards
4. Prioritize matches from the same college/office

## Troubleshooting

### Common Issues:
1. **Column mismatch**: Ensure the Google Sheet columns exactly match the script's header array
2. **API errors**: Check the Google Apps Script logs for detailed error messages
3. **CORS issues**: The script includes CORS headers, but verify they're working correctly
4. **Missing data**: Ensure the college_office field is being passed correctly from the frontend

### Debugging Google Apps Script:
1. Open your Apps Script project
2. Click "Executions" to see recent runs and errors
3. Check "Logs" for detailed error messages
4. Test individual functions using the script editor

## Migration for Existing Data

If you have existing data in your sheet:
1. The new college_office column will be empty for existing records
2. This is fine - the frontend handles empty values gracefully
3. Users can update their profiles later to add college/office information

## Security Considerations

1. **Data validation**: The script includes basic validation for duplicate emails/phones
2. **Input sanitization**: Google Apps Script automatically handles most security concerns
3. **Access control**: Consider who should have access to modify the sheet directly

## Next Steps

After completing this setup:
1. Test the full user flow from search to submission
2. Verify that college/office matching works correctly
3. Monitor the Google Sheet for new submissions with college/office data
4. Consider adding analytics to track how many users use the college/office feature

## Support

If you encounter any issues:
1. Check the Google Apps Script execution logs
2. Verify the Google Sheet column order
3. Ensure the frontend API URL is correct
4. Test with the sample curl commands above
