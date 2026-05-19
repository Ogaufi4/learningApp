import type { Metadata } from "next";
import { AdminLayoutClient } from "@/components/layouts/admin-layout-client";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const AdminLayout = ({ children }: Props) => {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
};

export default AdminLayout;
