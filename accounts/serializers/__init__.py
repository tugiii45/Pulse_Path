"""
Accounts serializers module.

Exports serializer classes for all accounts app models, providing
JSON serialization/deserialization for user registration, profile
management, patient info, departments, and doctors.
"""
from .auth import RegisterSerializer, ProfileSerializer
from .patient import PatientSerializer
from .department import DepartmentSerializer
from .doctor import DoctorSerializer
from .doctor_provisioning import AdminCreateDoctorSerializer, SetPasswordSerializer
from .admin_provisioning import *