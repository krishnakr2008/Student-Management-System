// Supabase Edge Function: create-student
// Provision student auth user & profile using Supabase Admin Auth API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { email, password, fullName, department, branch, semester, section, rollNumber } = await req.json();

    if (!email || !rollNumber) {
      return new Response(
        JSON.stringify({ error: "Email and Roll Number are required." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Create Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password || 'Student@12345',
      email_confirm: true,
      user_metadata: { full_name: fullName, role: 'student' },
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = authUser.user.id;

    // 2. Create Profile Record
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      email,
      role: 'student',
    });

    if (profileError) {
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Create Student Record
    const { data: studentData, error: studentError } = await supabaseAdmin.from('students').insert({
      profile_id: userId,
      student_id_code: `STD-${Date.now().toString().slice(-4)}`,
      department: department || 'Computer Science',
      branch: branch || 'CSE',
      semester: semester || 1,
      section: section || 'A',
      roll_number: rollNumber,
      admission_year: new Date().getFullYear(),
      active: true,
    }).select().single();

    if (studentError) {
      return new Response(
        JSON.stringify({ error: studentError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, student: studentData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
