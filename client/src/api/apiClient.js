// client/src/api/apiClient.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true, // <<=== envia cookies httpOnly (Google OAuth)
});

// Interceptor para anexar o Bearer quando existir (login local)
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) config.headers['Authorization'] = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// ---------- Autenticação ----------
export const login = async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    // Para login local ainda guardamos o token (opcional, pois o cookie já é setado)
    if (data?.token) localStorage.setItem('authToken', data.token);
    return data.user;
};

export const register = async (full_name, email, password) => {
    const { data } = await apiClient.post('/auth/register', { full_name, email, password });
    // Opcional: não salva token aqui; o servidor já setou cookie httpOnly
    if (data?.token) localStorage.setItem('authToken', data.token);
    return data;
};

export const logout = async () => {
    try {
        await apiClient.post('/auth/logout'); // limpa cookie no servidor
    } catch { }
    localStorage.removeItem('authToken');   // e também limpa token local
};

// Perfil atual (usa cookie httpOnly OU Bearer, o que estiver presente)
export const getMe = async () => {
    try {
        const { data } = await apiClient.get('/auth/me');
        return data;
    } catch {
        // Se 401/403, zera o estado local
        localStorage.removeItem('authToken');
        return null;
    }
};

// ---------- Usuários ----------
export const listUsers = async () => {
    const { data } = await apiClient.get('/users');
    return data;
};
export const updateUser = async (id, payload) => {
    const { data } = await apiClient.put(`/users/${id}`, payload);
    return data;
};

// ---------- Eventos ----------
export const listEventos = async (filterParams = {}) => {
    const { data } = await apiClient.get('/eventos', { params: filterParams });
    return data;
};
export const createEvento = async (payload) => {
    const { data } = await apiClient.post('/eventos', payload);
    return data;
};
export const updateEvento = async (id, payload) => {
    const { data } = await apiClient.put(`/eventos/${id}`, payload);
    return data;
};
export const deleteEvento = async (id) => {
    await apiClient.delete(`/eventos/${id}`);
};

// ---------- Agendamentos ----------
export const listAgendamentos = async () => {
    const { data } = await apiClient.get('/agendamentos');
    return data;
};
export const createAgendamento = async (payload) => {
    const { data } = await apiClient.post('/agendamentos', payload);
    return data;
};
export const updateAgendamento = async (id, payload) => {
    const { data } = await apiClient.put(`/agendamentos/${id}`, payload);
    return data;
};
export const deleteAgendamento = async (id) => {
    await apiClient.delete(`/agendamentos/${id}`);
};
