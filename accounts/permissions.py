from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'ADMIN'
        )

class IsPatient(BasePermission):    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'PATIENT'
        )

class IsDoctor(BasePermission):    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'DOCTOR'
        )

class IsDoctorOrAdmin(BasePermission):    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['ADMIN', 'DOCTOR']
        )

class IsOwnerOrDoctor(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['ADMIN', 'DOCTOR']:
            return True

        if hasattr(obj, 'patient'):
            return obj.patient.user == request.user

        if hasattr(obj, 'appointment'):
            return obj.appointment.patient.user == request.user

        if hasattr(obj, 'visit'):
            return obj.visit.appointment.patient.user == request.user

        if hasattr(obj, 'clinical_record'):
            return obj.clinical_record.visit.appointment.patient.user == request.user

        if hasattr(obj, 'diagnosis'):
            return obj.diagnosis.clinical_record.visit.appointment.patient.user == request.user

        if hasattr(obj, 'prescription'):
            return obj.prescription.diagnosis.clinical_record.visit.appointment.patient.user == request.user

        if hasattr(obj, 'medication_schedule'):
            return obj.medication_schedule.prescription.diagnosis.clinical_record.visit.appointment.patient.user == request.user


        if hasattr(obj, 'user'):
            return obj.user == request.user

        return False

       
