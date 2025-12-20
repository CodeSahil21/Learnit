import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export const uploadFile = async (file: Express.Multer.File): Promise<string> => {
  const fileName = `${Date.now()}-${file.originalname}`;
  
  const { data, error } = await supabase.storage
    .from('chapters')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw new AppError('Upload failed', 400);

  const { data: { publicUrl } } = supabase.storage
    .from('chapters')
    .getPublicUrl(fileName);

  return publicUrl;
};