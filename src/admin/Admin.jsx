import { useState } from "react";

import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";

import AdminUsers from "./AdminUsers";
import AdminTasks from "./AdminTasks";
import AdminReviews from "./AdminReviews";
import AdminWithdraws from "./AdminWithdraws";
import AdminSettings from "./AdminSettings";
import useAdmin from "../hooks/useAdmin";

export default function Admin({ onExit }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const admin = useAdmin();
  

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onExit={onExit}
    >
      {activeTab === "dashboard" && <AdminDashboard admin={admin} />}

      {activeTab === "users" && <AdminUsers admin={admin} />}

      {activeTab === "tasks" && <AdminTasks
    admin={admin}
/>}

      {activeTab === "reviews" && <AdminReviews admin={admin} />}

      {activeTab === "withdraws" && <AdminWithdraws admin={admin} />}

      {activeTab === "settings" && <AdminSettings />}
    </AdminLayout>
  );
}