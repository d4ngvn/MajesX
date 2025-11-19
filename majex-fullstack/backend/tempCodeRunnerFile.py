from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import uuid

models.Base.metadata.create_all(bind=engine)

def seed_data():
    db: Session = SessionLocal()
    try:
        # 1. Users
        users = [
            {"id": "user_admin_999", "name": "Building Manager", "role": "ADMIN", "email": "admin@majex.com", "username": "admin", "password": "password", "avatar": "https://ui-avatars.com/api/?name=Admin&background=000&color=fff", "status": "Active"},
            {"id": "user_resident_123", "name": "Sarah Jenkins", "role": "RESIDENT", "email": "sarah@example.com", "username": "sarah", "password": "password", "apartment_id": "A-402", "avatar": "https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random", "status": "Active"},
        ]
        for u in users:
            if not db.query(models.User).filter_by(id=u['id']).first():
                db.add(models.User(**u))
        # Ensure user INSERTs are flushed to DB so FK checks for bills succeed
        db.flush()
        
        # 2. Facilities (Dữ liệu thật)
        facilities = [
            {"id": str(uuid.uuid4()), "name": "Tennis Court A", "type": "Sport", "open_time": "06:00", "close_time": "22:00", "price": 15.0, "image": "https://images.unsplash.com/photo-1622163642998-1ea14b60c57e?q=80&w=400&auto=format&fit=crop"},
            {"id": str(uuid.uuid4()), "name": "Community Pool", "type": "Pool", "open_time": "08:00", "close_time": "20:00", "price": 5.0, "image": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=400&auto=format&fit=crop"},
            {"id": str(uuid.uuid4()), "name": "Gymnasium", "type": "Gym", "open_time": "05:00", "close_time": "23:00", "price": 0.0, "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop"},
            {"id": str(uuid.uuid4()), "name": "BBQ Area", "type": "Entertainment", "open_time": "10:00", "close_time": "22:00", "price": 25.0, "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop"}
        ]
        if db.query(models.Facility).count() == 0:
            for f in facilities:
                db.add(models.Facility(**f))
        # Flush facilities as well (optional but keeps behavior predictable)
        db.flush()

        # 3. Bills (Tiền điện, nước, net...)
        bills = [
            {"id": str(uuid.uuid4()), "user_id": "user_resident_123", "type": "Electricity", "amount": 145.20, "due_date": "2023-11-15", "status": "Unpaid", "month": "October 2023"},
            {"id": str(uuid.uuid4()), "user_id": "user_resident_123", "type": "Water", "amount": 35.00, "due_date": "2023-11-20", "status": "Unpaid", "month": "October 2023"},
            {"id": str(uuid.uuid4()), "user_id": "user_resident_123", "type": "Internet", "amount": 45.00, "due_date": "2023-11-01", "status": "Overdue", "month": "October 2023"},
            {"id": str(uuid.uuid4()), "user_id": "user_resident_123", "type": "Service Fee", "amount": 80.00, "due_date": "2023-11-05", "status": "Paid", "month": "October 2023", "paid_date": "2023-11-04"},
            {"id": str(uuid.uuid4()), "user_id": "user_resident_123", "type": "Cleaning Fee", "amount": 25.00, "due_date": "2023-11-10", "status": "Unpaid", "month": "October 2023"},
        ]
        if db.query(models.Bill).count() == 0:
            for b in bills:
                db.add(models.Bill(**b))
        
        db.commit()
        print("✅ Database seeded successfully!")
    except Exception as e:
        print(f"❌ Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()