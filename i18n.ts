import { getRequestConfig } from 'next-intl/server';
import messages from './messages/kz.json';

export default getRequestConfig(async () => ({
  locale: 'kk',
  messages,
  timeZone: 'Asia/Almaty',
}));
