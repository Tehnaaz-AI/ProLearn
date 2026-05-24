# ProLearn

ProLearn is a modern full-stack e-learning platform built using the MERN stack. The platform provides an interactive learning experience for students, instructors, and administrators with features like course management, progress tracking, certificates, gamification, and secure payment integration.

## Features

### Student Features

- User authentication and authorization
- Browse and enroll in courses
- Video-based learning system
- Progress tracking
- Quiz and assessment support
- Certificate generation
- XP and leaderboard system
- Responsive student dashboard

### Instructor Features

- Create and manage courses
- Add sections and lectures
- Upload course thumbnails and learning content
- Manage enrolled students
- Track course performance

### Admin Features

- User management
- Instructor approval system
- Platform monitoring
- Payment and commission management

## Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- Axios
- React Router DOM

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### Services

- Cloudinary for media storage
- Razorpay for payment integration

## Project Structure

```plaintext
Prolearn-App/

├── backend/
├── frontend/
└── README.md
```

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd Prolearn-App
```

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
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

## Deployment

Recommended deployment stack:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Security Recommendations

- Keep `.env` private
- Restrict CORS in production
- Use strong JWT secrets
- Rotate exposed API keys
- Validate uploaded files
- Enable rate limiting

## License

This project is for educational and development purposes.