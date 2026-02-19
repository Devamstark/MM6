from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.http import JsonResponse

def root_view(request):
    return JsonResponse({"message": "Welcome to SmartShop API"})

urlpatterns = [
    path('', root_view),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
