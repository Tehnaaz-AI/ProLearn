# ProLearn Frontend

This is the frontend application for ProLearn, a modern MERN-based e-learning platform. The frontend provides interactive dashboards and learning interfaces for students, instructors, and administrators.

## Features

### Student Features

- User authentication
- Browse and enroll in courses
- Video-based learning
- Progress tracking
- Quiz interface
- Certificate viewing
- XP and leaderboard system

### Instructor Features

- Create and manage courses
- Add lectures and sections
- Upload thumbnails and content
- Track enrolled students

### Admin Features

- User management dashboard
- Instructor approval system
- Analytics and monitoring

## Tech Stack

- React.js
- Vite
- Tailwind CSS
- Axios
- React Router DOM

## Project Structure

```plaintext
frontend/

├── src/
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Installation

### Install Dependencies

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

Application runs on:

```plaintext
http://localhost:5173
```

## Build for Production

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file if required.

Example:

```env
VITE_API_BASE_URL=
```

## Deployment

Recommended deployment platform:

- Frontend Hosting: Vercel

## Production Recommendations

- Use environment variables for API URLs
- Optimize assets and images
- Enable lazy loading
- Test responsive layouts
- Verify backend API connectivity

## Security Recommendations

- Never expose secrets in frontend
- Use HTTPS in production
- Protect sensitive routes

## License

This project is for educational and development purposes.