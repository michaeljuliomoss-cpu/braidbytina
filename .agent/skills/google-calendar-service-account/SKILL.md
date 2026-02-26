---
description: How to set up and integrate automated Google Calendar event creation, deletion, and a two-step booking confirmation flow using a GCP Service Account in a Convex/Next.js stack.
---
# Google Calendar Service Account Integration

This skill documents how to allow a web application to automatically create, update, and delete calendar events directly onto a user's Google Calendar, completely in the background without requiring the user to endure an OAuth flow. It also documents the two-step booking confirmation workflow with deposit handling.

---

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
6. If the event should go to a secondary calendar, scroll to "Integrate calendar" and copy the **Calendar ID**. If it's a primary calendar, the Calendar ID is just the user's email address.

## 4. Convex Backend Implementation (`googleapis`)

### Installation
Install the official package inside the `convex/` folder:
```bash
npm install googleapis
```

### Calendar Client Setup (`convex/calendarApi.ts`)
```typescript
"use node";
import { google } from 'googleapis';

const CALENDAR_IDS = ["owner@gmail.com", "admin@gmail.com"]; // Push to multiple calendars
const TIMEZONE = "America/New_York";

function getCalendarClient() {
    const clientEmail = process.env.GOOGLE_CALENDAR_CLIENT_EMAIL!;
    const privateKey = process.env.GOOGLE_CALENDAR_PRIVATE_KEY!;

    const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
        scopes: ['https://www.googleapis.com/auth/calendar.events']
    });

    return google.calendar({ version: 'v3', auth });
}
```

### Creating Events
```typescript
export const createEvent = internalAction({
    args: {
        appointmentId: v.id("appointments"),
        customerName: v.string(),
        serviceName: v.string(),
        date: v.string(),         // "2026-02-25"
        timeSlot: v.string(),     // "09:30 AM"
        duration: v.optional(v.string()),
        // ...other fields
    },
    handler: async (ctx, args) => {
        const calendar = getCalendarClient();
        const startDate = parseDateString(args.date, args.timeSlot);
        const endDate = new Date(startDate.getTime() + durationMins * 60000);

        const event = {
            summary: `${args.serviceName} - ${args.customerName}`,
            start: { dateTime: toLocalIsoString(startDate), timeZone: TIMEZONE },
            end: { dateTime: toLocalIsoString(endDate), timeZone: TIMEZONE },
            extendedProperties: {
                private: { convexAppointmentId: args.appointmentId }
            }
        };

        // Push to all configured calendars
        await Promise.all(CALENDAR_IDS.map(async (calendarId) => {
            await calendar.events.insert({ calendarId, requestBody: event });
        }));
    }
});
```

### Deleting Events
Uses `extendedProperties` to find events by Convex appointment ID, then deletes them from all calendars:
```typescript
export const deleteEvent = internalAction({
    args: { appointmentId: v.id("appointments") },
    handler: async (ctx, args) => {
        const calendar = getCalendarClient();
        await Promise.all(CALENDAR_IDS.map(async (calendarId) => {
            const searchResponse = await calendar.events.list({
                calendarId,
                privateExtendedProperty: [`convexAppointmentId=${args.appointmentId}`]
            });

            if (searchResponse.data.items?.length) {
                const eventId = searchResponse.data.items[0].id!;
                await calendar.events.delete({ calendarId, eventId });
            }
        }));
    }
});
```

### Key Pattern: `extendedProperties`
Using `extendedProperties.private.convexAppointmentId` is the best-practice for safely linking and locating Google Calendar events later. This allows you to find/update/delete events by your internal appointment ID without storing the Google event ID.

---

## 5. Two-Step Booking Confirmation Workflow

### Flow Overview
1. **Customer books** → Appointment created with status `"pending"` → Customer gets "Deposit Required" email with bank details.
2. **Admin confirms** (after receiving deposit) → Status changes to `"confirmed"` → Google Calendar event created → Customer gets confirmation email with calendar links (.ics + Google Calendar URL).
3. **Admin completes or cancels** → Google Calendar event is **deleted** from the calendar.

### Key Files
| File | Role |
|---|---|
| `convex/appointments.ts` | `createAppointment` (pending), `confirmAppointment` (confirmed + GCal + email), `updateAppointmentStatus` (complete/cancel + delete GCal) |
| `convex/calendarApi.ts` | `createEvent`, `updateEventStatus`, `deleteEvent` |
| `convex/emails.ts` | `sendCustomerRequestReceived` (deposit email), `sendCustomerConfirmation` (final email + .ics), `sendCustomerReminder` (1-hr before) |
| `src/app/admin/content/page.tsx` | Admin inputs deposit instructions (banked to `siteContent` table under key `deposit-instructions`) |
| `src/app/admin/appointments/page.tsx` | Admin UI with Confirm / Complete / Cancel buttons |
| `src/components/BookingFlow.tsx` | Customer-facing success screen shows "pending" status |

### Deposit Instructions
Stored in the `siteContent` Convex table under the key `deposit-instructions`. The admin edits this via the Content Dashboard. This value is retrieved by `createAppointment` and passed to the `sendCustomerRequestReceived` email action.

### Customer Email Calendar Links
The confirmation email includes:
- **Google Calendar link**: A URL with query params that pre-fills a new Google Calendar event.
- **.ics file attachment**: A standard calendar format file. When opened on Apple devices it prompts the user to add the event to their existing calendar (it does NOT create a new calendar).

---

## 6. Schema Requirements
The `appointments` table should have a `status` field that supports these values:
- `"pending"` — Waiting for deposit / admin review
- `"confirmed"` — Deposit verified, event on Google Calendar
- `"completed"` — Service finished, event deleted from calendar
- `"cancelled"` — Cancelled, event deleted from calendar

The `siteContent` table should have a record with `key: "deposit-instructions"` for storing the bank/payment details.

---

## 7. Troubleshooting
- **"insufficient permissions"**: The Service Account email hasn't been shared on the target calendar, or the permission isn't "Make changes to events".
- **Escaped newlines**: The `private_key` from the JSON file contains `\n` literal strings. Your code must do `.replace(/\\n/g, '\n')` to convert them to real newlines.
- **Events not appearing**: Check that `CALENDAR_IDS` contains the correct email or Calendar ID, and that the timezone matches expectations.
- **Double bookings**: The `createAppointment` mutation checks for existing non-cancelled appointments on the same date/timeslot before inserting.
