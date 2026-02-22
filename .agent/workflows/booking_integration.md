# Implementation Plan: Booking Feature Integration

This plan outlines the steps to integrate a professional booking system (**Acuity Scheduling**) into the BraidsByTina website. This will allow for automated scheduling, deposit collection, and email/SMS notifications.

## 🔗 Recommended Platform: Acuity Scheduling
Acuity Scheduling is chosen for its robust features tailored to service-based businesses like hair styling:
- **Deposit Collection**: Secure appointments with up-front payments via Stripe or PayPal.
- **Service Durations**: Define specific time blocks for each service (e.g., 6 hours for Knotless Braids).
- **Intake Forms**: Collect hair type, length, or inspiration photos before the appointment.
- **Automated Notifications**: Send professional confirmation, reminder, and follow-up emails/SMS.
- **Calendar Sync**: Automatically syncs with the stylist's Google, iCloud, or Outlook calendar.

---

## 📅 Phase 1: Platform Setup (Owner Action Required)
Before integration, the business owner must:
1.  **Create an Account**: Sign up at [AcuityScheduling.com](https://acuityscheduling.com).
2.  **Define Services**: Add braid styles with their respective prices and durations.
3.  **Set Availability**: Configure the weekly working hours and breaks.
4.  **Connect Payments**: Link a Stripe or PayPal account to handle $25 deposits.
5.  **Get Embed Link**: Retrieve the "Client Scheduling Page" URL.

---

## 💻 Phase 2: Technical Integration (Developer Action)

### 1. Dedicated Booking Page
Create a new page `/booking` that serves as the primary portal for scheduling.

- **File**: `src/app/booking/page.tsx`
- **Component**: Create a `BookingWidget` component that safely embeds the Acuity iframe.
- **Customization**: Apply site-specific styling to the container to ensure it feels native to the BraidsByTina design.

### 2. Global CTA Updates
Update navigation and homepage buttons to direct users to the new booking flow.

- **Navbar**: Add/Update "Book Now" CTA.
- **Homepage**: Change "Book Your Style" primary button to point to `/booking`.
- **Service Cards**: Add a "Check Availability" link alongside the WhatsApp option.

### 3. Iframe Optimization
Implement a script to handle iframe resizing to prevent layout shifts and ensure a smooth mobile experience.

---

## 📧 Phase 3: Notification & Feedback Loop
- **Owner Alerts**: Configure Acuity to send a "New Booking" summary email to Tina immediately upon confirmation.
- **Client Reminders**: Set up 24-hour and 2-hour SMS reminders to reduce no-shows.
- **Cancellation Policy**: Display the $25 non-refundable deposit terms clearly on the booking page.

---

## 🚀 Future Enhancements
- **Loyalty Program**: Integrate with tools like Square to offer discounts for repeat clients.
- **Waitlist**: Enable a waitlist feature for fully booked days.
