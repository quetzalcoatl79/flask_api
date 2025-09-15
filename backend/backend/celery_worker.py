from celery import Celery

# Add your Celery configuration and worker code below
app = Celery('backend', broker='redis://localhost:6379/0')

@app.task
def example_task(x, y):
	return x + y