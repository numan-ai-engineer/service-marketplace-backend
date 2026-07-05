from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    UserViewSet,
    ServiceViewSet,
    WorkerProfileViewSet,
    BookingViewSet,
    ReviewViewSet,
    update_booking_status,
    worker_dashboard,
    customer_dashboard,
    test_protected,
    
)

from .api import register_user, current_user

# Router setup
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'workers', WorkerProfileViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),

    # Booking status update
    path("bookings/<int:pk>/status/", update_booking_status),

    # Auth / register
    path('register/', register_user),
    path("me/", current_user),

    # Protected test
    path('protected/', test_protected),

    # Dashboards
    path("worker/dashboard/", worker_dashboard),
    path("customer/dashboard/", customer_dashboard),
]