# PulsePath

PulsePath is a healthcare management platform built for the continuous care journey between patients, doctors, and hospital staff. It combines a Django REST API with a React frontend to support appointment management, clinical documentation, prescription workflows, treatment follow-up, and automated patient reminders.

The system is designed around continuity of care: each patient interaction is tracked across appointments, visits, diagnoses, medications, recovery updates, and notifications so clinicians can act on a complete view of treatment progress.



## Why PulsePath

PulsePath helps digitize the core operational flow of a healthcare service without losing the human aspect of care. Instead of treating each step as an isolated record, the platform connects them into one treatment lifecycle.

This creates a better experience for:

- Patients, who can track treatment adherence and receive reminders
- Doctors, who can review patient history and treatment progress
- Hospital staff, who can manage departments, doctors, and appointment workflows
- Administrators, who can provision staff and manage hospital-level operations



## Core Features

### Patient and user lifecycle
- JWT-based authentication and secure access
- user registration and profile management
- password reset and account setup flows
- patient profile updates and patient list access
- doctor and admin provisioning by authorized users

### Hospital and staff operations
- hospital registration and management
- department setup and organization
- doctor listing and hospital-scoped assignment
- staff-specific access and role-aware permissions

### Appointment and visit management
- appointment booking and update workflows
- appointment status changes such as confirmed or cancelled
- patient/doctor-specific views of appointments
- visit tracking linked to appointments

### Clinical care workflow
- clinical record creation and review
- diagnosis records tied to visit and patient context
- prescription creation and management
- treatment tracking over time

### Medication and recovery tracking
- medication schedule creation with timing and date windows
- medication logs for adherence tracking
- side effect reporting by patients
- recovery progress updates and doctor review
- follow-up scheduling for treatment continuity

### Notifications and reminders
- automated medication reminders
- appointment reminders
- follow-up reminders
- missed-dose alerts
- notification read state, filtering, and deletion
- deduplicated alert creation using a unique notification key

### Dashboard and assistant support
- dashboard statistics endpoint
- chatbot integration
- Swagger/OpenAPI documentation for API exploration



## Tech Stack

### Backend
- Python
- Django
- Django REST Framework
- Django Filters
- Simple JWT
- DRF Spectacular

### Frontend
- React
- Vite
- Bootstrap
- React Router
- Axios

### Infrastructure
- SQLite for local development
- PostgreSQL-compatible configuration via environment settings
- CORS enabled for frontend-backend communication
- WhiteNoise for static file serving



## Project Structure

```text
Pulse_Path/
├── accounts/                 # auth, profiles, hospitals, doctors, patients
├── clinical/                 # clinical records and diagnoses
├── config/                   # project settings, URL routing, custom renderers
├── dashboard/                # dashboard summary APIs
├── notifications/            # notification models, services, reminder automation
├── treatment/                # prescriptions, medications, logs, side effects, recovery
├── visits/                   # appointments and visits
├── chatbot/                  # chat endpoint integration
├── pulsepath-frontend/       # React application
├── manage.py
├── requirements.txt
├── package.json
├── run_notifications.bat     # Windows task wrapper for reminder automation
├── Readme.md
├── TODO.md
└── .env-based configuration
```



## Quick Start

### 1) Clone the repository

```bash
git clone https://github.com/tugiii45/Pulse_Path/
cd Pulse_Path
```

### 2) Create a virtual environment

Windows:

```bash
python -m venv myenv
myenv\Scripts\activate
```

macOS/Linux:

```bash
python -m venv .venv
source .venv/bin/activate
```

### 3) Install dependencies

Backend:

```bash
pip install -r requirements.txt
```

Frontend:

```bash
cd pulsepath-frontend
npm install
```

### 4) Configure environment variables

The app expects core environment settings such as:

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `GROQ_API_KEY`
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `DEFAULT_FROM_EMAIL`
- `FRONTEND_BASE_URL`

If you use a `.env` file, make sure it is loaded correctly before starting Django.

### 5) Apply migrations

```bash
python manage.py migrate
```

### 6) Run the backend

```bash
python manage.py runserver
```

### 7) Run the frontend

```bash
cd pulsepath-frontend
npm run dev
```


## API Overview

The backend exposes the main app routes under `/api/`.

### Main endpoints
- `/api/login/`
- `/api/token/refresh/`
- `/api/register/`
- `/api/profile/`
- `/api/patients/`
- `/api/doctors/`
- `/api/hospitals/`
- `/api/departments/`
- `/api/visits/appointments/`
- `/api/visits/visits/`
- `/api/treatment/`
- `/api/notifications/`
- `/api/clinical/`
- `/api/dashboard/stats/`

### API documentation

After starting the backend:

- Swagger UI: `http://127.0.0.1:8000/api/docs/`
- Redoc: `http://127.0.0.1:8000/api/redoc/`
- Schema: `http://127.0.0.1:8000/api/schema/`



## Notification Automation

The reminder system is driven by a custom Django management command, executed through the Windows batch wrapper in `run_notifications.bat`.

The command in `notifications/management/commands/process_notifications.py` checks for:

- medication reminders
- appointment reminders due within the next 24 hours
- follow-up reminders
- missed-dose alerts

All new reminders are created via the centralized helper in `notifications/services.py`, which prevents duplicate notifications with a unique `notification_key`.

This is intended to be scheduled with Windows Task Scheduler, which makes the system automatically generate patient reminders without requiring manual intervention.



## Typical User Journey

```text
Register account
  ↓
Create or join hospital workflow
  ↓
Book appointment
  ↓
Create visit and clinical notes
  ↓
Add diagnosis and prescription
  ↓
Schedule medication and treatment follow-up
  ↓
Log adherence, side effects, and recovery progress
  ↓
Receive automated reminder notifications
```



## Project Status

PulsePath is a working healthcare management project with a complete backend API, frontend interface, and automated notification flow. It is modular and suitable for continued development, including enhancements such as analytics, more advanced patient dashboards, SMS/email integrations, and broader clinical reporting.



## License

This project is currently licensed under the MIT License unless otherwise specified in the repository.