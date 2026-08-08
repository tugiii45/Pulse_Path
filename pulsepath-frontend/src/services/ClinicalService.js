import api from "./api";

// ================================
// Clinical Records
// ================================

export const getClinicalRecords = async () => {
  const response = await api.get("clinical/");
  return response.data;
};

export const getClinicalRecord = async (id) => {
  const response = await api.get(`clinical/${id}/`);
  return response.data;
};

export const createClinicalRecord = async (data) => {
  const response = await api.post("clinical/", data);
  return response.data;
};

export const updateClinicalRecord = async (id, data) => {
  const response = await api.patch(`clinical/${id}/`, data);
  return response.data;
};

export const deleteClinicalRecord = async (id) => {
  const response = await api.delete(`clinical/${id}/`);
  return response.data;
};


// ================================
// Diagnoses
// ================================

export const getDiagnoses = async () => {
  const response = await api.get("clinical/diagnosis/");
  return response.data;
};

export const getDiagnosis = async (id) => {
  const response = await api.get(`clinical/diagnosis/${id}/`);
  return response.data;
};

export const createDiagnosis = async (data) => {
  const response = await api.post("clinical/diagnosis/", data);
  return response.data;
};

export const updateDiagnosis = async (id, data) => {
  const response = await api.patch(`clinical/diagnosis/${id}/`, data);
  return response.data;
};

export const deleteDiagnosis = async (id) => {
  const response = await api.delete(`clinical/diagnosis/${id}/`);
  return response.data;
};