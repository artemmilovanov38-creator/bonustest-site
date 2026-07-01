import { supabase } from "../lib/supabase";

export async function getTasks() {
  return supabase.from("tasks").select("*").order("id");
}

export async function getUsers() {
  return supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function getWithdraws() {
  return supabase
    .from("withdraw_requests")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function getSiteSettings() {
  return supabase.from("site_settings").select("*");
}

export async function checkAdmin(email) {
  return supabase
    .from("admins")
    .select("*")
    .eq("email", email)
    .maybeSingle();
}