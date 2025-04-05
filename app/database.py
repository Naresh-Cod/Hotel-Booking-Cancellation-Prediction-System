'''from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()'''

# No need to redefine db here; import it from __init__.py instead
from app import db

def init_db(app):
    # This function is optional now since create_app() handles it
    with app.app_context():
        db.create_all()