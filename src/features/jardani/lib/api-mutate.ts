import axios from 'axios';

/** Helper para mutações: request com Axios, lança erro da API */
export async function apiMutate(
  url: string,
  options: { method: string; body?: unknown }
): Promise<void> {
  try {
    await axios({ url, method: options.method, data: options.body });
  } catch (err) {
    const message = (axios.isAxiosError(err) && err.response?.data?.error) || 'Erro na operação';
    throw new Error(message);
  }
}
