import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import AdminLogin from "./AdminLogin";
import AdminLayout, { type AdminSection } from "@/components/admin/AdminLayout";
import AdminDashboardOverview from "@/components/admin/AdminDashboardOverview";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminAccess from "@/components/admin/AdminAccess";
import AdminPlans from "@/components/admin/AdminPlans";
import AdminTerms from "@/components/admin/AdminTerms";

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.rpc("has_role", {
          _user_id: session.user.id,
          _role: "admin",
        });
        if (data) setAuthenticated(true);
      }
      setChecking(false);
    };
    checkAdmin();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={handleLogout}
    >
      {activeSection === "dashboard" && <AdminDashboardOverview />}
      {activeSection === "usuarios" && <AdminUsers />}
      {activeSection === "acessos" && <AdminAccess />}
      {activeSection === "planos" && <AdminPlans />}
      {activeSection === "termos" && <AdminTerms />}
    </AdminLayout>
  );
}
