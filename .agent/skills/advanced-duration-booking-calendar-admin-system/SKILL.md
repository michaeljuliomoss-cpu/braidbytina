---
description: Comprehensive guide to building a duration-aware booking system with Google Calendar integration, WhatsApp notifications, website-based deposit flows, and an advanced CMS/Admin UI using Convex and Next.js.
---
# Advanced Duration-Aware Booking, CMS & Admin System

This skill documents how to build a fully-featured booking and content management system. It includes dynamic duration-aware time slots, background Google Calendar integration via Service Accounts, WhatsApp notifications, website-based deposit flows, and an advanced tabbed Admin UI for managing both appointments and website content (CMS).

---

## 1. Duration-Aware Booking Slots
Instead of static time slots, the system generates available slots based on the provider's operating hours and the specific duration of the service being booked.

### Backend (`convex/availability.ts`)
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";
import { format, addMinutes, isBefore, isAfter, startOfDay, addDays, parse } from "date-fns";

export const getAvailableSlots = query({
    args: { date: v.string(), serviceDuration: v.optional(v.string()) }, // e.g. "2026-02-25", "4 Hours", or "60 min"
    handler: async (ctx, args) => {
        // Parse the requested service duration into total minutes (e.g., "1 hr 30 mins" -> 90)
        // ... (parsing logic) ...
        const durationMins = parsedMins;
        
        // Fetch existing, non-cancelled appointments for this date
        const existingAppointments = await ctx.db
            .query("appointments")
            .withIndex("by_date", (q) => q.eq("date", args.date))
            .filter(q => q.neq(q.field("status"), "cancelled"))
            .collect();
            
        // Calculate blocked intervals based on existing bookings and their durations
        const blockedIntervals = existingAppointments.map(app => { /* Convert '09:00 AM' start time to Date, add duration */ });
        
        // Generate possible slots between operating hours (e.g., 9:00 AM - 6:00 PM) at 30-minute intervals
        const possibleSlots = ["09:00 AM", "09:30 AM", "10:00 AM" /* ... */ ];
        
        // Filter slots where the [slot start -> slot start + duration] overlaps with ANY blocked interval
        // AND ensure the service finishes before closing time (6:00 PM)
        return possibleSlots.filter(slot => { /* overlap logic */ });
    }
});
```

### Frontend (`BookingFlow.tsx` / `BookingModal.tsx`)
- Maintain a multi-step modal: **1. Select Service** -> **2. Select Date & Time** -> **3. Enter Info**.
- Pass the selected service's duration to the query: `const slots = useQuery(api.availability.getAvailableSlots, { date, serviceDuration })`.
- Restrict selection of past dates and fully booked days using a UI calendar component (like `react-day-picker`).

---

## 2. Google Cloud Platform (GCP) Service Account Setup
To allow the application to automatically create and delete Google Calendar events without prompting the frontend user for OAuth access.

1. Create a GCP Project and enable the **Google Calendar API**.
2. Create a **Service Account** and download the JSON key.
3. Save the `client_email` and `private_key` to Convex Environment Variables (`GOOGLE_CALENDAR_CLIENT_EMAIL` and `GOOGLE_CALENDAR_PRIVATE_KEY`). Handle newlines in the private key correctly (`.replace(/\\n/g, '\n')`).
4. **CRITICAL:** The target Calendar Owner must open their Google Calendar, go to Settings -> "Share with specific people or groups", add the Service Account's email, and give it **"Make changes to events"** permission.

---

## 3. Google Calendar API Implementation (`convex/calendarApi.ts`)
Use the `googleapis` package in a Node.js runtime action to interact with the calendar.

```typescript
"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { google } from 'googleapis';

function getCalendarClient() {
    const auth = new google.auth.JWT({
        email: process.env.GOOGLE_CALENDAR_CLIENT_EMAIL!,
        key: process.env.GOOGLE_CALENDAR_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/calendar.events']
    });
    return google.calendar({ version: 'v3', auth });
}

export const createEvent = internalAction({
    args: { appointmentId: v.id("appointments"), serviceName: v.string(), customerName: v.string(), date: v.string(), timeSlot: v.string(), duration: v.string() },
    handler: async (ctx, args) => {
        const calendar = getCalendarClient();
        // Calculate ISO start and end strings based on date + timeSlot + duration
        
        await calendar.events.insert({
            calendarId: "owner@gmail.com",
            requestBody: {
                summary: `${args.serviceName} - ${args.customerName}`,
                start: { dateTime: startIso, timeZone: "America/New_York" },
                end: { dateTime: endIso, timeZone: "America/New_York" },
                // Store the internal Convex ID to easily find and delete this event later
                extendedProperties: { private: { convexAppointmentId: args.appointmentId } }
            }
        });
    }
});
```

To delete the event later, use the `privateExtendedProperty` search filter so you don't need to store the Google Event ID in your database:
```typescript
const searchResponse = await calendar.events.list({
    calendarId,
    privateExtendedProperty: [`convexAppointmentId=${args.appointmentId}`]
});
if (searchResponse.data.items?.length) {
    await calendar.events.delete({ calendarId, eventId: searchResponse.data.items[0].id! });
}
```

---

## 4. Notifications & Website-Based Deposit Flow

### WhatsApp HTTP Integration (`convex/whatsapp.ts`)
Provide instant notifications to the business owner via WhatsApp for fast response times.
```typescript
export const sendWhatsAppNotification = action({
    args: { customerName: v.string(), serviceName: v.string(), date: v.string(), timeSlot: v.string() },
    handler: async (ctx, args) => {
        const message = `🚨 *NEW BOOKING* 🚨\nName: ${args.customerName}\nService: ${args.serviceName}\nDate: ${args.date} at ${args.timeSlot}\n\nPlease check the admin dashboard.`;
        await fetch(process.env.WHATSAPP_API_URL!, {
            method: "POST",
            body: JSON.stringify({ to: process.env.WHATSAPP_GROUP_ID, body: message }),
            headers: { "Content-Type": "application/json" }
        });
    }
});
```

### Website-Based Deposit Flow
Instead of integrating complicated Stripe/PayPal checkout flows directly into the booking modal:
1. When a user books, the appointment is saved as `"pending"`.
2. The user is redirected to a success page or receives an automated email that contains a **"View Deposit Instructions"** link.
3. This link goes directly to a dedicated `/deposit` or `/policy` page on the website.
4. **Benefit:** Drives traffic back to the website, ensures the user reads the strict cancellation/deposit policies, and allows the owner to manually verify CashApp/Zelle/Venmo payments before confirming the appointment in the Admin UI.

---

## 5. Advanced Admin UI & CMS (`app/admin/page.tsx`)

A holistic Admin Dashboard built with `lucide-react` icons and a tabbed interface (`@radix-ui/react-tabs`) to manage both bookings and site content.

### Structure & Layout
1. **Secure Login Guard:** A simple username/password state guard (or Clerk integration) protecting the route.
2. **Top Navigation:** Contains a quick "View Site" button and "Logout" button.
3. **Tabbed Interface:** Categories such as "Appointments", "Hero", "About", "Services", "Portfolio", and "Settings".

### Key CMS Features
- **Direct Image Uploads:** Utilizes Convex's `generateUploadUrl` and `storage.getUrl` to allow the admin to upload portfolio images and headshots directly from the CMS.
- **Dynamic Services & Categories:** Allows creating, updating, and deleting services (Name, Duration, Price) and Portfolio categories (Title, Cover Image).
- **Text Content Management:** A key-value based CMS structure in the database (`siteContent` table) allows the admin to edit the "About Me" text, hero headlines, and contact info without needing a developer.

### Advanced Appointment Management
- **Status Workflows:**
  - **Pending:** Waiting for manual deposit verification.
  - **Confirmed:** Admin clicks "Confirm" -> Triggers the internal action to create the Google Calendar event.
  - **Completed / Cancelled:** Admin takes action -> Deletes the Google Calendar event to keep the owner's calendar strictly for active, upcoming work.
- **UI Enhancements:**
  - **Sorting:** Fetch all appointments and sort them chronologically (soonest first).
  - **Highlighting:** Use `date-fns` `isSameDay` to check if an appointment `isToday` or `isTomorrow` and apply glowing CSS borders or badges.
  - **Dimming:** Add `opacity-60` to past appointments (`isBefore(appointmentDate, today)`).
  - **Robust Event Handlers:** Use `e.stopPropagation()` on action buttons (Confirm/Cancel/Delete) ensuring they do not trigger underlying card expansion events.
