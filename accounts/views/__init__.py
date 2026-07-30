"""
Accounts views module.

Exports all API view classes for the accounts app, including
authentication, patient, doctor, department, and hospital endpoints.
"""
from .auth import RegisterView, ProfileView
from .patient import PatientProfileView, PatientListCreateView
from .department import DepartmentListCreateView, DepartmentDetailView
from .doctor import DoctorListCreateView, DoctorDetailView
from .hospital import HospitalListCreateView, HospitalDetailView
