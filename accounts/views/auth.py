"""
Auth API views for PulsePath.

Handles user registration (open to everyone) and profile retrieval
(restricted to authenticated users). Registration uses the custom
RegisterSerializer which hashes passwords, and profile retrieval
uses the ProfileSerializer to expose user details.
"""

from rest_framework.response import Response
from rest_framework.views import APIView
from ..serializers import RegisterSerializer, ProfileSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from drf_spectacular.utils import extend_schema


class RegisterView(APIView):
    """
    Public endpoint for creating new user accounts.

    Accepts user registration data, validates it via RegisterSerializer,
    and returns the created user object with a 201 status code.
    This endpoint is open to anyone (AllowAny permission).
    """

    permission_classes = [AllowAny]

    @extend_schema(request=RegisterSerializer, responses={201: RegisterSerializer})
    def post(self, request):
        """
        Handle user registration.

        Deserializes the request body, validates the input, creates
        a new user account with a hashed password, and returns the
        created user data.
        """
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    """
    Authenticated endpoint for retrieving the current user's profile.

    Returns the profile of the currently authenticated user, including
    their email, name, role, hospital, and other profile fields.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Handle GET requests for the user profile.

        Serializes the authenticated user's data using ProfileSerializer
        and returns it in the response.
        """
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)
