from database.connection import engine

try:
    connection = engine.connect()
    print("Database connected successfully!")
except:
    print("Database connection failed!")