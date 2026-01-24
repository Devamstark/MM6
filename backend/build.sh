#!/usr/bin/env bash
# exit on error
set -o errexit

# cd into backend if we aren't already there (Render might start at root)
if [ -d "backend" ]; then
  cd backend
fi

# Ensure we're using the right pip (from venv if it exists)
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
