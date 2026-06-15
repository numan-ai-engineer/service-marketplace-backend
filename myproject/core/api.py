from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

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

    return Response(serializer.data, status=status.HTTP_201_CREATED)