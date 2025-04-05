from flask import Blueprint, render_template, request, jsonify
from app.models import Booking, Cancellation
from app.ml_model import predict_cancellation
#from app.database import db
from app import db
from datetime import datetime

from app.models import Booking
from sqlalchemy import func

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def dashboard():
    try:
        # Use the correct SQLAlchemy query interface
        total_bookings = db.session.query(func.count(Booking.id)).scalar() or 0
        confirmed_bookings = db.session.query(func.count(Booking.id)) \
            .filter(Booking.status == 'Confirmed').scalar() or 0
        cancelled_bookings = db.session.query(func.count(Booking.id)) \
            .filter(Booking.status == 'Cancelled').scalar() or 0

        stats = {
            'total': total_bookings,
            'confirmed': confirmed_bookings,
            'cancelled': cancelled_bookings,
            'cancellation_rate': cancelled_bookings / total_bookings if total_bookings > 0 else 0
        }
        
        return render_template('dashboard.html', stats=stats)
    except Exception as e:
        return str(e), 500  # Temporary error handling for debugging

@main_bp.route('/bookings')
def bookings():
    bookings = Booking.query.all()
    return render_template('bookings.html', bookings=bookings)

@main_bp.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        data = request.form.to_dict()
        prediction = predict_cancellation(data)
        return jsonify(prediction)
    return render_template('predict.html')

@main_bp.route('/analytics')
def analytics():
    return render_template('analytics.html')

@main_bp.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.json
    
    booking = Booking(
        booking_id=data['booking_id'],
        guest_name=data['guest_name'],
        room_type=data['room_type'],
        check_in=datetime.strptime(data['check_in'], '%Y-%m-%d'),
        check_out=datetime.strptime(data['check_out'], '%Y-%m-%d'),
        adults=int(data['adults']),
        children=int(data['children']),
        weekend_nights=int(data['weekend_nights']),
        week_nights=int(data['week_nights']),
        meal_plan=data['meal_plan'],
        car_parking=data.get('car_parking', False),
        lead_time=int(data['lead_time']),
        market_segment=data['market_segment'],
        repeated_guest=data.get('repeated_guest', False),
        previous_cancellations=int(data.get('previous_cancellations', 0)),
        previous_bookings=int(data.get('previous_bookings', 0)),
        avg_price=float(data['avg_price']),
        special_requests=int(data.get('special_requests', 0))
    )
    
    db.session.add(booking)
    db.session.commit()
    
    return jsonify({"message": "Booking created successfully", "id": booking.id}), 201

@main_bp.route('/api/bookings/<booking_id>/cancel', methods=['POST'])
def cancel_booking(booking_id):
    booking = Booking.query.filter_by(booking_id=booking_id).first()
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    
    booking.status = 'Cancelled'
    
    cancellation = Cancellation(
        booking_id=booking_id,
        reason=request.json.get('reason', '')
    )
    
    db.session.add(cancellation)
    db.session.commit()
    
    return jsonify({"message": "Booking cancelled successfully"}), 200