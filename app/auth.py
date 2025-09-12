from flask import Blueprint, jsonify, request
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from .models import User
from .extensions import db

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
    if current_user.is_authenticated:
        return jsonify({
            'success': True,
            'message': 'Déjà connecté',
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email
            }
        })

    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'Données JSON requises'}), 400
    
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'message': 'Nom d\'utilisateur et mot de passe requis'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'success': False, 'message': 'Identifiants invalides'}), 401

    login_user(user)
    return jsonify({
        'success': True,
        'message': 'Connecté avec succès',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        }
    })

@auth.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'success': True, 'message': 'Déconnecté avec succès'})

@auth.route('/register', methods=['POST'])
def register():
    if current_user.is_authenticated:
        return jsonify({
            'success': True,
            'message': 'Déjà connecté',
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email
            }
        })

    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'Données JSON requises'}), 400

    username = data.get('username')
    email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    address = data.get('address')
    phone = data.get('phone')
    password = data.get('password')
    password_confirm = data.get('password_confirm')

    if not all([username, email, first_name, last_name, password, password_confirm]):
        return jsonify({'success': False, 'message': 'Tous les champs obligatoires doivent être remplis'}), 400

    if password != password_confirm:
        return jsonify({'success': False, 'message': 'Les mots de passe ne correspondent pas'}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'success': False, 'message': 'Nom d\'utilisateur ou email déjà utilisé'}), 409

    new_user = User(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        address=address,
        phone=phone,
        password_hash=generate_password_hash(password)
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Inscription réussie',
        'user': {
            'id': new_user.id,
            'username': new_user.username,
            'email': new_user.email,
            'first_name': new_user.first_name,
            'last_name': new_user.last_name
        }
    })

@auth.route('/status', methods=['GET'])
def status():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name
            }
        })
    else:
        return jsonify({'authenticated': False})