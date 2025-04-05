from flask import Flask, request, jsonify, render_template
import joblib
import pandas as pd
import mysql.connector

app = Flask(__name__)
model = joblib.load('hotel_cancellation_model.pkl')

# Database connection
def create_db_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='your_password',
        database='hotel_booking_system'
    )

# Prediction endpoint
@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json()
    df = pd.DataFrame([data])
    prediction = model.predict(df)[0]
    probability = model.predict_proba(df)[0][1]
    result = {
        'booking_id': data.get('booking_id', 'N/A'),
        'prediction': 'Cancelled' if prediction == 1 else 'Not Cancelled',
        'confidence': float(probability)
    }
    return jsonify(result)

# Home page
@app.route('/')
def index():
    return render_template('index.html')


# Get all bookings
@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    conn = create_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM bookings")
    bookings = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(bookings)

# Create a new booking
@app.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.get_json()
    conn = create_db_connection()
    cursor = conn.cursor()
    query = """
        INSERT INTO bookings (booking_id, no_of_adults, no_of_children, ...)
        VALUES (%s, %s, %s, ...)
    """
    values = (data['booking_id'], data['no_of_adults'], data['no_of_children'], ...)
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Booking created'}), 201


if __name__ == '__main__':
    app.run(debug=True)