# Specification

## Summary
**Goal:** Add a fully functional Admin Panel, redesign the user-facing frontend to mirror aarthiscan.com's layout for JD Health Lab, and extend the backend with admin-only management functions including image upload support.

**Planned changes:**
- Add a protected `/admin` route with sidebar navigation and header showing "JD Health Lab Admin" and phone number 8886918989
- Admin panel sections: Lab Tests (CRUD), Health Packages (CRUD), Orders (view + status update), Lab Bookings (view), Prescriptions (view + approve/reject)
- Add image upload capability in Add/Edit forms for lab tests and health packages; store image blobs in the backend
- Add backend admin-only Motoko functions: `addLabTest`, `updateLabTest`, `deleteLabTest`, `addHealthPackage`, `updateHealthPackage`, `deleteHealthPackage`, `getAllOrders`, `updateOrderStatus`, `getAllBookings`, `getAllPrescriptions`, `updatePrescriptionStatus` — all guarded by canister controller principal
- Redesign user-facing homepage to match aarthiscan.com layout: prominent header with logo + 8886918989, hero banner with CTA, "Why Choose Us" highlights strip, Health Packages card grid (struck-through market price, discount badge, Book Now/Add to Cart), Individual Tests card grid, "How It Works" 3-step section, testimonials/trust badges, and footer with contact + quick links
- Retain existing green-and-white JD Health Lab color palette throughout

**User-visible outcome:** Users see a redesigned aarthiscan.com-inspired homepage for JD Health Lab with packages, tests, and key sections. Admins can log in at `/admin` to manage tests, packages, orders, bookings, and prescriptions — including uploading images for test and package cards.
