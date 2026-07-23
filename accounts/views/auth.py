from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from ..serializers import RegisterSerializer, ProfileSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

# Create your views here.


# API view for registering new users.
# Accepts user details, validates the input, and creates a new account.
class RegisterView(APIView):

    # Handle POST requests for user registration.
    def post(self, request):

        # Deserialize and validate the incoming registration data.
        serializer = RegisterSerializer(data=request.data)

        # Save the user if the data is valid.
        if serializer.is_valid():
            serializer.save()

            # Return the created user's data with a 201 Created status.
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Return validation errors if the submitted data is invalid.
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# API view for retrieving the authenticated user's profile.
# Only logged-in users are allowed to access this endpoint.
class ProfileView(APIView):

    # Restrict access to authenticated users only.
    permission_classes = [IsAuthenticated]

    # Handle GET requests to retrieve the current user's profile.
    def get(self, request):

        # Serialize the currently authenticated user's information.
        serializer = ProfileSerializer(request.user)

        # Return the serialized profile data.
        return Response(serializer.data)