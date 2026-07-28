#  PulsePath

> ## Overview

**PulsePath** is a modern healthcare management system designed to digitize and streamline the entire patient care lifecycle. Developed as a capstone project using **Django REST Framework** and **PostgreSQL**, it provides a secure, scalable RESTful API that connects patients and healthcare providers through a centralized platform.

The system manages every stage of care, including patient registration, appointment scheduling, clinical visits, medical records, diagnoses, prescriptions, medication scheduling, adherence tracking, symptom logging, side-effect reporting, recovery monitoring, and healthcare notifications. By consolidating these processes, PulsePath improves data accessibility, reduces manual record keeping, and enhances communication between patients and healthcare professionals.

A key feature of PulsePath is its focus on **continuity of care**. Instead of ending the patient journey after treatment, the platform enables healthcare providers to monitor recovery, medication adherence, and reported symptoms over time, supporting better clinical decisions and improved patient outcomes.

Built with a modular architecture, JWT-based authentication, and interactive API documentation using Swagger/OpenAPI, PulsePath is designed to be maintainable, extensible, and ready for future enhancements such as AI-powered clinical decision support, M-Pesa integration, mobile applications, and real-time healthcare notifications.



##  Features

-  JWT Authentication & User Management
-  Patient Profile Management
-  Appointment Booking & Visit Tracking
-  Clinical Records & Diagnoses
-  Prescription Management
-  Medication Scheduling
-  Medication Adherence Logging
-  Symptom Tracking
-  Side Effect Reporting
-  Recovery Progress Monitoring
-  Healthcare Notifications
-  Interactive API Documentation with Swagger



## Tech Stack

- **Backend:** Django, Django REST Framework
- **Database:** PostgreSQL
- **Authentication:** JWT
- **API Documentation:** DRF Spectacular (Swagger/OpenAPI)
- **Version Control:** Git & GitHub



## Project Structure

```
pulsepath/
│── accounts/
│── visits/
│── clinical/
│── treatment/
│── notifications/
│── manage.py
```



##  Installation

Clone the repository:

```bash
git clone https://github.com/tugiii45/Pulse_Path.git
cd pulsepath
```

Create a virtual environment:

```bash
python -m venv myenv
```

Activate it:

**Windows**

```bash
myenv\Scripts\activate
```

**Linux/macOS**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Apply migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

Run the server:

```bash
python manage.py runserver
```



##  Authentication

PulsePath uses **JWT Authentication**.

Include the access token in every protected request:

```text
Authorization: Bearer <access_token>
```



##  API Workflow

```text
Register User
      ↓
Create Patient
      ↓
Book Appointment
      ↓
Create Visit
      ↓
Create Clinical Record
      ↓
Create Diagnosis
      ↓
Create Prescription
      ↓
Schedule Medication
      ↓
Log Medication Adherence
      ↓
Report Symptoms & Side Effects
      ↓
Track Recovery Progress
```



##  API Documentation

After starting the server:

- Swagger UI: `http://127.0.0.1:8000/api/docs/`




##  Future Enhancements

-  AI-powered health insights
-  M-Pesa integration
-  Mobile application
-  Analytics dashboard
-  SMS & Email reminders



##  Author

**Conrad**

Aspiring Software Engineer 



##  License

This project is licensed under the **MIT License**.