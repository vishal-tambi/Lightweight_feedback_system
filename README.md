# 🚀 Lightweight Feedback System

A modern, secure feedback system for internal team communication between managers and employees. Built with React, Python FastAPI, and MongoDB.

## ✨ Features

### 🔐 Authentication & Roles
- **Two User Roles**: Manager and Employee
- **Secure JWT Authentication**
- **Role-based Access Control**
- **Manager can only see their team members**

### 📝 Feedback Management
- **Structured Feedback Submission**: Strengths, Areas to Improve, Sentiment
- **Multiple Feedback Support**: Multiple feedback entries per employee
- **Feedback History**: Complete timeline for both managers and employees
- **Edit/Update Capability**: Managers can modify past feedback
- **Acknowledgment System**: Employees can acknowledge received feedback

### 📊 Dashboard & Analytics
- **Manager Dashboard**: Team overview, feedback count, sentiment trends
- **Employee Dashboard**: Personal feedback timeline and statistics
- **Real-time Statistics**: Live updates on feedback metrics

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, intuitive user experience
- **Real-time Notifications**: Toast notifications for user actions
- **Loading States**: Smooth loading animations

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications
- **Lucide React** - Beautiful icons
- **Date-fns** - Date formatting utilities

### Backend
- **Python FastAPI** - Modern, fast web framework
- **PyMongo** - MongoDB driver for Python
- **JWT** - JSON Web Token authentication
- **Passlib** - Password hashing with bcrypt
- **Pydantic** - Data validation

### Database
- **MongoDB** - NoSQL database for flexible data storage

### Deployment
- **Docker** - Containerization for easy deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- MongoDB (local or cloud)
- Docker (optional)

### 1. Clone and Setup Frontend

```bash
# Install frontend dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp env.example .env
# Edit .env with your MongoDB URI and secret key

# Start backend server
python main.py
```

The backend API will be available at `http://localhost:8000`

### 3. Setup MongoDB

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env` file

### 4. Using Docker (Optional)

```bash
# Build and run backend with Docker
cd backend
docker build -t feedback-backend .
docker run -p 8000:8000 feedback-backend
```

## 📋 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/
SECRET_KEY=your-super-secret-key-change-this-in-production
```
## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /users/me` - Get current user info

### Users
- `GET /users/team` - Get team members (managers only)

### Feedback
- `POST /feedback` - Create feedback (managers only)
- `GET /feedback` - Get feedback list
- `PUT /feedback/{id}` - Update feedback (managers only)
- `POST /feedback/{id}/acknowledge` - Acknowledge feedback (employees only)

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics

## 👥 User Roles & Permissions

### Manager
- ✅ View team members
- ✅ Create feedback for team members
- ✅ Edit/update their feedback
- ✅ View feedback they've given
- ✅ Access manager dashboard with team statistics

### Employee
- ✅ View feedback they've received
- ✅ Acknowledge feedback
- ✅ Access employee dashboard with personal statistics
- ❌ Cannot see other employees' data
- ❌ Cannot create or edit feedback

## 🎯 Usage Guide

### For Managers

1. **Register as Manager**
   - Go to `/register`
   - Select "Manager" role
   - Complete registration

2. **Add Team Members**
   - Share your Manager ID with employees
   - Employees register using your Manager ID
   - They automatically appear in your team

3. **Provide Feedback**
   - Navigate to "Create Feedback"
   - Select team member
   - Fill in strengths, areas to improve, and sentiment
   - Submit feedback

4. **Monitor Team**
   - View dashboard for team statistics
   - Track feedback trends
   - Manage team performance

### For Employees

1. **Register as Employee**
   - Get Manager ID from your manager
   - Go to `/register`
   - Select "Employee" role
   - Enter your manager's ID

2. **View Feedback**
   - Check dashboard for feedback overview
   - Navigate to "Feedback" to see detailed feedback
   - Acknowledge feedback you've read

3. **Track Progress**
   - Monitor feedback history
   - Track acknowledgment status
   - View performance trends

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Role-based Access**: Strict permission controls
- **Input Validation**: Server-side data validation
- **CORS Protection**: Cross-origin request security
- **Environment Variables**: Secure configuration management

## 🎨 UI Components

- **Responsive Design**: Mobile-first approach
- **Modern Icons**: Lucide React icon library
- **Loading States**: Smooth loading animations
- **Toast Notifications**: User feedback for actions
- **Form Validation**: Real-time form validation
- **Color-coded Feedback**: Visual sentiment indicators

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to your preferred hosting service
# (Vercel, Netlify, AWS S3, etc.)
```

### Backend Deployment
```bash
# Using Docker
docker build -t feedback-backend .
docker run -d -p 8000:8000 feedback-backend

# Or deploy to cloud platforms
# (Heroku, AWS, Google Cloud, etc.)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `http://localhost:8000/docs`
- Review the FastAPI interactive docs

---

**Built with ❤️ using React, FastAPI, and MongoDB**
