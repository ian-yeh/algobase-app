from core.config import Base
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    emailVerified = Column(Boolean, default=False)
    image = Column(String, nullable=True)
    lastActivityDate = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    solves = relationship("Solve", back_populates="user")