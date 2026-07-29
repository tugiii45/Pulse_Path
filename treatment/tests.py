from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request
from django.utils import timezone

from accounts.models import CustomUser, Patient
from clinical.models import Diagnosis, ClinicalRecord
from clinical.serializers.clinical_record import ClinicalRecordSerializer
from clinical.serializers.diagnosis import DiagnosisSerializer
from treatment.models import MedicationSchedule, Prescription, RecoveryProgress, SideEffectReport
from treatment.models.medication import Medication
from treatment.serializers.prescription import PrescriptionSerializer
from treatment.serializers.medication_schedule import MedicationScheduleSerializer
from treatment.serializers.recovery_progress import RecoveryProgressSerializer
from treatment.serializers.side_effect_report import SideEffectReportSerializer
from treatment.views.medication_schedule import MedicationScheduleListCreateView
from treatment.views.recovery_progress import RecoveryProgressListCreateView
from visits.models import Visit


class FilteringAPITests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin_user = CustomUser.objects.create_user(
            email='admin@example.com',
            first_name='Admin',
            last_name='User',
            role=CustomUser.Role.ADMIN,
            password='pass1234'
        )
        self.patient_user = CustomUser.objects.create_user(
            email='patient@example.com',
            first_name='Patient',
            last_name='User',
            role=CustomUser.Role.PATIENT,
            password='pass1234'
        )
        self.patient = Patient.objects.create(
            user=self.patient_user,
            date_of_birth='1990-01-01',
            gender='MALE',
            emergency_contact='0712345678',
            address='Nairobi'
        )
        self.visit = Visit.objects.create(patient=self.patient, reason='Follow-up')
        self.diagnosis = Diagnosis.objects.create(
            visit=self.visit,
            condition='Hypertension',
            severity='MILD',
            status='ACTIVE',
            notes='Needs monitoring'
        )
        self.medication = Medication.objects.create(
            name='Amlodipine',
            generic_name='Amlodipine',
            strength='5mg',
            dosage_form='Tablet',
            description='Blood pressure medicine'
        )
        self.prescription = Prescription.objects.create(
            diagnosis=self.diagnosis,
            medication=self.medication,
            dosage='5mg',
            frequency='Once daily',
            duration=7,
            instructions='Take with food'
        )

    def _make_request(self, view_class, query_params=None, user=None):
        request = self.factory.get('/dummy/', query_params or {})
        request.user = user or self.admin_user
        drf_request = Request(request)
        drf_request.user = request.user
        view = view_class()
        view.request = drf_request
        view.args = ()
        view.kwargs = {}
        return view

    def test_recovery_progress_filters_search_and_orders_by_date(self):
        older = RecoveryProgress.objects.create(
            patient=self.patient,
            visit=self.visit,
            pain_level=4,
            notes='Improving slowly',
            improvement_percentage=30,
            recorded_at=timezone.now() - timezone.timedelta(days=2)
        )
        newer = RecoveryProgress.objects.create(
            patient=self.patient,
            visit=self.visit,
            pain_level=2,
            notes='Much better today',
            improvement_percentage=70,
            recorded_at=timezone.now()
        )

        view = self._make_request(RecoveryProgressListCreateView)
        queryset = view.filter_queryset(view.get_queryset())

        self.assertEqual(queryset.count(), 2)
        self.assertEqual(queryset.first().id, newer.id)
        self.assertIn('better', queryset.first().notes.lower())

    def test_medication_schedule_defaults_to_active_only(self):
        active_schedule = MedicationSchedule.objects.create(
            prescription=self.prescription,
            scheduled_time=timezone.now(),
            start_date='2026-07-01',
            end_date='2026-07-10',
            is_active=True
        )
        MedicationSchedule.objects.create(
            prescription=self.prescription,
            scheduled_time=timezone.now(),
            start_date='2026-07-11',
            end_date='2026-07-20',
            is_active=False
        )

        view = self._make_request(MedicationScheduleListCreateView)
        queryset = view.filter_queryset(view.get_queryset())

        self.assertEqual(queryset.count(), 1)
        self.assertEqual(queryset.first().id, active_schedule.id)

    def test_clinical_record_serializer_rejects_duplicate_record_for_same_visit(self):
        ClinicalRecord.objects.create(visit=self.visit, allergies='Pollen')
        serializer = ClinicalRecordSerializer(data={
            'visit': self.visit.id,
            'allergies': 'Dust'
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('visit', serializer.errors)

    def test_diagnosis_serializer_requires_clinical_record_on_visit(self):
        serializer = DiagnosisSerializer(data={
            'visit': self.visit.id,
            'condition': 'Diabetes',
            'severity': 'MODERATE',
            'status': 'ACTIVE',
            'notes': 'Needs review'
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('visit', serializer.errors)

    def test_prescription_serializer_validates_duration_and_frequency(self):
        serializer = PrescriptionSerializer(data={
            'diagnosis': self.diagnosis.id,
            'medication': self.medication.id,
            'dosage': '',
            'frequency': '',
            'duration': 0,
            'instructions': 'Take as directed'
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('dosage', serializer.errors)
        self.assertIn('frequency', serializer.errors)
        self.assertIn('duration', serializer.errors)

    def test_medication_schedule_serializer_rejects_invalid_date_range(self):
        serializer = MedicationScheduleSerializer(data={
            'prescription': self.prescription.id,
            'scheduled_time': timezone.now(),
            'start_date': '2026-07-10',
            'end_date': '2026-07-05',
            'is_active': True
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('end_date', serializer.errors)

    def test_recovery_progress_serializer_validates_progress_consistency(self):
        serializer = RecoveryProgressSerializer(data={
            'patient': self.patient.id,
            'visit': self.visit.id,
            'pain_level': 11,
            'body_temperature': 37.2,
            'feeling_better': True,
            'notes': 'Feeling okay',
            'improvement_percentage': 0
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('pain_level', serializer.errors)

    def test_side_effect_report_requires_active_medication_schedule(self):
        serializer = SideEffectReportSerializer(data={
            'patient': self.patient.id,
            'prescription': self.prescription.id,
            'medication': self.medication.id,
            'severity': 'Mild',
            'description': 'Headache after dose'
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('prescription', serializer.errors)
