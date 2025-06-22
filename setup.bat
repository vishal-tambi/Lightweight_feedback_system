@echo off
echo 🚀 Setting up Feedback System...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.11+ first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
npm install

REM Setup backend
echo 🐍 Setting up backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy env.example .env
    echo ⚠️  Please edit backend\.env with your MongoDB URI and secret key
)

cd ..

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Start MongoDB (local or cloud)
echo 2. Update backend\.env with your MongoDB URI
echo 3. Start the backend: cd backend ^&^& python main.py
echo 4. Start the frontend: npm run dev
echo.
echo Or use Docker Compose:
echo docker-compose up -d
echo.
echo Frontend will be available at: http://localhost:5173
echo Backend API will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
pause 