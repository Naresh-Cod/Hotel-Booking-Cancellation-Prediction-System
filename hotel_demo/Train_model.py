import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Load and prepare data
data = pd.read_csv('hotel_bookings.csv')
X = data.drop(['booking_status', 'Booking_ID'], axis=1)
y = data['booking_status'].map({'Canceled': 1, 'Not_Canceled': 0})  # Adjust based on your data

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define features
categorical_features = ['type_of_meal_plan', 'room_type_reserved', 'market_segment_type']
numerical_features = ['no_of_adults', 'no_of_children', 'no_of_weekend_nights', 'no_of_week_nights',
                      'lead_time', 'arrival_year', 'arrival_month', 'arrival_date',
                      'repeated_guest', 'no_of_previous_cancellations',
                      'no_of_previous_bookings_not_canceled', 'avg_price_per_room',
                      'no_of_special_requests', 'required_car_parking_space']

# Preprocessing pipeline
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

# Model pipeline
pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])

# Train the model
pipeline.fit(X_train, y_train)

# Evaluate the model
y_pred = pipeline.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred)}")
print(classification_report(y_test, y_pred))

# Save the model
joblib.dump(pipeline, 'hotel_cancellation_model.pkl')