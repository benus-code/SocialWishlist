import {api} from './client';

export type ScrapeResult = {
  title: string | null;
  image: string | null;
  price: number | null;
};

export const scrapeApi = {
  scrapeUrl(url: string) {
    return api.post<ScrapeResult>('/api/scrape', {url});
  },
};
