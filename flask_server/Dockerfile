FROM python:3.11-slim

WORKDIR /app

# (Tuỳ project bạn cần build opencv, cmake... thì bổ sung ở đây)
# RUN apt-get update && apt-get install -y ...

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

ENV PYTHONUNBUFFERED=1
EXPOSE 5001

# Chạy bằng gunicorn cho ổn định
CMD ["gunicorn", "-w", "1", "-b", "0.0.0.0:5001", "app:app"]
