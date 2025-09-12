from flask import Blueprint, jsonify
from flask_login import login_required, current_user

main = Blueprint('main', __name__)

@main.route('/')
def index():
    if current_user.is_authenticated:
        return jsonify({
            'message': 'Bienvenue',
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name
            },
            'authenticated': True
        })
    else:
        return jsonify({
            'message': 'Bienvenue sur l\'API Flask',
            'authenticated': False
        })

@main.route('/user')
@login_required
def user_info():
    return jsonify({
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'first_name': current_user.first_name,
            'last_name': current_user.last_name,
            'address': current_user.address,
            'phone': current_user.phone,
            'created_at': current_user.created_at.isoformat() if current_user.created_at else None
        }
    })

# Ajoutez d'autres routes ici
