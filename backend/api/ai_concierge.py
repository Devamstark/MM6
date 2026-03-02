import re
import logging
from django.db.models import Q
from .models import Product

logger = logging.getLogger(__name__)

class AIConcierge:
    """
    100% Free AI-Style Shopping Assistant.
    Uses Keyword Extraction & Intent Mapping to find products.
    """
    
    # 🎨 Color Dictionary for extraction
    COLORS = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple', 'gray', 'orange', 'brown']
    
    # 📂 Category Mapping
    CATEGORY_KEYWORDS = {
        'electronics': ['phone', 'laptop', 'camera', 'headphone', 'tech', 'gadget'],
        'fashion': ['shirt', 'shoes', 'dress', 'clothing', 'fashion', 'sneaker', 'jeans'],
        'home': ['furniture', 'decor', 'kitchen', 'home', 'living'],
        'beauty': ['makeup', 'skincare', 'perfume', 'beauty', 'cosmetic'],
    }

    @staticmethod
    def parse_intent(query: str):
        """
        Parses a natural language query into product filters.
        Example: "I want red sneakers under $50"
        """
        query = query.lower()
        extracted = {
            'color': None,
            'max_price': None,
            'category': None,
            'search_text': query
        }

        # 1. Extract Price (Look for numbers with $ or 'under')
        price_match = re.search(r'(?:under|below|less than|\$)\s*(\d+)', query)
        if price_match:
            extracted['max_price'] = float(price_match.group(1))

        # 2. Extract Color
        for color in AIConcierge.COLORS:
            if color in query:
                extracted['color'] = color
                break

        # 3. Predict Category based on keywords
        for category, keywords in AIConcierge.CATEGORY_KEYWORDS.items():
            if any(keyword in query for keyword in keywords):
                extracted['category'] = category
                break

        return extracted

    @staticmethod
    def search_products(query: str, limit=5):
        """
        Main Search Logic. Combines Intent Parsing + Database Query.
        """
        intent = AIConcierge.parse_intent(query)
        
        # Start with all active products
        products = Product.objects.all()

        # Apply Price Filter
        if intent['max_price']:
            products = products.filter(price__lte=intent['max_price'])

        # Apply Category Filter
        if intent['category']:
            products = products.filter(category__icontains=intent['category'])

        # Apply Text Search (Name + Description)
        search_terms = Q(name__icontains=query) | Q(description__icontains=query)
        
        # If color found, we specifically look for it
        if intent['color']:
            search_terms |= Q(colors__icontains=intent['color'])

        products = products.filter(search_terms).distinct()

        return products[:limit], intent

    @staticmethod
    def format_response(query: str):
        """
        Generates a friendly AI-style text response for Telegram.
        """
        products, intent = AIConcierge.search_products(query)
        
        if not products.exists():
            return "❌ No products found matching your search. Try something else like 'Electronics' or 'Fashion'!", []

        response_text = f"🔍 I found {len(products)} products that you might like:\n\n"
        
        # Instead of just text, we return the product list so the bot can send Photo Cards
        return response_text, products
