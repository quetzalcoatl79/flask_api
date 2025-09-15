from app import app
from extensions import db
from models import User  # noqa: F401 (ensure model is registered)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print('Tables créées (si elles n’existaient pas).')
