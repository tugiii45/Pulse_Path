from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.models import Patient, Doctor
from visits.models import Appointment
from notifications.models import Notification


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = {
            "patients": Patient.objects.count(),
            "doctors": Doctor.objects.count(),
            "appointments": Appointment.objects.count(),
            "notifications": Notification.objects.count(),
        }

        return Response(data)