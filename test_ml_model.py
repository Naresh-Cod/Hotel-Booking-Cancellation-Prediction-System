import pytest
from app.ml_model import predict_cancellation

def test_predict_cancellation():
    booking_data = {
        'noOfAdults': 2,
        'noOfChildren': 0,
        'noOfWeekendNights': 1,
        'noOfWeekNights': 2,
        'typeOfMealPlan': 'Meal Plan 1',
        'requiredCarParkingSpace': False,
        'roomTypeReserved': 'Room_Type 1',
        'leadTime': 30,
        'marketSegmentType': 'Online',
        'repeatedGuest': False,
        'noOfPreviousCancellations': 0,
        'noOfPreviousBookingsNotCanceled': 0,
        'avgPricePerRoom': 100.0,
        'noOfSpecialRequests': 0
    }
    result = predict_cancellation(booking_data)
    assert 'probability' in result
    assert 'prediction' in result
    assert 'risk' in result