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
        'Men': ['men', 'man', 'boy', 'guy', 'shirt', 'gentleman'],
        'Women': ['women', 'woman', 'girl', 'lady', 'dress', 'fashion'],
        'Accessories': ['accessories', 'watch', 'bag', 'sunglasses', 'jewelry', 'belt', 'hat'],
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
            'service_intent': None, # New: tracking, shipping, returns, contact
            'search_terms': query.split()
        }

        # 0. Service Intent Detection (FAQ/Tracking)
        if any(w in query for w in ['track', 'where is my', 'order status', 'package']):
            extracted['service_intent'] = 'tracking'
        elif any(w in query for w in ['ship', 'delivery', 'receive', 'how long']):
            extracted['service_intent'] = 'shipping'
        elif any(w in query for w in ['return', 'refund', 'exchange']):
            extracted['service_intent'] = 'returns'
        elif any(w in query for w in ['contact', 'support', 'help', 'email', 'phone', 'address']):
            extracted['service_intent'] = 'contact'

        if extracted['service_intent']:
            return extracted

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
        intent = AIConcierge.parse_intent(query)
        
        # Handle Service Intents
        if intent.get('service_intent'):
            if intent['service_intent'] == 'tracking':
                return "📦 <b>Order Tracking</b>\n\nYou can track your orders directly in the Mini App under <b>'My Orders'</b> or by typing your order number here.", []
            elif intent['service_intent'] == 'shipping':
                return "🚚 <b>Shipping Policy</b>\n\nWe offer <b>Free Shipping</b> on orders over $100! Standard delivery takes 3-7 business days within the US.", []
            elif intent['service_intent'] == 'returns':
                return "🔄 <b>Returns & Refunds</b>\n\nWe accept returns within 30 days of purchase. Items must be in original condition with tags.", []
            elif intent['service_intent'] == 'contact':
                return "📧 <b>Contact Us</b>\n\nSupport: <code>support@smartshop1.us</code>\nAddress: 123 Fashion Ave, New Rochelle, NY\nOr use the <b>Contact Form</b> in our app.", []

        products, intent = AIConcierge.search_products(query)
        
        if not products.exists():
            return "🤷 I couldn't find exactly that. Can I show you something from our main collections?", []

        count = len(products)
        msg = f"✨ I found <b>{count} match</b> for you:" if count == 1 else f"✨ I found <b>{count} matches</b> for you:"
        return msg, products
