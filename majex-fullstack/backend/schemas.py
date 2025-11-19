# backend/schemas.py
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List

# Cho phép map alias (camelCase) vào field (snake_case)
class BaseConfigModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# --- ANNOUNCEMENT SCHEMAS (Mới) ---
class AnnouncementBase(BaseModel):
    title: str
    content: str
    tone: Optional[str] = "Formal"

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementOut(AnnouncementBase, BaseConfigModel):
    id: str
    timestamp: float
    sender_name: str = Field(..., alias="senderName")

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    name: str
    role: str
    # alias="apartmentId" giúp đọc được JSON { "apartmentId": "..." } từ frontend
    apartment_id: Optional[str] = Field(None, alias="apartmentId") 
    email: Optional[str] = None
    phone: Optional[str] = None
    username: Optional[str] = None

class UserCreate(UserBase):
    id: str
    password: str

class UserOut(UserBase, BaseConfigModel):
    id: str
    avatar: Optional[str] = None
    status: str

# --- MESSAGE SCHEMAS ---
class MessageBase(BaseModel):
    sender_id: str = Field(..., alias="senderId")
    sender_name: str = Field(..., alias="senderName")
    text: str

class MessageCreate(MessageBase):
    pass

class MessageOut(MessageBase, BaseConfigModel):
    id: str
    timestamp: float

# --- REPORT SCHEMAS ---
class ReportBase(BaseModel):
    user_id: str = Field(..., alias="userId")
    user_name: str = Field(..., alias="userName")
    apartment: str
    title: str
    description: str
    category: str

class ReportCreate(ReportBase):
    status: Optional[str] = "Pending" # Optional để tránh lỗi nếu frontend ko gửi

class ReportOut(ReportBase, BaseConfigModel):
    id: str
    status: str
    timestamp: float

# --- BILL SCHEMAS ---
class BillBase(BaseModel):
    type: str
    amount: float
    due_date: str = Field(..., alias="dueDate")
    status: str
    month: str
    paid_date: Optional[str] = Field(None, alias="paidDate")

class BillCreate(BillBase):
    id: str
    user_id: str = Field(..., alias="userId")

class BillOut(BillBase, BaseConfigModel):
    id: str
    user_id: str = Field(..., alias="userId")

# --- FACILITY SCHEMAS ---
class FacilityBase(BaseModel):
    name: str
    type: str
    image: str
    open_time: str = Field(..., alias="openTime")
    close_time: str = Field(..., alias="closeTime")
    price: float

class FacilityCreate(FacilityBase):
    id: str

class FacilityOut(FacilityBase, BaseConfigModel):
    id: str

# --- BOOKING SCHEMAS ---
class BookingBase(BaseModel):
    facility_id: str = Field(..., alias="facilityId")
    facility_name: str = Field(..., alias="facilityName")
    user_id: str = Field(..., alias="userId")
    user_name: str = Field(..., alias="userName")
    date: str
    time_slot: str = Field(..., alias="timeSlot")
    qr_code_data: str = Field(..., alias="qrCodeData")
    status: str

class BookingCreate(BookingBase):
    id: str

class BookingOut(BookingBase, BaseConfigModel):
    id: str