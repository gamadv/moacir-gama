import axios from 'axios';
import useSWR from 'swr';

interface AwesomeApiResponse {
  USDBRL: {
    bid: string;
  };
}

const fetchRate = async (url: string): Promise<number> => {
  const res = await axios.get<AwesomeApiResponse>(url);
  return parseFloat(res.data.USDBRL.bid);
};

export function useExchangeRate() {
  const { data: rate, isLoading } = useSWR(
    'https://economia.awesomeapi.com.br/json/last/USD-BRL',
    fetchRate,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60_000,
    }
  );

  return { rate: rate ?? null, isLoading };
}
