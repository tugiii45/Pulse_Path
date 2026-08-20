from django.core.management.base import BaseCommand
from django.utils import timezone

from treatment.models import MedicationSchedule, Treatment
from visits.models import Appointment
from treatment.models import (
    MedicationSchedule,
    Treatment,
    MedicationLog,
)
from notifications.models import Notification
from notifications.services import create_notification


class Command(BaseCommand):
    help = "Process automated PulsePath notifications."

    def handle(self, *args, **options):
       self.process_medication_reminders()
       self.process_appointment_reminders()
       self.process_follow_up_reminders()
       self.process_missed_dose_alerts()

       self.stdout.write(
         self.style.SUCCESS(
            "Automated notifications processed successfully."
        )
    )

    def process_medication_reminders(self):
        now = timezone.now()
        today = now.date()

        schedules = MedicationSchedule.objects.filter(
            is_active=True,
            start_date__lte=today,
            end_date__gte=today,
        ).select_related(
            "prescription__medication",
            "prescription__diagnosis__visit__patient__user",
        )

        for schedule in schedules:
            scheduled_time = schedule.scheduled_time

            # Only process schedules whose scheduled time has arrived.
            if scheduled_time > now:
                continue

            patient = (
                schedule.prescription
                .diagnosis
                .visit
                .patient
            )

            patient_user = patient.user

            medication_name = (
                schedule.prescription.medication.name
            )

            notification_key = (
                f"medication-{schedule.id}-"
                f"{scheduled_time.date()}-"
                f"{scheduled_time.strftime('%H-%M-%S')}"
            )

            notification, created = create_notification(
                recipient=patient_user,
                title="Medication Reminder",
                message=(
                    f"It is time to take "
                    f"{medication_name}."
                ),
                notification_type=(
                    Notification.NotificationType.MEDICATION
                ),
                notification_key=notification_key,
            )

            if created:
                self.stdout.write(
                    f"Medication reminder created for "
                    f"{patient_user.email}: "
                    f"{medication_name}"
                )

    def process_appointment_reminders(self):
        now = timezone.now()

        # Look for appointments approximately 24 hours from now.
        reminder_start = now + timezone.timedelta(hours=23)
        reminder_end = now + timezone.timedelta(hours=25)

        appointments = Appointment.objects.filter(
            appointment_date__gte=reminder_start,
            appointment_date__lt=reminder_end,
            status__in=["PENDING", "CONFIRMED"],
        ).select_related(
            "patient__user",
            "doctor__user",
        )

        for appointment in appointments:

            patient_user = appointment.patient.user

            doctor_name = (
                appointment.doctor.user.get_full_name()
            )

            appointment_time = (
                appointment.appointment_date.strftime(
                    "%B %d, %Y at %I:%M %p"
                )
            )

            notification_key = (
                f"appointment-reminder-{appointment.id}-"
                f"{appointment.appointment_date.isoformat()}"
            )

            notification, created = create_notification(
                recipient=patient_user,
                title="Appointment Reminder",
                message=(
                    f"You have an appointment with Dr. "
                    f"{doctor_name} on "
                    f"{appointment_time}."
                ),
                notification_type=(
                    Notification.NotificationType.APPOINTMENT
                ),
                notification_key=notification_key,
            )

            if created:
                self.stdout.write(
                    f"Appointment reminder created for "
                    f"{patient_user.email}: "
                    f"{appointment_time}"
                )

    def process_follow_up_reminders(self):
      now = timezone.localdate()

      tomorrow = now + timezone.timedelta(days=1)

      treatments = Treatment.objects.filter(
        follow_up_date=tomorrow,
        status="ACTIVE",
    ).select_related(
        "prescription__diagnosis__visit__patient__user",
    )

      for treatment in treatments:

        patient_user = (
            treatment.prescription
            .diagnosis
            .visit
            .patient
            .user
        )

        notification_key = (
            f"follow-up-{treatment.id}-"
            f"{treatment.follow_up_date.isoformat()}"
        )

        notification, created = create_notification(
            recipient=patient_user,
            title="Follow-up Reminder",
            message=(
                f"You have a follow-up appointment scheduled "
                f"for {treatment.follow_up_date.strftime('%B %d, %Y')}."
            ),
            notification_type=(
                Notification.NotificationType.FOLLOW_UP
            ),
            notification_key=notification_key,
        )

        if created:
            self.stdout.write(
                f"Follow-up reminder created for "
                f"{patient_user.email}: "
                f"{treatment.follow_up_date}"
            )            


    def process_missed_dose_alerts(self):
     now = timezone.now()
     today = now.date()

     schedules = MedicationSchedule.objects.filter(
        is_active=True,
        start_date__lte=today,
        end_date__gte=today,
        scheduled_time__lt=now,
    ).select_related(
        "prescription__medication",
        "prescription__diagnosis__visit__patient__user",
    )

     for schedule in schedules:

        patient = (
            schedule.prescription
            .diagnosis
            .visit
            .patient
        )

        patient_user = patient.user

        # If the patient has already recorded a log
        # for this medication schedule, don't create
        # an automatic missed-dose notification.
        has_log = MedicationLog.objects.filter(
            medication_schedule=schedule
        ).exists()

        if has_log:
            continue

        medication_name = (
            schedule.prescription.medication.name
        )

        notification_key = (
            f"missed-dose-{schedule.id}-"
            f"{schedule.scheduled_time.isoformat()}"
        )

        notification, created = create_notification(
            recipient=patient_user,
            title="Missed Dose Alert",
            message=(
                f"You appear to have missed your scheduled "
                f"dose of {medication_name}."
            ),
            notification_type=(
                Notification.NotificationType.MISSED_DOSE
            ),
            notification_key=notification_key,
        )

        if created:
            self.stdout.write(
                f"Missed dose alert created for "
                f"{patient_user.email}: "
                f"{medication_name}"
            )        