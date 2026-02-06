import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary-50/30 to-transparent pointer-events-none" />
      <Header />
      <main className="relative">{children}</main>
    </div>
  );
}
