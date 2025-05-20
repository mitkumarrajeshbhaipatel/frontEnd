import API from './api';

export const createReport = async (reportData: any) => {
    const response = await API.post('/admin/reports', reportData);
    return response.data;
  };
  
  export const getAllReports = async () => {
    const response = await API.get('/admin/reports');
    return response.data;
  };
  
  export const updateReport = async (reportId: string, updateData: any) => {
    const response = await API.put(`/admin/reports/${reportId}`, updateData);
    return response.data;
  };
  