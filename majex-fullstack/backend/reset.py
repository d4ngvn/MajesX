from database import engine
from sqlalchemy import text

def reset_database():
    with engine.connect() as connection:
        # Tắt ràng buộc khóa ngoại để xóa bảng dễ dàng
        connection.execute(text("EXEC sp_msforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT all'"))
        
        # Danh sách bảng cần xóa (bao gồm cả tên bảng cũ và mới để chắc chắn)
        tables = ["bookings", "bills", "reports", "facilities", "users", 
                  "Bookings", "Bills", "Reports", "Facilities", "Users", "Messages"]
        
        for table in tables:
            try:
                connection.execute(text(f"DROP TABLE IF EXISTS [{table}]"))
                print(f"Deleted table: {table}")
            except Exception as e:
                print(f"Error deleting {table}: {e}")
                
        # Bật lại ràng buộc khóa ngoại
        connection.execute(text("EXEC sp_msforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all'"))
        connection.commit()
        print("✅ Database reset complete!")

if __name__ == "__main__":
    reset_database()