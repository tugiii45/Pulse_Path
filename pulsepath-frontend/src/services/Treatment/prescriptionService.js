import api from "../api";

export const getPrescriptions = async () => {
  const response = await api.get("treatment/prescription/");
  return response.data;
};

export const createPrescription = async (prescriptionData) => {
  const response = await api.post(
    "treatment/prescription/",
    prescriptionData
  );

  return response.data;
};