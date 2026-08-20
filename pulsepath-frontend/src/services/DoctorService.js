import api from "./api";

/**
 * Fetches doctors from the backend.
 *
 * Returns the complete API payload so that
 * pagination information such as results,
 * count, next, and previous is preserved.
 *
 * @param {string} url - API endpoint to fetch doctors from.
 */
export const getDoctors = async (url = "doctors/") => {
  const response = await api.get(url);

  return response.data?.data ?? response.data;
};

/**
 * Fetches doctors belonging to a specific hospital.
 *
 * @param {number|string} hospitalId - Hospital primary key.
 */
export const getDoctorsByHospital = async (hospitalId) => {
  if (!hospitalId) {
    return [];
  }

  const response = await api.get(
    `doctors/by-hospital/?hospital=${hospitalId}`,
  );

  const payload = response.data?.data ?? response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.results)) {
      return payload.results;
    }

    if (Array.isArray(payload.data)) {
      return payload.data;
    }
  }

  return [];
};

/**
 * Creates a new doctor account (ADMIN only).
 *
 * Unlike the old self-service /doctors/ POST (now read-only), this
 * creates both the underlying user account and the Doctor profile,
 * then emails the doctor an invite link to set their password and
 * activate their account. See accounts/views/doctor_provisioning.py.
 *
 * @param {Object} data - { email, first_name, last_name, phone_number,
 *   department, specialization, license_number, years_of_experience }
 */
export const createDoctorByAdmin = async (data) => {
  const response = await api.post("doctors/create/", data);

  return response.data?.data ?? response.data;
};