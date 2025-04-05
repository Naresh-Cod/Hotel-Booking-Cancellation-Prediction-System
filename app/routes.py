from flask import Blueprint, render_template, request, jsonify, redirect, url_for
from app.models import Booking, Cancellation
from app.ml_model import predict_cancellation
from app import db
from datetime import datetime
from sqlalchemy import func
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def dashboard():
    """
    Render the dashboard with booking statistics.
    """
    try:
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
        
        logger.info("Dashboard stats retrieved successfully")
        return render_template('dashboard.html', stats=stats)
    except Exception as e:
        logger.error(f"Error in dashboard route: {str(e)}")
        return render_template('error.html', error=f"Internal Server Error: {str(e)}"), 500

@main_bp.route('/bookings')
def bookings():
    """
    Display all bookings.
    """
    try:
        bookings = Booking.query.all()
        logger.info(f"Retrieved {len(bookings)} bookings")
        return render_template('bookings.html', bookings=bookings)
    except Exception as e:
        logger.error(f"Error in bookings route: {str(e)}")
        return render_template('error.html', error=f"Internal Server Error: {str(e)}"), 500

@main_bp.route('/predict', methods=['GET', 'POST'])
def predict():
    """
    Handle cancellation prediction.
    GET: Render prediction form
    POST: Process form data and return prediction
    """
    if request.method == 'POST':
        try:
            data = request.form.to_dict()
            # Convert string values to appropriate types
            data['noOfAdults'] = int(data['noOfAdults'])
            data['noOfChildren'] = int(data['noOfChildren'])
            data['noOfWeekendNights'] = int(data['noOfWeekendNights'])
            data['noOfWeekNights'] = int(data['noOfWeekNights'])

            prediction = predict_cancellation(data)
            logger.info(f"Prediction made: {prediction}")

            # Render the template with prediction results
            return render_template('predict.html', prediction=prediction)
        except KeyError as e:
            logger.error(f"Missing form field: {str(e)}")
            return render_template('predict.html', error=f"Missing field: {str(e)}"), 400
        except Exception as e:
            logger.error(f"Error in prediction: {str(e)}")
            return render_template('predict.html', error=f"Prediction error: {str(e)}"), 500
    
    return render_template('predict.html')

@main_bp.route('/analytics')
def analytics():
    """
    Render the analytics page.
    """
    try:
        return render_template('analytics.html')
    except Exception as e:
        logger.error(f"Error in analytics route: {str(e)}")
        return render_template('error.html', error=f"Internal Server Error: {str(e)}"), 500

@main_bp.route('/settings', methods=['GET', 'POST'])
def settings():
    """
    Handle settings page and updates.
    GET: Render settings form
    POST: Process settings updates
    """
    if request.method == 'POST':
        try:
            data = request.form.to_dict()
            # Here you would typically update application settings
            # For this example, we'll just log and redirect
            logger.info(f"Settings updated: {data}")
            return redirect(url_for('main.settings'))
        except Exception as e:
            logger.error(f"Error updating settings: {str(e)}")
            return render_template('settings.html', error=f"Error updating settings: {str(e)}"), 500
    
    return render_template('settings.html')

@main_bp.route('/api/bookings', methods=['POST'])
def create_booking():
    """
    API endpoint to create a new booking.
    """
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        required_fields = ['booking_id', 'guest_name', 'room_type', 'check_in', 'check_out', 'adults', 'children']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

        booking = Booking(
            booking_id=data['booking_id'],
            guest_name=data['guest_name'],
            room_type=data['room_type'],
            check_in=datetime.strptime(data['check_in'], '%Y-%m-%d'),
            check_out=datetime.strptime(data['check_out'], '%Y-%m-%d'),
            adults=int(data['adults']),
            children=int(data['children']),
            weekend_nights=int(data.get('weekend_nights', 0)),
            week_nights=int(data.get('week_nights', 0)),
            meal_plan=data.get('meal_plan', 'No Meal Plan'),
            car_parking=data.get('car_parking', False),
            lead_time=int(data.get('lead_time', 0)),
            market_segment=data.get('market_segment', 'Online'),
            repeated_guest=data.get('repeated_guest', False),
            previous_cancellations=int(data.get('previous_cancellations', 0)),
            previous_bookings=int(data.get('previous_bookings', 0)),
            avg_price=float(data.get('avg_price', 0.0)),
            special_requests=int(data.get('special_requests', 0)),
            status='Confirmed'  # Default status
        )
        
        db.session.add(booking)
        db.session.commit()
        
        logger.info(f"Booking created: {booking.booking_id}")
        return jsonify({"message": "Booking created successfully", "id": booking.id}), 201
    except ValueError as e:
        logger.error(f"Invalid data format: {str(e)}")
        return jsonify({"error": f"Invalid data format: {str(e)}"}), 400
    except Exception as e:
        logger.error(f"Error creating booking: {str(e)}")
        db.session.rollback()
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

@main_bp.route('/api/bookings/<booking_id>/cancel', methods=['POST'])
def cancel_booking(booking_id):
    """
    API endpoint to cancel a booking.
    """
    try:
        booking = Booking.query.filter_by(booking_id=booking_id).first()
        if not booking:
            logger.warning(f"Booking not found: {booking_id}")
            return jsonify({"error": "Booking not found"}), 404
        
        if booking.status == 'Cancelled':
            return jsonify({"error": "Booking already cancelled"}), 400

        booking.status = 'Cancelled'
        cancellation = Cancellation(
            booking_id=booking_id,
            reason=request.json.get('reason', 'No reason provided'),
            cancellation_date=datetime.utcnow()
        )
        
        db.session.add(cancellation)
        db.session.commit()
        
        logger.info(f"Booking cancelled: {booking_id}")
        return jsonify({"message": "Booking cancelled successfully"}), 200
    except Exception as e:
        logger.error(f"Error cancelling booking: {str(e)}")
        db.session.rollback()
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

@main_bp.route('/api/bookings/<booking_id>', methods=['GET'])
def get_booking(booking_id):
    """
    API endpoint to retrieve a specific booking.
    """
    try:
        booking = Booking.query.filter_by(booking_id=booking_id).first()
        if not booking:
            return jsonify({"error": "Booking not found"}), 404
        
        booking_data = {
            'booking_id': booking.booking_id,
            'guest_name': booking.guest_name,
            'room_type': booking.room_type,
            'check_in': booking.check_in.strftime('%Y-%m-%d'),
            'check_out': booking.check_out.strftime('%Y-%m-%d'),
            'status': booking.status
        }
        return jsonify(booking_data), 200
    except Exception as e:
        logger.error(f"Error retrieving booking: {str(e)}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500