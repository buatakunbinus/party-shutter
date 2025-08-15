-- Create submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) <= 30),
  comment TEXT CHECK (char_length(comment) <= 100),
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (no authentication required)
CREATE POLICY "Anyone can view submissions" 
ON public.submissions 
FOR SELECT 
USING (true);

-- Create policy for public insert access (no authentication required)
CREATE POLICY "Anyone can create submissions" 
ON public.submissions 
FOR INSERT 
WITH CHECK (true);

-- Create storage bucket for party photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('party-photos', 'party-photos', true);

-- Create storage policies for public access
CREATE POLICY "Anyone can view party photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'party-photos');

CREATE POLICY "Anyone can upload party photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'party-photos');

-- Enable realtime for submissions table
ALTER TABLE public.submissions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;