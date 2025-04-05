import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import os
import sys
#from app.database import db
from app import db 
from app.models import Booking

MODEL_PATH = 'app/models/cancellation_model.pkl'
PREPROCESSOR_PATH = 'app/models/preprocessor.pkl'

# sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import db
from app.models import Booking

def load_data():
    # Load from database
    bookings = Booking.query.all()
    
    data = []
    for booking in bookings:
        data.append({
            'no_of_adults': booking.adults,
            'no_of_children': booking.children,
            'no_of_weekend_nights': booking.weekend_nights,
            'no_of_week_nights': booking.week_nights,
            'type_of_meal_plan': booking.meal_plan,
            'required_car_parking': booking.car_parking,
            'room_type_reserved': booking.room_type,
            'lead_time': booking.lead_time,
            'market_segment_type': booking.market_segment,
            'repeated_guest': booking.repeated_guest,
            'no_of_previous_cancellations': booking.previous_cancellations,
            'no_of_previous_bookings_not_canceled': booking.previous_bookings,
            'avg_price_per_room': booking.avg_price,
            'no_of_special_requests': booking.special_requests,
            'booking_status': booking.status
        })
    
    return pd.DataFrame(data)

def train_model():
    df = load_data()
    
    if len(df) < 100:
        print("Not enough data to train model")
        return
    
    # Prepare data
    X = df.drop('booking_status', axis=1)
    y = df['booking_status'].apply(lambda x: 1 if x == 'Cancelled' else 0)
    
    # Define preprocessing
    categorical_features = ['type_of_meal_plan', 'room_type_reserved', 'market_segment_type']
    numeric_features = X.columns.difference(categorical_features + ['required_car_parking', 'repeated_guest'])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
            ('bool', 'passthrough', ['required_car_parking', 'repeated_guest'])
        ])
    
    # Create pipeline
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    # Train
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model.fit(X_train, y_train)
    
    # Save model
    os.makedirs('app/models', exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(preprocessor, PREPROCESSOR_PATH)
    
    return model

def predict_cancellation(booking_data):
    # Load model if exists
    if not os.path.exists(MODEL_PATH):
        model = train_model()
    else:
        model = joblib.load(MODEL_PATH)
    
    # Prepare input data
    input_df = pd.DataFrame([booking_data])
    
    # Make prediction
    proba = model.predict_proba(input_df)[0][1]
    prediction = 'Cancelled' if proba > 0.5 else 'Not Cancelled'
    risk = 'high' if proba > 0.7 else 'medium' if proba > 0.5 else 'low'
    
    return {
        'probability': float(proba),
        'prediction': prediction,
        'risk': risk
    }