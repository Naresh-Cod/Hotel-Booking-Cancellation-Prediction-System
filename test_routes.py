import pytest
from app import create_app
from app.database import db

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"
    })
    with app.app_context():
        db.create_all()
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

def test_dashboard(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b"Dashboard" in response.data