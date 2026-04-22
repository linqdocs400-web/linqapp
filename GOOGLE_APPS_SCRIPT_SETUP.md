# Google Apps Script Backend Setup Guide

This guide explains how to set up the Google Apps Script backend for the Linq rideshare application.

## 📋 Prerequisites

1. Google Account
2. Google Sheet with your rideshare data
3. Basic understanding of Google Apps Script

## 🛠️ Setup Steps

### 1. Create Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Delete any default code in the editor

### 2. Add Script Code

Copy the Apps Script code from your local development environment and paste it into the editor.

**Important**: The script includes:
- `doGet()` function for fetching data
- `doPost()` function for submitting new data
- `doOptions()` function for CORS handling
- College/office field support

### 3. Configure Sheet Details

Update these variables in the script:
```javascript
const SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE";
const SHEET_NAME = "YOUR_SHEET_NAME_HERE";
```

To get your Sheet ID:
1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
3. Copy the `[SHEET_ID]` part

### 4. Sheet Structure

Ensure your Google Sheet has these columns in this order:

```
id | name | email | phone | gender | has_vehicle | vehicle_type | seats | from | to | morning_time | evening_connect | evening_time | message | travel_frequency | travel_days | status | created_at | from_lat | from_lng | to_lat | to_lng | college_office
```

**Important**: `college_office` should be the last column.

### 5. Deploy as Web App

1. Click **Deploy → New deployment**
2. Choose **Web app**
3. Set configuration:
   - **Description**: "Linq Rideshare API"
   - **Execute as**: Me (your Google account)
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Authorize** the script when prompted
6. **Copy the Web app URL** (ends with `/exec`)

### 6. Update Frontend Environment

1. Go to your Vercel dashboard
2. Navigate to your project → Settings → Environment Variables
3. Add: `NEXT_PUBLIC_API_URL` with your Web app URL
4. Redeploy your Vercel application

## 🔧 Testing

### Test Web App Directly
1. Paste your Web app URL in browser
2. You should see JSON data from your sheet
3. If you see errors, check the Apps Script execution logs

### Test Frontend Integration
1. Visit your website
2. Check browser console for API calls
3. Verify data loads and college/office search works

## 🚨 Troubleshooting

### Common Issues

**"Authorization required"**
- Redeploy the web app and reauthorize

**"Script function not found"**
- Ensure function names are exactly `doGet()`, `doPost()`, `doOptions()`

**"Access denied"**
- Set "Who has access" to "Anyone" in deployment settings

**"Spreadsheet not found"**
- Verify Sheet ID is correct
- Ensure sheet is shared with "Anyone with link can view"

**CORS errors**
- Apps Script handles CORS automatically
- Ensure you're using the correct deployment URL

**Empty response**
- Check that sheet has data rows
- Verify column headers match exactly

### Debugging

1. Open Apps Script editor
2. Go to **Executions** tab
3. Check error logs and execution history

## 🔄 Maintenance

- Monitor script executions regularly
- Update sheet structure if adding new fields
- Redeploy when making script changes
- Keep backup of your Google Sheet

## 📞 Support

For issues with:
- **Google Apps Script**: Check Google's documentation
- **Sheet setup**: Verify column names and data format
- **Frontend**: Check browser console and Vercel logs

---

**Note**: This backend handles the college/office feature for prioritized ride matching. Ensure your frontend and backend are using the same field names.
