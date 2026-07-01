import { supabase } from "../lib/supabase";

export async function getCurrentSession() {
  return supabase.auth.getSession();
}

export async function signUp(email, password) {
  return supabase.auth.signUp({
    email,
    password,
  });
}

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}