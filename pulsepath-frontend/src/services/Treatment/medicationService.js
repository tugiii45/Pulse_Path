import api from "../api";

export const getMedications = async () => {
  const response = await api.get("treatment/medication/");
  return response.data;
};

export const createMedication = async (medicationData) => {
  const response = await api.post(
    "treatment/medication/",
    medicationData
  );

  return response.data;
};