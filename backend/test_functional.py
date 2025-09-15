import os
import json
import pytest
from app import create_app, db
from models import User

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI')
    with app.app_context():
        db.drop_all()
        db.create_all()
    with app.test_client() as client:
        yield client


def register(client, username='tester', email='tester@example.com', password='pass1234'):
    return client.post('/register', json={'username': username, 'email': email, 'password': password})

def login(client, username='tester', password='pass1234'):
    return client.post('/login', json={'username': username, 'password': password})

def test_full_auth_flow(client):
    # register
    r = register(client)
    assert r.status_code == 201
    # duplicate register
    r2 = register(client)
    assert r2.status_code == 409
    # login
    l = login(client)
    assert l.status_code == 200
    data = l.get_json()
    assert 'access_token' in data
    token = data['access_token']
    # me
    me = client.get('/me', headers={'Authorization': f'Bearer {token}'})
    assert me.status_code == 200
    j = me.get_json()
    assert j['username'] == 'tester'
    # logout (placeholder)
    lo = client.post('/logout', headers={'Authorization': f'Bearer {token}'})
    assert lo.status_code == 200


def test_health_endpoint(client):
    h = client.get('/health')
    assert h.status_code in (200, 500)
    data = h.get_json()
    assert 'api' in data and 'db' in data and 'celery' in data
