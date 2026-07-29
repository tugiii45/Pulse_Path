from rest_framework.permissions import BasePermission


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

