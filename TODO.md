# Multi-Hospital Architecture Implementation - TODO

## Step 1: Model Changes
- [x] `accounts/models/user.py` - Add `hospital` FK field to CustomUser

## Step 2: New View Mixin
- [x] `accounts/views/mixins.py` - Create `HospitalQuerySetMixin` with configurable `hospital_field`

## Step 3: New Permission
- [x] `accounts/permissions.py` - Add `IsInSameHospital` permission
- [x] `accounts/permissions.py` - Add `IsSuperAdmin` permission

## Step 4: Hospital CRUD Views (Superadmin only)
- [x] `accounts/views/hospital.py` - HospitalListCreateView, HospitalDetailView
- [x] `accounts/views/__init__.py` - Export new views
- [x] `accounts/urls.py` - Register hospital endpoints

## Step 5: Serializer Updates
- [x] `accounts/serializers/auth.py` - Add hospital field, filter active hospitals
- [x] `accounts/serializers/department.py` - Add hospital field (auto-set from user)
- [x] `accounts/serializers/doctor.py` - Validate department.hospital == user.hospital
- [x] `visits/serializers/visit.py` - Filter appointment queryset by hospital
- [x] `visits/serializers/appointment.py` - Filter patient/doctor by hospital
- [x] `clinical/serializers/clinical_record.py` - Filter visit by hospital
- [x] `clinical/serializers/diagnosis.py` - Filter visit by hospital

## Step 6: View Updates (Apply HospitalQuerySetMixin)
- [x] `accounts/views/department.py` - Filter by hospital
- [x] `accounts/views/doctor.py` - Filter by hospital, filter departments by hospital
- [x] `accounts/views/patient.py` - Filter by hospital
- [x] `visits/views/visit.py` - Filter by hospital
- [x] `visits/views/appointment.py` - Filter by hospital
- [x] `treatment/views/treatment.py` - Filter by hospital
- [x] `treatment/views/prescription.py` - Filter by hospital
- [x] `treatment/views/medication.py` - Filter by hospital
- [x] `treatment/views/medication_schedule.py` - Filter by hospital
- [x] `treatment/views/medication_log.py` - Filter by hospital
- [x] `treatment/views/side_effect_report.py` - Filter by hospital
- [x] `treatment/views/recovery_progress.py` - Filter by hospital
- [x] `clinical/views/clinical.py` - Filter by hospital
- [x] `clinical/views/diagnosis.py` - Filter by hospital
- [x] `notifications/views/notification.py` - Filter by hospital

## Step 7: Admin Updates
- [x] `accounts/admin.py` - Show hospital in CustomUser admin

## Step 8: Migrations
- [x] Generate and apply migration for CustomUser.hospital


