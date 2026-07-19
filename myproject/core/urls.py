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
    notifications,
    notification_count,
    upload_verification,
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

    # Booking Status
    path("bookings/<int:pk>/status/", update_booking_status),

    # Auth
    path("register/", register_user),
    path("me/", current_user),

    # Protected
    path("protected/", test_protected),

    # Dashboards
    path("worker/dashboard/", worker_dashboard),
    path("customer/dashboard/", customer_dashboard),

    # Notifications
    path("notifications/", notifications),
    path("notifications/count/", notification_count),

    # Routes
    path("", include(router.urls)),

    path(
    "worker/upload-verification/",
    upload_verification,
),
]