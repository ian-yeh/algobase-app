from core.config import Base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime

class CubeType:
    TWO_BY_TWO = "2x2"
    THREE_BY_THREE = "3x3"
    FOUR_BY_FOUR = "4x4"
    FIVE_BY_FIVE = "5x5"
    SIX_BY_SIX = "6x6"
    SEVEN_BY_SEVEN = "7x7"
    MEGA_MINX = "Megaminx"
    PYRAMINX = "Pyraminx"
    SKEWB = "Skewb"
    SQUARE_ONE = "Square-1"

class Solve(Base):
    __tablename__ = "solves"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    cube_type = Column(Enum(CubeType), nullable=False, index=True)
    time = Column(Integer)  # stored in centiseconds
    scramble = Column(String)
    dnf = Column(Boolean, default=False)
    plusTwo = Column(Boolean, default=False)
    createdAt = Column(DateTime, default=datetime.now)
    updatedAt = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="solves")