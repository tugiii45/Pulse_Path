import api from "./api";

export const getHospitals = async () => {
  const response = await api.get("hospitals/");
  return response.data;
};

export const createHospital = async (hospitalData) => {
  const response = await api.post(
    "hospitals/",
    hospitalData
  );

  return response.data;
};

export const updateHospital = async (hospitalId, hospitalData) => {
  const response = await api.put(
    `hospitals/${hospitalId}/`,
    hospitalData
  );

  return response.data;
};

export const patchHospital = async (hospitalId, hospitalData) => {
  const response = await api.patch(
    `hospitals/${hospitalId}/`,
    hospitalData
  );

  return response.data;
};

export const deleteHospital = async (hospitalId) => {
  const response = await api.delete(
    `hospitals/${hospitalId}/`
  );

  return response.data;
};