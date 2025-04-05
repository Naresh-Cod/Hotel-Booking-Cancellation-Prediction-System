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