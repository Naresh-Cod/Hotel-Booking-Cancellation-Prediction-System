from app.database import db
from datetime import datetime

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.String(20), unique=True, nullable=False)
    guest_name = db.Column(db.String(100), nullable=False)
    room_type = db.Column(db.String(50), nullable=False)
    check_in = db.Column(db.Date, nullable=False)
    check_out = db.Column(db.Date, nullable=False)
    adults = db.Column(db.Integer, nullable=False)
    children = db.Column(db.Integer, default=0)
    weekend_nights = db.Column(db.Integer, default=0)
    week_nights = db.Column(db.Integer, nullable=False)
    meal_plan = db.Column(db.String(50), nullable=False)
    car_parking = db.Column(db.Boolean, default=False)
    lead_time = db.Column(db.Integer, nullable=False)
    market_segment = db.Column(db.String(50), nullable=False)
    repeated_guest = db.Column(db.Boolean, default=False)
    previous_cancellations = db.Column(db.Integer, default=0)
    previous_bookings = db.Column(db.Integer, default=0)
    avg_price = db.Column(db.Float, nullable=False)
    special_requests = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='Confirmed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Cancellation(db.Model):
    __tablename__ = 'cancellations'
    
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.String(20), db.ForeignKey('bookings.booking_id'), nullable=False)
    cancellation_date = db.Column(db.DateTime, default=datetime.utcnow)
    reason = db.Column(db.Text)
    
    booking = db.relationship('Booking', backref='cancellations')