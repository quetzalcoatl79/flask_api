from app import celery, create_app

# S'assure que le contexte Flask est initialisé pour les tâches
flask_app = create_app()

@celery.task
def ping():
	return 'pong'
