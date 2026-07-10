import { useEffect, useState } from "react";
import { getUsers, getWithdraws } from "../services/api";
import { getTaskReviews } from "../services/api";
import { getAdminTasks } from "../services/api";

export default function useAdmin() {
  const [users, setUsers] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);
const [reviews, setReviews] = useState([]);
const [tasks, setTasks] = useState([]);

  async function load() {
    setLoading(true);

    const { data: usersData } = await getUsers();
    const { data: withdrawData } = await getWithdraws();
const { data: reviewData } =
  await getTaskReviews();
  const { data: taskData } =
await getAdminTasks();

setTasks(taskData || []);

setReviews(reviewData || []);

    setUsers(usersData || []);
    setWithdraws(withdrawData || []);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return {
    users,
    reviews,
    tasks,
    withdraws,
    loading,
    reload: load,
  };
}