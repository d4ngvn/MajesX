from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, database
from typing import List
import json

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- WEBSOCKET MANAGER (ĐÃ FIX LỖI) ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        # Lặp qua bản sao của danh sách để tránh lỗi khi list thay đổi
        # và thêm try/except để bắt lỗi kết nối hỏng
        for connection in self.active_connections[:]: 
            try:
                await connection.send_json(message)
            except Exception:
                # Nếu gửi lỗi (do client đã đóng), ta xóa kết nối đó đi
                # hoặc chỉ cần bỏ qua để không làm crash server
                pass
    
    def get_online_count(self):
        return len(self.active_connections)

manager = ConnectionManager()

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(database.get_db)):
    await manager.connect(websocket)
    try:
        # Gửi cập nhật số lượng online
        await manager.broadcast({"type": "online_count", "count": manager.get_online_count()})
        
        while True:
            data = await websocket.receive_json()
            
            # Lưu tin nhắn vào DB
            try:
                new_msg = models.Message(
                    sender_id=data['senderId'],
                    sender_name=data['senderName'],
                    text=data['text']
                )
                db.add(new_msg)
                db.commit()
                db.refresh(new_msg)
                
                response_msg = {
                    "type": "message",
                    "id": new_msg.id,
                    "senderId": new_msg.sender_id,
                    "senderName": new_msg.sender_name,
                    "text": new_msg.text,
                    "timestamp": new_msg.timestamp
                }
                await manager.broadcast(response_msg)
            except Exception as e:
                print(f"Error saving message: {e}")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # Cập nhật lại số lượng online khi có người thoát
        await manager.broadcast({"type": "online_count", "count": manager.get_online_count()})
    except Exception as e:
        # Bắt các lỗi khác để không sập server
        print(f"WebSocket Error: {e}")
        manager.disconnect(websocket)

# --- API ENDPOINTS ---

@app.get("/users", response_model=List[schemas.UserOut])
def get_users(db: Session = Depends(database.get_db)):
    return db.query(models.User).all()

@app.post("/users", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Kiểm tra user đã tồn tại chưa để tránh lỗi 500
    existing_user = db.query(models.User).filter(models.User.id == user.id).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User ID already exists")
        
    db_user = models.User(
        id=user.id, name=user.name, role=user.role, 
        email=user.email, apartment_id=user.apartment_id,
        username=user.username, password=user.password, phone=user.phone,
        avatar=f"https://ui-avatars.com/api/?name={user.name}&background=random"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/facilities", response_model=List[schemas.FacilityOut])
def get_facilities(db: Session = Depends(database.get_db)):
    return db.query(models.Facility).all()

@app.post("/facilities", response_model=schemas.FacilityOut)
def create_facility(facility: schemas.FacilityCreate, db: Session = Depends(database.get_db)):
    db_facility = models.Facility(**facility.dict(by_alias=False))
    db.add(db_facility)
    db.commit()
    db.refresh(db_facility)
    return db_facility

# --- BOOKINGS ---
@app.get("/bookings", response_model=List[schemas.BookingOut])
def get_bookings(db: Session = Depends(database.get_db)):
    return db.query(models.Booking).all()

@app.post("/bookings", response_model=schemas.BookingOut)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(database.get_db)):
    db_booking = models.Booking(**booking.dict(by_alias=False))
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@app.put("/bookings/{booking_id}/cancel")
def cancel_booking(booking_id: str, db: Session = Depends(database.get_db)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "Cancelled"
    db.commit()
    return {"message": "Booking cancelled"}

# --- BILLS ---
@app.get("/bills/{user_id}", response_model=List[schemas.BillOut])
def get_my_bills(user_id: str, db: Session = Depends(database.get_db)):
    if user_id == "all":
        return db.query(models.Bill).all()
    return db.query(models.Bill).filter(models.Bill.user_id == user_id).all()

@app.put("/bills/{bill_id}/pay")
def pay_bill(bill_id: str, db: Session = Depends(database.get_db)):
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not bill: raise HTTPException(status_code=404, detail="Bill not found")
    bill.status = "Paid"
    import datetime
    bill.paid_date = datetime.date.today().isoformat()
    db.commit()
    return {"message": "Paid successfully"}

# --- REPORTS ---
@app.get("/reports", response_model=List[schemas.ReportOut])
def get_reports(db: Session = Depends(database.get_db)):
    return db.query(models.Report).order_by(models.Report.timestamp.desc()).all()

@app.post("/reports", response_model=schemas.ReportOut)
def create_report(report: schemas.ReportCreate, db: Session = Depends(database.get_db)):
    db_report = models.Report(**report.dict(by_alias=False))
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

@app.put("/reports/{report_id}/resolve")
def resolve_report(report_id: str, db: Session = Depends(database.get_db)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report: raise HTTPException(status_code=404, detail="Report not found")
    report.status = "Resolved"
    db.commit()
    return {"message": "Report resolved"}

# --- MESSAGES ---
@app.get("/messages", response_model=List[schemas.MessageOut])
def get_messages(db: Session = Depends(database.get_db)):
    return db.query(models.Message).order_by(models.Message.timestamp.asc()).all()

# --- ANNOUNCEMENTS ---
@app.get("/announcements", response_model=List[schemas.AnnouncementOut])
def get_announcements(db: Session = Depends(database.get_db)):
    return db.query(models.Announcement).order_by(models.Announcement.timestamp.desc()).all()

@app.post("/announcements", response_model=schemas.AnnouncementOut)
def create_announcement(announcement: schemas.AnnouncementCreate, db: Session = Depends(database.get_db)):
    db_ann = models.Announcement(**announcement.dict())
    db.add(db_ann)
    db.commit()
    db.refresh(db_ann)
    return db_ann

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)