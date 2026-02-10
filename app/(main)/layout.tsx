import Container from "@/components/layout/Container";
import AuthGate from "@/components/layout/AuthGate";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <div className="min-h-screen bg-white pb-20 pt-6">
        <Container>{children}</Container>
      </div>
    </AuthGate>
  );
}
