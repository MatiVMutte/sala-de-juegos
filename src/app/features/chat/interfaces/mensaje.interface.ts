export interface Mensaje {
  id?: string;
  user_id: string;
  message: string;
  created_at?: Date | string;
  username?: string;
  photo_url?: string;
}
