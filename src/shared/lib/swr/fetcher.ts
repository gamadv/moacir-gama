import axios from 'axios';

/**
 * Fetcher padrão para SWR usando Axios.
 * Faz GET na URL e retorna o campo `data` do envelope da API.
 * Retorna null em 401 (não autenticado).
 */
export async function fetcher<T>(url: string): Promise<T> {
  try {
    const res = await axios.get(url);
    return res.data.data as T;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return null as T;
    }
    const message =
      (axios.isAxiosError(err) && err.response?.data?.error) || 'Erro ao carregar dados';
    throw new Error(message);
  }
}
