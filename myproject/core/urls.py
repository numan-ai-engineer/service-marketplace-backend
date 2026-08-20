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
    pending_workers,
    verify_worker,
    worker_profile,
    admin_dashboard,
    forgot_password,
    reset_password,
     worker_online_status,
     update_worker_location,
     worker_location,
     customer_location,
     nearby_workers,
)

from .views import register
from .api import current_user, login_user

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'workers', WorkerProfileViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [

    # Booking Status
    path("bookings/<int:pk>/status/", update_booking_status),

    # Authentication
    path("register/", register),
    path("login/", login_user),
    path("me/", current_user),

    # Forgot Password
    path("forgot-password/", forgot_password),

    # Reset Password
    path(
        "reset-password/<uidb64>/<token>/",
        reset_password,
    ),

    # Protected
    path("protected/", test_protected),

    # Dashboards
    path("worker/dashboard/", worker_dashboard),
    path("customer/dashboard/", customer_dashboard),

    # Notifications
    path("notifications/", notifications),
    path("notifications/count/", notification_count),

    # Worker Verification
    path(
        "worker/upload-verification/",
        upload_verification,
    ),

    # Worker online status
    path(
    "worker/online-status/",
    worker_online_status,
),

# Updated worker location endpoint
path(
    "worker/update-location/",
    update_worker_location,
),

    # Pending Workers
    path(
        "admin/pending-workers/",
        pending_workers,
    ),

    # Admin Dashboard
    path(
        "admin/dashboard/",
        admin_dashboard,
    ),

    # Verify Worker
    path(
        "admin/verify-worker/<int:pk>/",
        verify_worker,
    ),

    # Worker Profile
    path(
        "worker/profile/<int:pk>/",
        worker_profile,
    ),

    # =========================================================
# PROFESSIONAL WORKER LOCATION
# =========================================================

path(
    "worker/location/",
    worker_location,
),

# =========================================================
# CUSTOMER LOCATION
# =========================================================

path(
    "customer/location/",
    customer_location,
),

# =========================================================
# NEARBY WORKERS
# =========================================================

path(
    "customer/nearby-workers/",
    nearby_workers,
),

    # Router URLs
    path("", include(router.urls)),
]