from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from extensions import db
from models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'msg': 'Username already exists'}), 409
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'msg': 'User created'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        # JWT identity forced to string for compatibility across versions
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        return jsonify({'access_token': access_token, 'refresh_token': refresh_token}), 200
    return jsonify({'msg': 'Bad credentials'}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    try:
        uid = int(user_id)
    except (TypeError, ValueError):
        return jsonify({'msg': 'Invalid token identity'}), 422
    user = User.query.get(uid)
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    return jsonify({'id': user.id, 'username': user.username, 'email': user.email})

@auth_bp.route('/logout', methods=['POST'])
@jwt_required(optional=True)
def logout():
    # Pour JWT stateless classique côté client: on ne peut pas réellement invalider
    # sans liste de révocation. Placeholder pour extension future.
    return jsonify({'msg': 'Logged out (client discard tokens)'}), 200
