import { supabase } from "../lib/supabase";

export async function getTasks() {
  return supabase.from("tasks").select("*").order("id");
}

export async function createTaskApi(task) {
  return supabase.from("tasks").insert(task);
}

export async function updateTaskApi(id, task) {
  return supabase.from("tasks").update(task).eq("id", id);
}

export async function deleteTaskApi(id) {
  return supabase.from("tasks").delete().eq("id", id);
}

export async function getUsers() {
  return supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function updateUserBalance(userId, balance) {
  return supabase.from("users").update({ balance }).eq("id", userId);
}

export async function toggleUserBlock(userId, blocked) {
  return supabase.from("users").update({ is_blocked: blocked }).eq("id", userId);
}

export async function getWithdraws() {
  return supabase
    .from("withdraw_requests")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function updateWithdrawStatusApi(id, status) {
  return supabase
    .from("withdraw_requests")
    .update({ status })
    .eq("id", id);
}

export async function getSiteSettings() {
  return supabase.from("site_settings").select("*");
}

export async function updateSiteSettingApi(key, value) {
  return supabase
    .from("site_settings")
    .update({ value })
    .eq("key", key);
}

export async function checkAdmin(email) {
  return supabase.from("admins").select("*").eq("email", email).maybeSingle();
}

export async function getTaskReviews() {
  const { data, error } = await supabase
    .from("user_tasks")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return { data: [], error };

  const reviews = await Promise.all(
    data.map(async (item) => {
      const { data: task } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", item.task_id)
        .single();

      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", item.user_id)
        .single();

      return { ...item, task, dbUser: user };
    })
  );

  return { data: reviews, error: null };
}

export async function updateTaskReview(id, status) {
  return supabase
    .from("user_tasks")
    .update({ status, rewarded: status === "approved" })
    .eq("id", id);
}