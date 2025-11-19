import os
from pathlib import Path

# Tên thư mục gốc của dự án
BASE_DIR = "majex-fullstack"

# Nội dung các file Backend (Python/FastAPI/SQLAlchemy)
backend_requirements = """fastapi
uvicorn
sqlalchemy
pyodbc
pydantic
python-dotenv
"""

backend_env = """# Thay đổi thông tin kết nối SQL Server của bạn tại đây
# Format: mssql+pyodbc://<username>:<password>@<host>/<database_name>?driver=<driver_name>
DATABASE_URL="mssql+pyodbc://sa:YourPassword123@localhost/MajeXDB?driver=ODBC+Driver+17+for+SQL+Server&TrustServerCertificate=yes"
"""

backend_database = """from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Kiểm tra xem connection string có tồn tại không
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL chưa được cấu hình trong file .env")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
"""

backend_models = """from sqlalchemy import Column, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100))
    role = Column(String(20)) # 'ADMIN' or 'RESIDENT'
    avatar = Column(String(255), nullable=True)
    apartment_id = Column(String(20), nullable=True)
    email = Column(String(100), unique=True, index=True)
    phone = Column(String(20), nullable=True)
    username = Column(String(50), unique=True)
    password = Column(String(100)) 
    status = Column(String(20), default='Active')

class Facility(Base):
    __tablename__ = "facilities"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100))
    type = Column(String(50))
    image = Column(String(255))
    open_time = Column(String(10))
    close_time = Column(String(10))
    price = Column(Float, default=0.0)

class Bill(Base):
    __tablename__ = "bills"

    id = Column(String(50), primary_key=True)
    user_id = Column(String(50), ForeignKey("users.id"))
    type = Column(String(50)) 
    amount = Column(Float)
    due_date = Column(String(20)) 
    status = Column(String(20)) 
    month = Column(String(50))
    paid_date = Column(String(20), nullable=True)

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(50), primary_key=True)
    facility_id = Column(String(50), ForeignKey("facilities.id"))
    user_id = Column(String(50), ForeignKey("users.id"))
    date = Column(String(20))
    time_slot = Column(String(20))
    qr_code_data = Column(Text)
    status = Column(String(20))
"""

backend_schemas = """from pydantic import BaseModel
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    name: str
    role: str
    apartment_id: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    username: Optional[str] = None

class UserCreate(UserBase):
    id: str
    password: str

class UserOut(UserBase):
    id: str
    avatar: Optional[str] = None
    status: str
    class Config:
        orm_mode = True

# Bill Schemas
class BillBase(BaseModel):
    type: str
    amount: float
    due_date: str
    status: str
    month: str
    paid_date: Optional[str] = None

class BillCreate(BillBase):
    id: str
    user_id: str

class BillOut(BillBase):
    id: str
    user_id: str
    class Config:
        orm_mode = True

# Facility Schemas
class FacilityBase(BaseModel):
    name: str
    type: str
    image: str
    open_time: str
    close_time: str
    price: float

class FacilityCreate(FacilityBase):
    id: str

class FacilityOut(FacilityBase):
    id: str
    class Config:
        orm_mode = True
"""

backend_main = """from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, database
from typing import List
import datetime

# Tự động tạo bảng nếu chưa có
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---

@app.get("/")
def read_root():
    return {"message": "MajeX API is running"}

# 1. Residents / Users
@app.get("/users", response_model=List[schemas.UserOut])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@app.post("/users", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = models.User(
        id=user.id, name=user.name, role=user.role, 
        email=user.email, apartment_id=user.apartment_id,
        username=user.username, password=user.password, phone=user.phone,
        avatar=f"https://ui-avatars.com/api/?name={user.name}"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# 2. Bills
@app.get("/bills/{user_id}", response_model=List[schemas.BillOut])
def get_my_bills(user_id: str, db: Session = Depends(database.get_db)):
    return db.query(models.Bill).filter(models.Bill.user_id == user_id).all()

@app.post("/bills", response_model=schemas.BillOut)
def create_bill(bill: schemas.BillCreate, db: Session = Depends(database.get_db)):
    db_bill = models.Bill(**bill.dict())
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)
    return db_bill

@app.put("/bills/{bill_id}/pay")
def pay_bill(bill_id: str, db: Session = Depends(database.get_db)):
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    bill.status = "Paid"
    bill.paid_date = datetime.date.today().isoformat()
    db.commit()
    return {"message": "Paid successfully"}

# 3. Facilities
@app.get("/facilities", response_model=List[schemas.FacilityOut])
def get_facilities(db: Session = Depends(database.get_db)):
    return db.query(models.Facility).all()

@app.post("/facilities", response_model=schemas.FacilityOut)
def create_facility(facility: schemas.FacilityCreate, db: Session = Depends(database.get_db)):
    db_facility = models.Facility(**facility.dict())
    db.add(db_facility)
    db.commit()
    db.refresh(db_facility)
    return db_facility

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
"""

# Nội dung Frontend mới (chỉ tạo file api.ts, phần còn lại giữ cấu trúc folder)
frontend_api_ts = """
const API_URL = 'http://localhost:8000';

export const api = {
  // Users
  getUsers: async () => {
    const response = await fetch(`${API_URL}/users`);
    return response.json();
  },
  createUser: async (user: any) => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    return response.json();
  },

  // Facilities
  getFacilities: async () => {
    const response = await fetch(`${API_URL}/facilities`);
    return response.json();
  },
  createFacility: async (facility: any) => {
    const response = await fetch(`${API_URL}/facilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facility),
    });
    return response.json();
  },

  // Bills
  getMyBills: async (userId: string) => {
    const response = await fetch(`${API_URL}/bills/${userId}`);
    return response.json();
  },
  payBill: async (billId: string) => {
     const response = await fetch(`${API_URL}/bills/${billId}/pay`, {
        method: 'PUT'
     });
     return response.json();
  }
};
"""

# Định nghĩa cấu trúc file và folder
structure = {
    "backend/requirements.txt": backend_requirements,
    "backend/.env": backend_env,
    "backend/database.py": backend_database,
    "backend/models.py": backend_models,
    "backend/schemas.py": backend_schemas,
    "backend/main.py": backend_main,
    "frontend/src/services/api.ts": frontend_api_ts,
}

# Các folder rỗng cần tạo (để bạn copy code cũ vào)
empty_dirs = [
    "frontend/src/components",
    "frontend/public"
]

def create_project_structure():
    # Tạo thư mục gốc
    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)
        print(f"✅ Đã tạo thư mục gốc: {BASE_DIR}")
    else:
        print(f"ℹ️ Thư mục {BASE_DIR} đã tồn tại.")

    # Tạo các file có nội dung
    for file_path, content in structure.items():
        full_path = os.path.join(BASE_DIR, file_path)
        
        # Tạo thư mục cha nếu chưa tồn tại
        parent_dir = os.path.dirname(full_path)
        if not os.path.exists(parent_dir):
            os.makedirs(parent_dir)
        
        # Ghi file
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✅ Đã tạo file: {file_path}")

    # Tạo các thư mục rỗng cho Frontend
    for folder in empty_dirs:
        full_path = os.path.join(BASE_DIR, folder)
        if not os.path.exists(full_path):
            os.makedirs(full_path)
            print(f"✅ Đã tạo thư mục: {folder}")

    print("\n🎉 Cấu trúc dự án đã được tạo thành công!")
    print("👉 Bước tiếp theo:")
    print(f"1. Copy toàn bộ code cũ trong 'majex_2/src' (trừ services) vào '{BASE_DIR}/frontend/src'")
    print(f"2. Copy các file cấu hình (package.json, vite.config.ts,...) vào '{BASE_DIR}/frontend'")
    print(f"3. Cập nhật file 'frontend/src/App.tsx' để dùng api từ 'services/api.ts'")

if __name__ == "__main__":
    create_project_structure()