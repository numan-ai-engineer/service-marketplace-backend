from rest_framework import serializers
from .models import ( User, Service, WorkerProfile, Booking, Review, WorkerLocation, CustomerLocation, )


# =========================
# USER SERIALIZER
# =========================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


# =========================
# SERVICE SERIALIZER
# =========================
class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


# =========================
# WORKER SERIALIZER
# =========================
class WorkerProfileSerializer(serializers.ModelSerializer):

    user = serializers.SerializerMethodField()
    services = serializers.SerializerMethodField()

    class Meta:
        model = WorkerProfile
        fields = "__all__"

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "name": obj.user.username,
            "phone": obj.user.phone,
        }

    def get_services(self, obj):
        return [
            {
                "id": service.id,
                "name": service.name,
            }
            for service in obj.services.all()
        ]

    # =========================================================
# WORKER LOCATION SERIALIZER
# =========================================================

class WorkerLocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkerLocation
        fields = [
            "latitude",
            "longitude",
            "accuracy",
            "speed",
            "heading",
            "updated_at",
        ]

        read_only_fields = [
            "updated_at",
        ]

    def validate_latitude(self, value):
        if value < -90 or value > 90:
            raise serializers.ValidationError(
                "Latitude must be between -90 and 90."
            )

        return value

    def validate_longitude(self, value):
        if value < -180 or value > 180:
            raise serializers.ValidationError(
                "Longitude must be between -180 and 180."
            )

        return value

    def validate_accuracy(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Accuracy cannot be negative."
            )

        return value

    def validate_speed(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Speed cannot be negative."
            )

        return value

    def validate_heading(self, value):
        if value is not None and (value < 0 or value > 360):
            raise serializers.ValidationError(
                "Heading must be between 0 and 360 degrees."
            )

        return value


# =========================
# BOOKING SERIALIZER (FINAL FIX)
# =========================
class BookingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['customer', 'worker']

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["customer"] = {
            "id": instance.customer.id,
            "name": instance.customer.username,
            "phone": instance.customer.phone,
        }

        data["worker"] = {
            "id": instance.worker.id,
            "name": instance.worker.username,
            "phone": instance.worker.phone,
        }

        data["service"] = {
            "id": instance.service.id,
            "name": instance.service.name,
        }

        data["booking_date"] = instance.created_at
        
        return data
# =========================
# REVIEW SERIALIZER
# =========================
class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(
        source="customer.username",
        read_only=True,
    )

    class Meta:
        model = Review
        fields = [
            "id",
            "customer",
            "customer_name",
            "worker",
            "booking",
            "rating",
            "comment",
            "created_at",
        ]

        read_only_fields = [
            "customer",
            "worker",
            "created_at",
        ]

# Varification Serializer
class WorkerVerificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkerProfile
        fields = [
            "cnic",
            "cnic_front",
            "cnic_back",
            "selfie",
            "verification_status",
            "is_verified",
        ]

        read_only_fields = [
            "verification_status",
            "is_verified",
        ]

        # =========================================================
# CUSTOMER LOCATION SERIALIZER
# =================================================================
class CustomerLocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomerLocation

        fields = [
            "latitude",
            "longitude",
            "accuracy",
            "updated_at",
        ]

        read_only_fields = [
            "updated_at",
        ]

        # Register 

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "phone",
            "password",
            "role",
        ]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            phone=validated_data["phone"],
            password=validated_data["password"],
            role=validated_data["role"],
        )

        return user