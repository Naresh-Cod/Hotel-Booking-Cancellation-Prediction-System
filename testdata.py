from app import create_app
from app.models import Booking
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    # Add test booking
    test_booking = Booking(
        booking_id='TEST001',
        guest_name='Test Guest',
        room_type='Deluxe',
        check_in=datetime.now(),
        check_out=datetime.now() + timedelta(days=3),
        adults=2,
        children=0,
        status='Confirmed',
        # ... other required fields ...
    )
    db.session.add(test_booking)
    db.session.commit()