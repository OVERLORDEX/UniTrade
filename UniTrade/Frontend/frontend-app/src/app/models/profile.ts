import { User } from './user';

export interface Profile {
  id: number;
  user: User;
  phone: string;
  dormitory: string;
  room: string;
  avatar_url: string;
  telegram: string;
  whatsapp: string;
  contact_email: string;
  first_name: string;
  last_name: string;
  birth_year: number | null;
  avatar?: string;
}