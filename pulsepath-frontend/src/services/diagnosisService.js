import api from "./api";

// Normalize the API response so components always receive an array.
const normalizeListResponse = (response) => {
  const payload = response?.data?.data ?? response?.data;

  // If the API directly returns an array.
  if (Array.isArray(payload)) {
    return payload;
  }

  // If the API returns a paginated response.
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


// Get all diagnoses.
export const getDiagnoses = async () => {
  const response = await api.get("clinical/diagnosis/");

  return normalizeListResponse(response);
};


// Create a new diagnosis.
export const createDiagnosis = async (diagnosisData) => {
  const response = await api.post(
    "clinical/diagnosis/",
    diagnosisData
  );

  return response?.data?.data ?? response?.data;
};