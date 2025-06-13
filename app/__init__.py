from flask import Flask
from .extensions import db, login_manager, migrate
from .models import User
from .auth import auth  
from .routes import main 
from config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    @app.context_processor
    def inject_app_name():
        return dict(app_name=app.config['APP_NAME'])

    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    login_manager.login_view = "auth.login"

    app.register_blueprint(auth)
    app.register_blueprint(main)

    return app
