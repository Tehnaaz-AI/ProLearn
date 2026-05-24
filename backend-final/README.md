# ProLearn MERN Backend

Node.js + Express + MongoDB backend for the online learning platform.

## Setup

```powershell
cd backend
copy .env.example .env
npm.cmd install
npm.cmd run dev
```

The API runs at `http://localhost:8000`.

Make sure MongoDB is running locally, or update `MONGO_URI` in `.env`.

Seeded accounts are created automatically on first start:

- Admin: `admin@ProLearn.local` / `Admin@123`
- Instructor: `instructor@ProLearn.local` / `Instructor@123`

The seed data includes two courses: one free course and one paid course.

## Payment Note

The local payment flow creates mock Razorpay-style order IDs and verifies them for demo use. Paid courses record a 95% instructor payout and a 5% admin commission. For production, add real Razorpay Checkout on the frontend and verify Razorpay signatures before marking payments as paid.

If `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set, the backend creates real Razorpay orders and verifies the signature sent back from Checkout. A QR data URL is also returned for paid-course payment.

## Instructor Videos

Instructors can attach video links in lesson JSON and upload video files through `POST /api/courses/:id/videos`. Uploaded files are served from `/uploads/videos/...`.
