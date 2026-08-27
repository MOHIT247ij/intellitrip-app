import api from './api';

export const aiService = {
  chat: (message, history) => api.post('/ai/chat', { message, history }).then((r) => r.data.data),
};
