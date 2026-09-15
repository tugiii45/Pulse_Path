const humanizeFieldName = (field) => {
  const labels = {
    first_name: "First name",
    last_name: "Last name",
    email: "Email",
    phone_number: "Phone number",
    password: "Password",
    confirm_password: "Confirm password",
    date_of_birth: "Date of birth",
    gender: "Gender",
    blood_group: "Blood group",
    emergency_contact: "Emergency contact",
    address: "Address",
    doctor: "Doctor",
    patient: "Patient",
    hospital: "Hospital",
    appointment_date: "Appointment date",
    status: "Status",
    department: "Department",
    specialization: "Specialization",
    license_number: "License number",
    years_of_experience: "Years of experience",
    profile_picture: "Profile picture",
    non_field_errors: "Request",
  };

  return labels[field] || field.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const makeMessageFriendly = (message) => {
  const normalized = message.trim();

  if (/^this field is required\.?$/i.test(normalized)) {
    return "This information is required.";
  }

  if (/^this field may not be blank\.?$/i.test(normalized)) {
    return "This information cannot be blank.";
  }

  if (/^enter a valid email address\.?$/i.test(normalized)) {
    return "Please enter a valid email address.";
  }

  if (/^a valid number is required\.?$/i.test(normalized)) {
    return "Please enter a valid number.";
  }

  if (/^invalid pk .* object does not exist\.?$/i.test(normalized)) {
    return "The selected item could not be found. Please choose another option.";
  }

  if (/network error/i.test(normalized)) {
    return "We could not reach the server. Please check your connection and try again.";
  }

  if (/permission denied|not permitted|not authorized|you do not have permission/i.test(normalized)) {
    return "You do not have permission to do this. Please contact an administrator if you need access.";
  }

  if (/unauthorized|authentication credentials were not provided|token/i.test(normalized)) {
    return "Your session has expired. Please sign in again and try again.";
  }

  if (/appointments can only be booked between 8:00 AM and 5:00 PM/i.test(normalized)) {
    return "Appointments are available from 8:00 AM to 5:00 PM. Please choose a time within those hours.";
  }

  if (/appointment date cannot be in the past/i.test(normalized)) {
    return "This appointment time has already passed. Please choose a future date and time.";
  }

  if (/already has an appointment at this time/i.test(normalized)) {
    return `${normalized.replace(/\.$/, "")}. Please choose a different time.`;
  }

  if (/selected doctor does not belong to the selected hospital/i.test(normalized)) {
    return "The selected doctor does not work at this hospital. Please choose a doctor from the selected hospital.";
  }

  if (/doctor is not assigned to a department/i.test(normalized)) {
    return "This doctor is not assigned to a department yet, so an appointment cannot be booked with them.";
  }

  if (/status from (\w+) to (\w+)/i.test(normalized)) {
    const match = normalized.match(/status from (\w+) to (\w+)/i);
    return `This appointment cannot move from ${match[1].toLowerCase()} to ${match[2].toLowerCase()}. Please choose an allowed status change.`;
  }

  if (/not currently available for appointments/i.test(normalized)) {
    return "This hospital is currently unavailable for appointments. Please choose another hospital.";
  }

  return normalized;
};

const flattenErrorMessages = (value, fieldName) => {
  if (typeof value === "string") {
    const message = makeMessageFriendly(value);
    return [fieldName && !/^request$/i.test(fieldName) ? `${fieldName}: ${message}` : message];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenErrorMessages(item, fieldName));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, nested]) => {
      const nextField = fieldName || humanizeFieldName(key);
      return flattenErrorMessages(nested, nextField);
    });
  }

  return [fieldName ? `${fieldName} is not valid.` : "Please check your information and try again."];
};

export const getFriendlyErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (!error) return fallback;

  if (typeof error === "string") {
    return makeMessageFriendly(error);
  }

  const data = error.response?.data ?? error.data ?? error;

  if (typeof data === "string") {
    return makeMessageFriendly(data);
  }

  if (data?.detail) {
    return typeof data.detail === "string"
      ? makeMessageFriendly(data.detail)
      : flattenErrorMessages(data.detail).join(" ");
  }

  if (data?.message) {
    return typeof data.message === "string"
      ? makeMessageFriendly(data.message)
      : flattenErrorMessages(data.message).join(" ");
  }

  if (data?.error) {
    return typeof data.error === "string"
      ? makeMessageFriendly(data.error)
      : flattenErrorMessages(data.error).join(" ");
  }

  const flattened = Object.entries(data || {}).flatMap(([field, value]) => {
    const fieldLabel = humanizeFieldName(field);
    return flattenErrorMessages(value, fieldLabel);
  });

  if (flattened.length > 0) {
    const uniqueMessages = [...new Set(flattened.filter(Boolean))];
    return uniqueMessages.slice(0, 3).join(" ");
  }

  return fallback;
};

export const getFriendlySuccessMessage = (message, fallback = "Success.") =>
  message || fallback;
