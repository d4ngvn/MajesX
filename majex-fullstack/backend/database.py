from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import urllib.parse

# --- CẤU HÌNH KẾT NỐI ---
# Dựa trên file mẫu bạn gửi đã chạy thành công:
# Server: ACER\SQLEXPRESS (Lưu ý: trong Python dấu \ cần viết là \\)
# User: sa
# Password: admin123
# Database: MajeXDB
# Driver: ODBC Driver 17 for SQL Server

# Tạo connection string
# Lưu ý: Thêm TrustServerCertificate=yes và Encrypt=yes để tránh lỗi SSL thường gặp ở local
SQLALCHEMY_DATABASE_URL = (
    "mssql+pyodbc://sa:admin123@ACER\\SQLEXPRESS/MajeXDB?"
    "driver=ODBC+Driver+17+for+SQL+Server&"
    "TrustServerCertificate=yes&"
    "Encrypt=yes"
)

# Tạo engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Tạo SessionLocal để dùng trong các request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency để lấy DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()