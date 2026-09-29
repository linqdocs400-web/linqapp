import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { CreditCard, Plus, ArrowLeft, Receipt, CheckCircle2 } from "lucide-react";
import { SEO } from "@/components/seo";
import { useProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — linQ" },
      { name: "description", content: "Manage your subscription plans." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { profile } = useProfile();
  const plan = profile?.plan || "free";
  const planExpiry = profile?.plan_expiry;

  const history = [
    { id: "t1", label: "Weekly plan", amount: "₹19", date: "Apr 28, 2026", status: "Paid" },
    { id: "t2", label: "Connection request", amount: "Free", date: "Apr 22, 2026", status: "Free" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SEO
        title="Payment History"
        description="Manage your subscription plans."
        canonical="https://linqrides.in/payments"
        noindex={true}
      />
      <div className="mx-auto max-w-5xl px-5 pt-6 pb-32 lg:px-8 lg:pt-10">
        <Link
          to="/profile"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to profile
        </Link>

        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Payments</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your plans.
            </p>
          </div>
          <Link
            to="/pricing"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-95"
          >
            Upgrade
          </Link>
        </header>

        <div className="grid gap-5 grid-cols-1">
          <section className="rounded-3xl border border-border bg-card p-6">
            <p className="text-sm font-semibold text-muted-foreground">CURRENT PLAN</p>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold capitalize">{plan}</p>
                {planExpiry && plan !== "free" ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Renews on {new Date(planExpiry).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">2 free unlocks remaining</p>
                )}
              </div>
              <CheckCircle2 className="size-8 text-primary" />
            </div>
          </section>

          
        </div>

        
      </div>
      <BottomNav />
    </main>
  );
}
