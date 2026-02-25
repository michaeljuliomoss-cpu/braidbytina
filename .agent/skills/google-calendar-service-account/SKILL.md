---
description: How to set up and integrate automated Google Calendar event creation using a GCP Service Account in a Convex/Next.js stack.
---
# Google Calendar Service Account Integration

This skill documents how to allow a web application to automatically create, cancel, and update calendar events directly onto a user's Google Calendar, completely in the background without requiring the user to endure an OAuth flow.

## 1. Google Cloud Platform (GCP) Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Cloud Project (e.g., `calendar-integration`).
3. Enable the **Google Calendar API** for that project.
4. Navigate to **IAM & Admin > Service Accounts**.
5. Create a new Service Account and give it a name like `automated-calendar-bot`.
6. Go to the "Keys" tab for that Service Account, click **Add Key > Create new key**, and choose **JSON**.
7. Download the JSON file. It will contain the `client_email` and the `private_key`.

## 2. Setting Up Environment Variables
Extract the credentials from your downloaded JSON and store them in your Convex environment (both Dev and Prod):
- `GOOGLE_CALENDAR_CLIENT_EMAIL`: e.g., `automated-bot@project-123.iam.gserviceaccount.com`
- `GOOGLE_CALENDAR_PRIVATE_KEY`: The exactly copied private key. *Important:* If copying directly into `.env.local`, ensure real newlines are handled, or `replace(/\\n/g, '\n')` in your code. The preferred method is injecting it directly via `npx convex env set GOOGLE_CALENDAR_PRIVATE_KEY "-----BEGIN PRIVATE KEY-----\nMIIE...-----END PRIVATE KEY-----\n"`.

## 3. Configuring the Target Google Calendar
Before the bot can insert events into *any* calendar, the owner of that calendar must authorize the bot.
1. The calendar owner must open their personal Google Calendar on a desktop browser.
2. Under "My calendars" on the left sidebar, click the three dots next to the target calendar and select **Settings and sharing**.
3. Scroll down to **Share with specific people or groups**.
4. Click **Add people and groups** and paste the exact `client_email` (the Service Account email).
5. Ensure the permission is set to: **"Make changes to events"**.
6. If the event should go to a secondary calendar, scroll to "Integrate calendar" and copy the **Calendar ID** (which looks like a long string of characters). If it's a primary calendar, the Calendar ID is just the user's email address.

## 4. Convex Backend Implementation (`googleapis`)
1. Install the official package: `npm install googleapis` inside the `convex/` folder.
2. In your Convex action file (e.g., `convex/calendarApi.ts`), initialize the client:

```typescript
import { google } from 'googleapis';

function getCalendarClient() {
    const clientEmail = process.env.GOOGLE_CALENDAR_CLIENT_EMAIL!;
    const privateKey = process.env.GOOGLE_CALENDAR_PRIVATE_KEY!;

    const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey.replace(/\\n/g, '\n'), // Crucial to handle escaped newlines
        scopes: ['https://www.googleapis.com/auth/calendar.events']
    });

    return google.calendar({ version: 'v3', auth });
}
```

3. Create action handlers to insert, update, or delete:
```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";

// Multi-calendar support array
const CALENDAR_IDS = ["client@gmail.com", "admin@gmail.com"];

export const createEvent = action({
    args: { 
        appointmentId: v.string(), 
        customerName: v.string(), 
        startTime: v.string(), // ISO String
        endTime: v.string()    // ISO String
    },
    handler: async (ctx, args) => {
        const calendar = getCalendarClient();
        
        const event = {
            summary: `Booking for ${args.customerName}`,
            description: `Automated booking reference: ${args.appointmentId}`,
            start: { dateTime: args.startTime, timeZone: 'America/New_York' },
            end: { dateTime: args.endTime, timeZone: 'America/New_York' },
            extendedProperties: {
                private: { convexAppointmentId: args.appointmentId }
            }
        };

        // Push to multiple calendars simultaneously
        await Promise.all(CALENDAR_IDS.map(async (calendarId) => {
            try {
                await calendar.events.insert({
                    calendarId: calendarId,
                    requestBody: event,
                });
            } catch (err) {
                console.error(`Failed to push to calendar ${calendarId}:`, err);
            }
        }));
    }
});
```

Using `extendedProperties.private.convexAppointmentId` is a best-practice for safely linking and locating Google Calendar events later if you need to cancel or update them on the backend.
