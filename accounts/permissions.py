from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    """Allow access only to superusers (platform superadmins)."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class IsPatient(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'PATIENT'


class IsDoctor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'DOCTOR'


class IsDoctorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'DOCTOR']


class IsDoctorOrAdminOrPatientOwner(BasePermission):
    """Allow doctors/admins full access and patients access only to their own records."""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.role in ['ADMIN', 'DOCTOR']:
            return True

        return request.method in ['GET', 'HEAD', 'OPTIONS']

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        if request.user.role in ['ADMIN', 'DOCTOR']:
            return True

        return self._is_patient_owner(request.user, obj)

    def _is_patient_owner(self, user, obj):
        if hasattr(obj, 'patient'):
            return obj.patient.user == user

        if hasattr(obj, 'appointment'):
            return obj.appointment.patient.user == user

        if hasattr(obj, 'visit'):
            return obj.visit.patient.user == user

        if hasattr(obj, 'clinical_record'):
            return obj.clinical_record.visit.patient.user == user

        if hasattr(obj, 'diagnosis'):
            return obj.diagnosis.visit.patient.user == user

        if hasattr(obj, 'prescription'):
            return obj.prescription.diagnosis.visit.patient.user == user

        if hasattr(obj, 'medication_schedule'):
            return obj.medication_schedule.prescription.diagnosis.visit.patient.user == user

        if hasattr(obj, 'recipient'):
           return obj.recipient == user

        if hasattr(obj, 'created_by'):
           return obj.created_by == user

        if hasattr(obj, 'user'):
            return obj.user == user

        return False


class IsOwnerOrDoctor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        if request.user.role in ['ADMIN', 'DOCTOR']:
            return True

        return IsDoctorOrAdminOrPatientOwner()._is_patient_owner(request.user, obj)


class IsInSameHospital(BasePermission):
    """
    Ensure the user's hospital matches the hospital associated with the
    object being accessed.

    This permission is designed to be used as a complement to the
    HospitalQuerySetMixin for object-level access control.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        # Superusers can access any object.
        if request.user.is_superuser:
            return True

        # If the user has no hospital, deny access.
        if not request.user.hospital_id:
            return False

        user_hospital = request.user.hospital

        # Try to determine the object's hospital through various paths.
        obj_hospital = self._get_object_hospital(obj)

        return obj_hospital == user_hospital

    def _get_object_hospital(self, obj):
        """Trace the object's relationships to find its hospital."""
        # Direct hospital field.
        if hasattr(obj, 'hospital') and obj.hospital_id:
            return obj.hospital

        # User field (e.g., CustomUser, Doctor, Patient have user FK).
        if hasattr(obj, 'user') and hasattr(obj.user, 'hospital') and obj.user.hospital_id:
            return obj.user.hospital

        # Patient field.
        if hasattr(obj, 'patient') and hasattr(obj.patient, 'user') and obj.patient.user.hospital_id:
            return obj.patient.user.hospital

        # Doctor field.
        if hasattr(obj, 'doctor') and hasattr(obj.doctor, 'user') and obj.doctor.user.hospital_id:
            return obj.doctor.user.hospital

        # Visit field.
        if hasattr(obj, 'visit') and hasattr(obj.visit, 'patient'):
            return obj.visit.patient.user.hospital

        # Appointment field.
        if hasattr(obj, 'appointment') and hasattr(obj.appointment, 'patient'):
            return obj.appointment.patient.user.hospital

        # Prescription -> Diagnosis -> Visit -> Patient -> User -> Hospital.
        if hasattr(obj, 'prescription') and hasattr(obj.prescription, 'diagnosis'):
            return obj.prescription.diagnosis.visit.patient.user.hospital

        # Recipient / Created_by (for notifications).
        if hasattr(obj, 'recipient') and obj.recipient.hospital_id:
            return obj.recipient.hospital

        if hasattr(obj, 'created_by') and obj.created_by and obj.created_by.hospital_id:
            return obj.created_by.hospital

        # Department -> Hospital.
        if hasattr(obj, 'department') and hasattr(obj.department, 'hospital') and obj.department.hospital_id:
            return obj.department.hospital

        return None

