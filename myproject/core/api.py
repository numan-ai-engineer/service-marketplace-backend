from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes, api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserSerializer


@api_view(["POST"])
def register_user(request):
    data = request.data

    username = data.get("username")
    password = data.get("password")
    phone = data.get("phone")
    role = data.get("role", "customer")

    if not username:
        return Response(
            {"error": "Username is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not password:
        return Response(
            {"error": "Password is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not phone:
        return Response(
            {"error": "Phone is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(phone=phone).exists():
        return Response(
            {"error": "Phone already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(
        username=username,
        password=password,
        phone=phone,
        role=role,
    )

    serializer = UserSerializer(user)

    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    role = "admin" if request.user.is_staff else request.user.role

    return Response({
        "username": request.user.username,
        "phone": request.user.phone,
        "role": role,
    })

@api_view(["POST"])
def login_user(request):

    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(
        username=username,
        password=password,
    )

    if user is None:
        return Response(
            {"error": "Invalid Username or Password"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "username": user.username,
            "role": "admin" if user.is_staff else user.role,
        }
    })