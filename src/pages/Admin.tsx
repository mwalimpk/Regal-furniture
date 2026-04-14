import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import OverviewSection from "@/components/admin/OverviewSection";
import UsersSection from "@/components/admin/UsersSection";
import PropertiesSection from "@/components/admin/PropertiesSection";
import AddPropertySection from "@/components/admin/AddPropertySection";
import ApprovalsSection from "@/components/admin/ApprovalsSection";
import LeadsSection from "@/components/admin/LeadsSection";
import BookingsSection from "@/components/admin/BookingsSection";
import SubscriptionsSection from "@/components/admin/SubscriptionsSection";
import AnalyticsSection from "@/components/admin/AnalyticsSection";
import MessagesSection from "@/components/admin/MessagesSection";
import SettingsSection from "@/components/admin/SettingsSection";

const Admin = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const renderSection = () => {
    switch (activeSection) {
      case "overview": return <OverviewSection />;
      case "users": return <UsersSection />;
      case "properties": return <PropertiesSection />;
      case "add-property": return <AddPropertySection />;
      case "approvals": return <ApprovalsSection />;
      case "leads": return <LeadsSection />;
      case "bookings": return <BookingsSection />;
      case "subscriptions": return <SubscriptionsSection />;
      case "analytics": return <AnalyticsSection />;
      case "messages": return <MessagesSection />;
      case "settings": return <SettingsSection />;
      default: return <OverviewSection />;
    }
  };

  return (
    <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderSection()}
    </AdminLayout>
  );
};

export default Admin;
