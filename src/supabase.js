import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oaitesxsyghwpfdvizgb.supabase.co'; // your URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXRlc3hzeWdod3BmZHZpemdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMTcwNDcsImV4cCI6MjA4MjY5MzA0N30.lkjsBV2ZEY6NjbW6VJzflcKBpbD19iNAp-vh4YOFpG0'; // from Supabase → Settings → API

export const supabase = createClient(supabaseUrl, supabaseAnonKey);