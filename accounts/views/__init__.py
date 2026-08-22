"""
Accounts views module.

Exports all API view classes for the accounts app, including
authentication, patient, doctor, department, and hospital endpoints.
"""
from .auth import *
from .patient import PatientProfileView, PatientListView
from .department import DepartmentListCreateView, DepartmentDetailView
from .doctor import DoctorListCreateView, DoctorDetailView
from .hospital import *
from .doctor_provisioning import *
from .admin_provisioning import *
