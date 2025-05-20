import API from './api';

/*
export const uploadAvatar = async (file: { uri: string; name: string; type: string }) => {
    const formData = new FormData();
  
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any); // `as any` is fine in React Native for FormData
  
    const response = await API.post('/media/upload-avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  
    return response.data;
  };
  */

export const uploadAvatar = async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await API.post('/media/upload-avatar/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  };
  
  
  export const uploadDocument = async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await API.post('/media/upload-document/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  };
  
  export const uploadChatMedia = async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await API.post('/media/upload-chat-media/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  };