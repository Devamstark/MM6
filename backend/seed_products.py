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
            "name": "Men's Sleek Black T-Shirt",
            "slug": "mens-sleek-black-tshirt",
            "description": "High-quality cotton t-shirt for daily wear.",
            "price": 25.0,
            "category": "Fashion",
            "gender": "Men",
            "colors": "black",
            "stock_quantity": 50
        },
        {
            "name": "Women's Floral Summer Dress",
            "slug": "womens-floral-summer-dress",
            "description": "Light and airy dress perfect for the beach.",
            "price": 45.0,
            "category": "Fashion",
            "gender": "Women",
            "colors": "blue,white",
            "stock_quantity": 30
        },
        {
            "name": "SmartShop Pro Headphones",
            "slug": "smartshop-pro-headphones",
            "description": "Noise-cancelling wireless headphones with 40h battery.",
            "price": 120.0,
            "category": "Electronics",
            "gender": "Unisex",
            "colors": "gray",
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
