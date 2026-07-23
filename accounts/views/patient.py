from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from accounts.models import Patient
from accounts.serializers import PatientSerializer


# API view for retrieving and updating the authenticated patient's profile.
# Only logged-in users can access this endpoint.
class PatientProfileView(generics.RetrieveUpdateAPIView):

    # Serializer used to convert Patient objects to and from JSON.
    serializer_class = PatientSerializer

    # Restrict access to authenticated users only.
    permission_classes = [IsAuthenticated]

    # Return the Patient profile associated with the currently logged-in user.
    # This ensures that a patient can only view and update their own profile.
    def get_object(self):
        return Patient.objects.get(user=self.request.user)