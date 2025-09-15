FROM python:3.11-slim
WORKDIR /app/backend
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PYTHONPATH=/app:/app/backend
ENV FLASK_APP=app:app
EXPOSE 5000
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
