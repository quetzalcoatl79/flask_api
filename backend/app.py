import os
import time
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from celery import Celery
from dotenv import load_dotenv
from extensions import db
from sqlalchemy import text

load_dotenv('.env')

celery = Celery(__name__)
START_TIME = time.time()
APP_VERSION = os.environ.get('APP_VERSION', '0.1.0')

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')

    CORS(app)
    db.init_app(app)
    Migrate(app, db)
    JWTManager(app)

    # Celery config (broker/result)
    celery.conf.broker_url = os.environ.get('CELERY_BROKER_URL')
    celery.conf.result_backend = os.environ.get('CELERY_RESULT_BACKEND')

    from routes import auth_bp  # import tardif pour éviter les boucles
    app.register_blueprint(auth_bp)

    @app.route('/')
    def index():
        return {'msg': 'API Flask OK'}

    @app.route('/health')
    def health():
        details = {
            'api': True,
            'version': APP_VERSION,
            'uptime_seconds': round(time.time() - START_TIME, 2)
        }
        # DB
        try:
            db.session.execute(text('SELECT 1'))
            details['db'] = True
        except Exception as e:
            db.session.rollback()
            details['db'] = False
            details['db_error'] = str(e.__class__.__name__)
        # Celery
        try:
            from celery_worker import ping
            async_result = ping.delay()
            waited = 0.0
            result_value = None
            while waited < 0.8:
                if async_result.ready():
                    result_value = async_result.result
                    break
                time.sleep(0.05)
                waited += 0.05
            details['celery'] = (result_value == 'pong')
        except Exception as e:
            details['celery'] = False
            details['celery_error'] = str(e.__class__.__name__)
        # Derive overall status
        if details.get('db') and details.get('celery'):
            status = 'ok'
        elif details['api']:
            status = 'degraded'
        else:
            status = 'down'
        details['status'] = status
        details['startup_grace'] = details['uptime_seconds'] < 30 and status != 'ok'
        return jsonify(details), 200

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
