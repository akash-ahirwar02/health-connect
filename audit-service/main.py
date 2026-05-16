from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
import os
from datetime import datetime

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/auditdb")

# Database Setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    action = Column(String)
    resource = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic Schemas
class AuditLogCreate(BaseModel):
    user_id: str
    action: str
    resource: str

class AuditLogResponse(BaseModel):
    id: int
    user_id: str
    action: str
    resource: str
    timestamp: datetime
    class Config:
        orm_mode = True

# Helper Functions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# FastAPI App
app = FastAPI(title="Audit Logging Service")

@app.get("/health")
def health_check():
    return {"status": "UP", "service": "audit-service"}

@app.post("/logs", response_model=AuditLogResponse, status_code=status.HTTP_201_CREATED)
def create_log(log_entry: AuditLogCreate, db: Session = Depends(get_db)):
    db_log = AuditLog(
        user_id=log_entry.user_id,
        action=log_entry.action,
        resource=log_entry.resource
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@app.get("/logs", response_model=list[AuditLogResponse])
def get_logs(db: Session = Depends(get_db)):
    return db.query(AuditLog).all()
