from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from bson import ObjectId
from datetime import datetime
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Feedback System API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://lightweight-feedback-system.vercel.app"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = MongoClient(os.getenv("MONGODB_URI", "mongodb://localhost:27017/"))
db = client.feedback_system

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"

# Pydantic models
class UserCreate(BaseModel):
    username: str
    password: str
    email: str
    role: str  # "manager" or "employee"
    manager_id: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    manager_id: Optional[str] = None

class FeedbackCreate(BaseModel):
    employee_id: str
    strengths: str
    areas_to_improve: str
    sentiment: str  # "positive", "neutral", "negative"

class FeedbackUpdate(BaseModel):
    strengths: Optional[str] = None
    areas_to_improve: Optional[str] = None
    sentiment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: str
    manager_id: str
    employee_id: str
    strengths: str
    areas_to_improve: str
    sentiment: str
    created_at: datetime
    updated_at: datetime
    acknowledged: bool = False

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(username: str = Depends(verify_token)):
    user = db.users.find_one({"username": username})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Authentication endpoints
@app.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    # Check if username already exists
    if db.users.find_one({"username": user_data.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    user = {
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": hashed_password,
        "role": user_data.role,
        "manager_id": user_data.manager_id
    }
    
    result = db.users.insert_one(user)
    user["id"] = str(result.inserted_id)
    
    return UserResponse(**user)

@app.post("/auth/login")
async def login(user_data: UserLogin):
    user = db.users.find_one({"username": user_data.username})
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "manager_id": user.get("manager_id")
        }
    }

# User endpoints
@app.get("/users/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        username=current_user["username"],
        email=current_user["email"],
        role=current_user["role"],
        manager_id=current_user.get("manager_id")
    )

@app.get("/users/team")
async def get_team_members(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view team members")
    
    team_members = list(db.users.find({"manager_id": str(current_user["_id"])}))
    return [
        {
            "id": str(member["_id"]),
            "username": member["username"],
            "email": member["email"],
            "role": member["role"]
        }
        for member in team_members
    ]

# Feedback endpoints
@app.post("/feedback", response_model=FeedbackResponse)
async def create_feedback(
    feedback_data: FeedbackCreate,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Only managers can create feedback")
    
    # Verify employee exists and belongs to manager
    employee = db.users.find_one({
        "_id": ObjectId(feedback_data.employee_id),
        "manager_id": str(current_user["_id"])
    })
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found or not in your team")
    
    feedback = {
        "manager_id": str(current_user["_id"]),
        "employee_id": feedback_data.employee_id,
        "strengths": feedback_data.strengths,
        "areas_to_improve": feedback_data.areas_to_improve,
        "sentiment": feedback_data.sentiment,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "acknowledged": False
    }
    
    result = db.feedback.insert_one(feedback)
    feedback["id"] = str(result.inserted_id)
    
    return FeedbackResponse(**feedback)

@app.get("/feedback", response_model=List[FeedbackResponse])
async def get_feedback(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "manager":
        # Managers see feedback they've given
        feedback_list = list(db.feedback.find({"manager_id": str(current_user["_id"])}))
    else:
        # Employees see feedback they've received
        feedback_list = list(db.feedback.find({"employee_id": str(current_user["_id"])}))
    
    return [
        FeedbackResponse(
            id=str(feedback["_id"]),
            manager_id=feedback["manager_id"],
            employee_id=feedback["employee_id"],
            strengths=feedback["strengths"],
            areas_to_improve=feedback["areas_to_improve"],
            sentiment=feedback["sentiment"],
            created_at=feedback["created_at"],
            updated_at=feedback["updated_at"],
            acknowledged=feedback["acknowledged"]
        )
        for feedback in feedback_list
    ]

@app.put("/feedback/{feedback_id}", response_model=FeedbackResponse)
async def update_feedback(
    feedback_id: str,
    feedback_data: FeedbackUpdate,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Only managers can update feedback")
    
    feedback = db.feedback.find_one({
        "_id": ObjectId(feedback_id),
        "manager_id": str(current_user["_id"])
    })
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    update_data = {"updated_at": datetime.utcnow()}
    if feedback_data.strengths is not None:
        update_data["strengths"] = feedback_data.strengths
    if feedback_data.areas_to_improve is not None:
        update_data["areas_to_improve"] = feedback_data.areas_to_improve
    if feedback_data.sentiment is not None:
        update_data["sentiment"] = feedback_data.sentiment
    
    db.feedback.update_one(
        {"_id": ObjectId(feedback_id)},
        {"$set": update_data}
    )
    
    updated_feedback = db.feedback.find_one({"_id": ObjectId(feedback_id)})
    return FeedbackResponse(
        id=str(updated_feedback["_id"]),
        manager_id=updated_feedback["manager_id"],
        employee_id=updated_feedback["employee_id"],
        strengths=updated_feedback["strengths"],
        areas_to_improve=updated_feedback["areas_to_improve"],
        sentiment=updated_feedback["sentiment"],
        created_at=updated_feedback["created_at"],
        updated_at=updated_feedback["updated_at"],
        acknowledged=updated_feedback["acknowledged"]
    )

@app.post("/feedback/{feedback_id}/acknowledge")
async def acknowledge_feedback(
    feedback_id: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "employee":
        raise HTTPException(status_code=403, detail="Only employees can acknowledge feedback")
    
    feedback = db.feedback.find_one({
        "_id": ObjectId(feedback_id),
        "employee_id": str(current_user["_id"])
    })
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    db.feedback.update_one(
        {"_id": ObjectId(feedback_id)},
        {"$set": {"acknowledged": True}}
    )
    
    return {"message": "Feedback acknowledged successfully"}

# Dashboard endpoints
@app.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "manager":
        # Manager dashboard stats
        team_members = list(db.users.find({"manager_id": str(current_user["_id"])}))
        team_member_ids = [str(member["_id"]) for member in team_members]
        
        total_feedback = db.feedback.count_documents({"manager_id": str(current_user["_id"])})
        positive_feedback = db.feedback.count_documents({
            "manager_id": str(current_user["_id"]),
            "sentiment": "positive"
        })
        negative_feedback = db.feedback.count_documents({
            "manager_id": str(current_user["_id"]),
            "sentiment": "negative"
        })
        
        return {
            "team_size": len(team_members),
            "total_feedback": total_feedback,
            "positive_feedback": positive_feedback,
            "negative_feedback": negative_feedback,
            "neutral_feedback": total_feedback - positive_feedback - negative_feedback
        }
    else:
        # Employee dashboard stats
        total_feedback = db.feedback.count_documents({"employee_id": str(current_user["_id"])})
        acknowledged_feedback = db.feedback.count_documents({
            "employee_id": str(current_user["_id"]),
            "acknowledged": True
        })
        
        return {
            "total_feedback": total_feedback,
            "acknowledged_feedback": acknowledged_feedback,
            "pending_feedback": total_feedback - acknowledged_feedback
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 