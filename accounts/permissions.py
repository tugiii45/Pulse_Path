"""
Custom permission classes for PulsePath.

This module defines role-based and ownership-based permissions that
are used across all API views to enforce access control.

Permission hierarchy (from most to least restrictive):
1. IsSuperAdmin         - Platform superusers only
2. IsAdmin              - Hospital administrators
3. IsDoctor             - Healthcare professionals
4. IsDoctorOrAdmin      - Doctors and administrators
5. IsPatient            - Patients only
6. IsOwnerOrDoctor      - Patient owners + doctors/admins
7. IsDoctorOrAdminOrPatientOwner - Mixed: list vs object ownership
8. IsInSameHospital     - Hospital-scoped access
"""

from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    """Allow access only to superusers (platform superadmins)."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class IsAdmin(BasePermission):
    """Allow access only to users with the ADMIN role."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "ADMIN"


class IsPatient(BasePermission):
    """Allow access only to users with the PATIENT role."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "PATIENT"


class IsDoctor(BasePermission):
    """Allow access only to users with the DOCTOR role."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "DOCTOR"


class IsDoctorOrAdmin(BasePermission):
    """Allow access to users who are either doctors or hospital administrators."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ["ADMIN", "DOCTOR"]
        )


class IsDoctorOrAdminOrPatientOwner(BasePermission):
    """
    Doctors and admins have access within their normal hospital scope.

    Patients have read-only access and can only access records
    belonging to themselves.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.role in ["ADMIN", "DOCTOR"]:
            return True

        if request.user.role == "PATIENT":
            return request.method in ["GET", "HEAD", "OPTIONS"]

        return False

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        if request.user.role in ["ADMIN", "DOCTOR"]:
            return True

        if request.user.role == "PATIENT":
            if request.method not in ["GET", "HEAD", "OPTIONS"]:
                return False

            return self._is_patient_owner(request.user, obj)

        return False

    def _is_patient_owner(self, user, obj):
        """
        Determine whether the object belongs to the authenticated patient.
        """

        # Direct patient FK.
        if hasattr(obj, "patient"):
            return obj.patient.user == user

        # Appointment -> patient.
        if hasattr(obj, "appointment"):
            return obj.appointment.patient.user == user

        # Visit -> patient.
        if hasattr(obj, "visit"):
            return obj.visit.patient.user == user

        # Clinical record -> visit -> patient.
        if hasattr(obj, "clinical_record"):
            return obj.clinical_record.visit.patient.user == user

        # Diagnosis -> visit -> patient.
        if hasattr(obj, "diagnosis"):
            return obj.diagnosis.visit.patient.user == user

        # Prescription -> diagnosis -> visit -> patient.
        if hasattr(obj, "prescription"):
            return (
                obj.prescription
                .diagnosis
                .visit
                .patient
                .user
                == user
            )

        # Medication schedule -> prescription -> diagnosis -> visit -> patient.
        if hasattr(obj, "medication_schedule"):
            return (
                obj.medication_schedule
                .prescription
                .diagnosis
                .visit
                .patient
                .user
                == user
            )

        # Notification ownership.
        if hasattr(obj, "recipient") and obj.recipient == user:
            return True

        if hasattr(obj, "created_by") and obj.created_by == user:
            return True

        # Generic user FK.
        if hasattr(obj, "user"):
            return obj.user == user

        return False


class IsOwnerOrDoctor(BasePermission):
    """
    Doctors and admins can access records within their permitted scope.

    Patients can only read records that belong to them.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        # Doctors and admins can access records within
        # their queryset/hospital scope.
        if request.user.role in ["ADMIN", "DOCTOR"]:
            return True

        # Patients are read-only.
        if request.user.role == "PATIENT":
            if request.method not in ["GET", "HEAD", "OPTIONS"]:
                return False

            return IsDoctorOrAdminOrPatientOwner()._is_patient_owner(
                request.user,
                obj,
            )

        return False

class IsInSameHospital(BasePermission):
    """
    Ensure the user's hospital matches the hospital associated with the
    object being accessed.

    This permission is designed to be used as a complement to the
    HospitalQuerySetMixin for object-level access control. While the
    mixin filters list queries, this permission handles individual
    object access for detail views.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        # Superusers can access any object regardless of hospital.
        if request.user.is_superuser:
            return True

        # Users without a hospital cannot access hospital-scoped objects.
        if not request.user.hospital_id:
            return False

        user_hospital = request.user.hospital

        # Determine the object's hospital by tracing its relationships.
        obj_hospital = self._get_object_hospital(obj)

        return obj_hospital == user_hospital

    def _get_object_hospital(self, obj):
        """
        Trace the object's relationships to find its associated hospital.

        Since different models connect to Hospital through different
        relationship paths, this method tries multiple strategies:
        - Direct hospital FK (e.g., Department, Hospital)
        - Through user FK (e.g., Doctor, Patient via CustomUser)
        - Through patient -> user -> hospital
        - Through visit -> patient -> user -> hospital
        - Through appointment -> patient -> user -> hospital
        - Through prescription -> diagnosis -> visit -> patient -> user -> hospital
        - Through recipient/created_by (notifications)
        - Through department -> hospital
        """
        # Direct hospital field (e.g., Department model).
        if hasattr(obj, "hospital") and obj.hospital_id:
            return obj.hospital

        # User field that has a hospital (e.g., Doctor, Patient).
        if (
            hasattr(obj, "user")
            and hasattr(obj.user, "hospital")
            and obj.user.hospital_id
        ):
            return obj.user.hospital

        # Patient -> User -> Hospital.
        if (
            hasattr(obj, "patient")
            and hasattr(obj.patient, "user")
            and obj.patient.user.hospital_id
        ):
            return obj.patient.user.hospital

        # Doctor -> User -> Hospital.
        if (
            hasattr(obj, "doctor")
            and hasattr(obj.doctor, "user")
            and obj.doctor.user.hospital_id
        ):
            return obj.doctor.user.hospital

        # Visit -> Patient -> User -> Hospital.
        if hasattr(obj, "visit") and hasattr(obj.visit, "patient"):
            return obj.visit.patient.user.hospital

        # Appointment -> Patient -> User -> Hospital.
        if hasattr(obj, "appointment") and hasattr(obj.appointment, "patient"):
            return obj.appointment.patient.user.hospital

        # Prescription -> Diagnosis -> Visit -> Patient -> User -> Hospital.
        if hasattr(obj, "prescription") and hasattr(obj.prescription, "diagnosis"):
            return obj.prescription.diagnosis.visit.patient.user.hospital

        # Notification recipient or creator.
        if hasattr(obj, "recipient") and obj.recipient.hospital_id:
            return obj.recipient.hospital

        if hasattr(obj, "created_by") and obj.created_by and obj.created_by.hospital_id:
            return obj.created_by.hospital

        # Department -> Hospital.
        if (
            hasattr(obj, "department")
            and hasattr(obj.department, "hospital")
            and obj.department.hospital_id
        ):
            return obj.department.hospital

        return None

class IsDoctorOrAdminOrPatientCreate(BasePermission):
    """
    Doctors and admins have full access.
    Patients may only create (self-book) new appointments;
    read/list access for patients is scoped via get_queryset.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.role in ["ADMIN", "DOCTOR"]:
            return True

        if request.user.role == "PATIENT":
            return request.method in ["GET", "HEAD", "OPTIONS", "POST"]

        return False
