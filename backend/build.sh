# cd into backend if we aren't already there (Render might start at root)
if [ -d "backend" ]; then
  cd backend
fi

pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

python manage.py collectstatic --no-input
python manage.py migrate
