from app.core.config import Base
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, index=True)
    emailVerified = Column(Boolean, default=False)
    imageUrl = Column(String, nullable=True)
    lastActivityDate = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    solves = relationship("Solve", back_populates="user")