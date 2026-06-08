# ProLearn Backend

This is the backend service for ProLearn. It handles authentication, course management, enrollments, certificates, payments, uploads, and API services for the platform.

## Features

### Authentication

- JWT-based authentication
- Role-based authorization
- Protected API routes
- Student, Instructor, and Admin roles

### Course Management

- Create and manage courses
- Nested sections and lectures
- Enrollment system
- Progress tracking

### Learning Features

- Quiz support
- Certificate generation
- XP and leaderboard integration

### Payment Integration

- Razorpay payment gateway
- Commission management

### Media Uploads

- Cloudinary integration
- Course thumbnail uploads
- Lecture content uploads

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Cloudinary
- Razorpay

## Project Structure

```plaintext
backend/

├── src/
├── uploads/
├── server.js
├── package.json
├── .env.example
└── README.md
```

## Installation

### Install Dependencies

```bash
npm install
```

## Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
PORT=
MONGO_URI=
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
COMMISSION_RATE=
INSTRUCTOR_UPI=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Run Development Server

```bash
npm run dev
```

## Run Production Server

```bash
npm start
```

## Security Recommendations

- Keep environment variables private
- Restrict CORS origins
- Validate uploads
- Enable rate limiting
- Rotate API secrets regularly

## Deployment

Recommended deployment stack:

- Backend Hosting: Render
- Database: MongoDB Atlas
- Media Storage: Cloudinary

## License

This project is for educational and development purposes.