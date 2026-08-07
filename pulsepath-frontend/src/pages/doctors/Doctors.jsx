import { useEffect, useState } from "react";
import { getDoctors } from "../../services/DoctorService";

function Doctors() {
  const [doctors, setDoctors] = useState([]);

  const loadDoctors = async () => {
  try {
    const response = await getDoctors();

    setDoctors(response.data.results);
  } catch (error) {
    console.error("Error fetching doctors:", error);
  }
};

useEffect(() => {
  loadDoctors();
}, []);

 return (
    <div>
      <h2>Doctors</h2>
    </div>
  );

}

export default Doctors;