# ProLearn

ProLearn is a full-stack online learning platform built using the MERN stack. The platform allows students to enroll in courses, track progress, earn certificates, and participate in gamified learning experiences. Instructors can create and manage courses, while administrators can monitor platform activity and manage users.

## Features

### Student Features

- User authentication and authorization
- Browse and search courses
- Course enrollment
- Video-based learning
- Progress tracking
- Quiz and assessment system
- Certificate generation
- XP and leaderboard system
- User profile management

### Instructor Features

- Create and manage courses
- Add sections and lectures
- Upload course thumbnails and content
- Track enrolled students
- Manage quizzes and assignments

### Admin Features

- User management
- Instructor approval system
- Payment and commission monitoring
- Platform analytics and management

## Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### Services

- Cloudinary for media uploads
- Razorpay for payment integration

## Project Structure

```
Prolearn-App/

├── backend/
│   ├── src/
│   ├── uploads/
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd Prolearn-App
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory.

Example:

```env
PORT=8000
MONGO_URI=
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Start backend server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Start frontend server:

```bash
npm run dev
```

## Production Build

Frontend build:

```bash
npm run build
```

## Environment Variables

The project uses environment variables for:

- Database connection
- JWT authentication
- Payment gateway integration
- Media storage configuration
- Admin credentials

Do not commit `.env` files to the repository.

## Deployment

Recommended deployment stack:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Security Recommendations

- Keep environment variables private
- Use strong JWT secrets
- Restrict CORS in production
- Rotate exposed API keys
- Validate uploaded files
- Enable rate limiting

## Future Improvements

- Live classes
- AI-based recommendations
- Real-time chat system
- Multi-language support
- Mobile application
- Advanced analytics dashboard

## License

This project is for educational and development purposes.