import api from "../../services/api";

export const useCalendar = () => {
  const getSummary = async ({ month, employeeId }) => {
    const res = await api.get("/calendar/summary", {
      params: { month, employeeId },
    });
    return res.data;
  };

  const getByDate = async ({ date, employeeId }) => {
    const res = await api.get(`/calendar/date/${date}`, {
      params: { employeeId },
    });
    return res.data;
  };

  return { getSummary, getByDate };
};
