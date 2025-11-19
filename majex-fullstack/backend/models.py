from sqlalchemy import Column, String, Float, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    # Dùng String ID để khớp với frontend (vd: "user_1")
    id = Column(String(50), primary_key=True, default=generate_uuid)
    name = Column(String(100))
    role = Column(String(20)) # 'ADMIN' or 'RESIDENT'
    avatar = Column(String(255), nullable=True)
    apartment_id = Column(String(20), nullable=True) # Map với 'apartment' ở frontend
    email = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    username = Column(String(50), nullable=True)
    password = Column(String(100), nullable=True)
    status = Column(String(20), default='Active')

class Facility(Base):
    __tablename__ = "facilities"
    id = Column(String(50), primary_key=True, default=generate_uuid)
    name = Column(String(100))
    type = Column(String(50))
    image = Column(String(255))
    open_time = Column(String(10))
    close_time = Column(String(10))
    price = Column(Float, default=0.0)

class Bill(Base):
    __tablename__ = "bills"
    id = Column(String(50), primary_key=True, default=generate_uuid)
    user_id = Column(String(50), ForeignKey("users.id"))
    type = Column(String(50)) 
    amount = Column(Float)
    due_date = Column(String(20)) 
    status = Column(String(20)) 
    month = Column(String(50))
    paid_date = Column(String(20), nullable=True)

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(String(50), primary_key=True, default=generate_uuid)
    facility_id = Column(String(50), ForeignKey("facilities.id"))
    user_id = Column(String(50), ForeignKey("users.id"))
    facility_name = Column(String(100))
    user_name = Column(String(100))
    date = Column(String(20))
    time_slot = Column(String(20))
    qr_code_data = Column(Text)
    status = Column(String(20))

class Message(Base):
    __tablename__ = "messages"
    id = Column(String(50), primary_key=True, default=generate_uuid)
    sender_id = Column(String(50), ForeignKey("users.id"))
    sender_name = Column(String(100))
    text = Column(Text)
    timestamp = Column(Float, default=lambda: datetime.now().timestamp() * 1000) # JS timestamp format

class Report(Base):
    __tablename__ = "reports"
    id = Column(String(50), primary_key=True, default=generate_uuid)
    user_id = Column(String(50), ForeignKey("users.id"))
    user_name = Column(String(100))
    apartment = Column(String(50))
    title = Column(String(100))
    description = Column(Text)
    category = Column(String(50))
    status = Column(String(20))
    timestamp = Column(Float, default=lambda: datetime.now().timestamp() * 1000)
    
class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(String(50), primary_key=True, default=generate_uuid)
    title = Column(String(200))
    content = Column(Text)
    tone = Column(String(50))
    sender_name = Column(String(100), default="Admin")
    timestamp = Column(Float, default=lambda: datetime.now().timestamp() * 1000)