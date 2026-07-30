"""
Accounts URL configuration.

Defines API routes for authentication, patient profiles, departments,
doctors, and hospitals. Each route maps to a dedicated view class.
"""

from django.urls import path
from .views import RegisterView, ProfileView
from .views.patient import PatientProfileView, PatientListCreateView
from .views.department import DepartmentListCreateView, DepartmentDetailView
from .views.doctor import DoctorListCreateView, DoctorDetailView
from .views.hospital import HospitalListCreateView, HospitalDetailView

urlpatterns = [
    # Authentication
    path("register/", RegisterView.as_view(), name="register"),
    path("profile/", ProfileView.as_view(), name="profile"),
    # Patient management
    path("patient_profile/", PatientProfileView.as_view(), name="patient_profile"),
    path("patients/", PatientListCreateView.as_view(), name="patients"),
    # Department management
    path("departments/", DepartmentListCreateView.as_view(), name="department-list-create"),
    path("departments/<int:pk>/", DepartmentDetailView.as_view(), name="department-detail"),
    # Doctor management
    path("doctors/", DoctorListCreateView.as_view(), name="doctor-list-create"),
    path("doctors/<int:pk>/", DoctorDetailView.as_view(), name="doctor-detail"),
    # Hospital management (superadmin only)
    path("hospitals/", HospitalListCreateView.as_view(), name="hospital-list-create"),
    path("hospitals/<int:pk>/", HospitalDetailView.as_view(), name="hospital-detail"),
]
