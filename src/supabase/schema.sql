
-- PROFILES TABLE
-- Stores user role information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- PROJECTS TABLE
-- Stores project information
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- PROJECT STEPS TABLE
-- Stores each step of a project
CREATE TABLE IF NOT EXISTS public.project_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  step_id INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  document_url TEXT,
  document_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  
  -- Each step ID should only appear once per project
  UNIQUE(project_id, step_id)
);

-- ROW LEVEL SECURITY POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_steps ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR PROFILES TABLE

-- Allow users to read their own profile
CREATE POLICY profiles_read_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow admin users to read all profiles
CREATE POLICY profiles_read_all_admin ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow users to update their own profile (except role)
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Allow admin users to update any profile
CREATE POLICY profiles_update_all_admin ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLICIES FOR PROJECTS TABLE

-- Allow all authenticated users to read projects
CREATE POLICY projects_read_all ON public.projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow only admin users to insert new projects
CREATE POLICY projects_insert_admin ON public.projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow only admin users to update projects
CREATE POLICY projects_update_admin ON public.projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow only admin users to delete projects
CREATE POLICY projects_delete_admin ON public.projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLICIES FOR PROJECT STEPS TABLE

-- Allow all authenticated users to read project steps
CREATE POLICY project_steps_read_all ON public.project_steps
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow only admin users to insert new project steps
CREATE POLICY project_steps_insert_admin ON public.project_steps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow only admin users to update project steps
CREATE POLICY project_steps_update_admin ON public.project_steps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow only admin users to delete project steps
CREATE POLICY project_steps_delete_admin ON public.project_steps
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- STORAGE BUCKET POLICIES

-- Create a storage bucket for project documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for documents bucket
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Allow owners to update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    auth.uid() = owner
  );

CREATE POLICY "Allow admin to update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- TRIGGERS

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to tables
CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_projects_modtime
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_project_steps_modtime
  BEFORE UPDATE ON public.project_steps
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Create a function to create user profiles after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'employee');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create a profile when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create seed data for admin user (if you want)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin@example.com', '$2a$10$dLg5Kfe...encrypted_password_hash...', NOW());
--
-- INSERT INTO public.profiles (id, email, role)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'admin');
