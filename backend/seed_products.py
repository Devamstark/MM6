import os
import django
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import User, Product

def seed_demo_products():
    # Create or get admin
    admin_email = 'admin@test.com'
    seller, created = User.objects.get_or_create(
        email=admin_email,
        defaults={
            'username': 'admin',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        seller.set_password('admin123')
        seller.save()

    demo_products = [
        {
            "name": "Men's Casual Black T-Shirt",
            "slug": "mens-casual-black-tshirt",
            "description": "Premium cotton shirt for any occasion.",
            "price": 25.0,
            "category": "Fashion",
            "gender": "Men",
            "colors": "black",
            "stock_quantity": 50
        },
        {
            "name": "Classic White Sneakers",
            "slug": "classic-white-sneakers-shoes",
            "description": "Comfortable white shoes for walking and running.",
            "price": 55.0,
            "category": "Fashion",
            "gender": "Unisex",
            "colors": "white",
            "stock_quantity": 25
        },
        {
            "name": "Women's Floral Dress",
            "slug": "womens-floral-dress",
            "description": "Elegant summer dress with floral patterns.",
            "price": 45.0,
            "category": "Fashion",
            "gender": "Women",
            "colors": "blue,white",
            "stock_quantity": 30
        },
        {
            "name": "SmartShop Wireless Headphones",
            "slug": "ss-wireless-headphones",
            "description": "Noise-cancelling tech gadget.",
            "price": 120.0,
            "category": "Electronics",
            "gender": "Unisex",
            "colors": "black",
            "stock_quantity": 15
        }
    ]

    for p_data in demo_products:
        Product.objects.get_or_create(
            slug=p_data['slug'],
            defaults={
                "seller": seller,
                **p_data
            }
        )
    print("Demo products seeded successfully!")

if __name__ == "__main__":
    seed_demo_products()
