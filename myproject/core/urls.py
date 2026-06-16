from django.urls import path, include
from .views import update_booking_status
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    ServiceViewSet,
    WorkerProfileViewSet,
    BookingViewSet,
    test_protected,
)

from .api import register_user

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'workers', WorkerProfileViewSet)
router.register(r'bookings', BookingViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("bookings/<int:pk>/status/", update_booking_status),
    path('register/', register_user),

    # 🔒 PROTECTED API
    path('protected/', test_protected),
]
