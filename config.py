import os

class Config:
    SECRET_KEY = '930c38b961b1af60de0cf4dae405d774'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:123@localhost/bookings'
    SQLALCHEMY_TRACK_MODIFICATIONS = False