// API helpers for dashboard summary data.
import api from "./api";

export const getDashboardStats = 
async () => {
    // Keep dashboard data access in a service so components stay focused
    // on presentation and role-specific decisions.
    const response = await
api.get("dashboard/stats/");
    // The standard renderer wraps successful API data inside `data`.
    return response.data.data;    
}