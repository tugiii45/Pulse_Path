import api from "./api";

export const getDiagnoses = async () => {
  const response = await api.get("clinical/diagnosis/");
  return response.data;
};

export const createDiagnosis = async (diagnosisData) => {
  const response = await api.post("clinical/diagnosis/", diagnosisData);
  return response.data;
};

