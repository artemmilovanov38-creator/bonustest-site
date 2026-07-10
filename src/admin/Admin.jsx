import { useEffect, useState } from "react";

import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminTasks from "./AdminTasks";
import AdminReviews from "./AdminReviews";
import AdminWithdraws from "./AdminWithdraws";
import AdminSettings from "./AdminSettings";
import AdminSupport from "./AdminSupport";
import AdminTeamChat from "./AdminTeamChat";

import useAdmin from "../hooks/useAdmin";

const creatorTabs = [
  "dashboard",
  "users",
  "reviews",
  "withdraws",
  "tasks",
  "settings",
  "support",
  "team-chat",
];

const adminTabs = [
  "dashboard",
  "reviews",
  "withdraws",
  "support",
  "team-chat",
];

export default function Admin({ onExit, role = "admin" }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const admin = useAdmin();

  const allowedTabs =
    role === "creator" ? creatorTabs : adminTabs;

  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab("dashboard");
    }
  }, [activeTab, role]);

  return (
    <AdminLayout
      role={role}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onExit={onExit}
    >
      {activeTab === "dashboard" && (
        <AdminDashboard admin={admin} />
      )}

      {role === "creator" && activeTab === "users" && (
        <AdminUsers admin={admin} />
      )}

      {activeTab === "reviews" && (
        <AdminReviews admin={admin} />
      )}

      {activeTab === "withdraws" && (
        <AdminWithdraws admin={admin} />
      )}

      {role === "creator" && activeTab === "tasks" && (
        <AdminTasks admin={admin} />
      )}

      {role === "creator" && activeTab === "settings" && (
        <AdminSettings />
      )}

      {activeTab === "support" && <AdminSupport />}

      {activeTab === "team-chat" && <AdminTeamChat />}
    </AdminLayout>
  );
}