"""
Accounts models module.

Exports all models for the accounts app:
- CustomUser: Primary authentication model with role-based access.
- Patient: Medical patient profile linked to a user account.
- Doctor: Medical professional profile linked to a user account.
- Department: Hospital department/unit (e.g., Cardiology).
- Hospital: Healthcare organization that scopes all data.
"""
from .user import CustomUser
from .patient import Patient
from .doctor import Doctor
from .department import Department
from .hospital import Hospital
