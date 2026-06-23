from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Home Page
def home(request):
    return HttpResponse("Service App Backend Running Successfully")


urlpatterns = [
    # Home URL
    path("", home),

    # Admin Panel
    path("admin/", admin.site.urls),

    # Core API URLs
    path("api/", include("core.urls")),

    # JWT Authentication
    path(
        "api/token/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair"
    ),
    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),
]