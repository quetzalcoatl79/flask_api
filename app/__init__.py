from flask import Flask
from .extensions import db, login_manager
from .models import User
from .auth import auth
from .routes import main
from config import Config  # importe ta config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)  # charge la config

    db.init_app(app)
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    login_manager.login_view = "auth.login"

    app.register_blueprint(auth)
    app.register_blueprint(main)

    return app
