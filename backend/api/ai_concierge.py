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

    # 👫 Gender Dictionary
    GENDERS = ['men', 'women', 'unisex', 'man', 'woman', 'male', 'female']

    @staticmethod
    def parse_intent(query: str):
        query = query.lower()
        extracted = {
            'color': None,
            'max_price': None,
            'category': None,
            'gender': None,
            'search_terms': query.split()
        }

        # 1. Price
        price_match = re.search(r'(?:under|below|less than|\$)\s*(\d+)', query)
        if price_match:
            extracted['max_price'] = float(price_match.group(1))

        # 2. Color
        for color in AIConcierge.COLORS:
            if color in query:
                extracted['color'] = color
                break

        # 3. Gender
        for g in AIConcierge.GENDERS:
            if g in query:
                if g in ['men', 'man', 'male']: extracted['gender'] = 'Men'
                elif g in ['women', 'woman', 'female']: extracted['gender'] = 'Women'
                else: extracted['gender'] = 'Unisex'
                break

        # 4. Category
        for category, keywords in AIConcierge.CATEGORY_KEYWORDS.items():
            if any(keyword in query for keyword in keywords):
                extracted['category'] = category
                break

        return extracted

    @staticmethod
    def search_products(query: str, limit=5):
        intent = AIConcierge.parse_intent(query)
        products = Product.objects.all()

        if intent['max_price']:
            products = products.filter(price__lte=intent['max_price'])

        if intent['gender']:
            products = products.filter(Q(gender__iexact=intent['gender']) | Q(gender__iexact='unisex'))

        if intent['category']:
            products = products.filter(category__icontains=intent['category'])

        # Robust keyword search
        q_obj = Q()
        for term in intent['search_terms']:
            clean_term = term.rstrip('s').rstrip('es') if len(term) > 3 else term
            if len(clean_term) > 2:
                q_obj |= Q(name__icontains=clean_term) | Q(description__icontains=clean_term) | Q(category__icontains=clean_term)
        
        if q_obj:
            products = products.filter(q_obj)

        if intent['color']:
            products = products.filter(colors__icontains=intent['color'])

        return products.distinct()[:limit], intent

    @staticmethod
    def format_response(query: str):
        products, intent = AIConcierge.search_products(query)
        
        if not products.exists():
            return "🤷 I couldn't find exactly that. Can I show you something from our main collections?", []

        return f"✨ I found these {len(products)} match(es) for you:", products
