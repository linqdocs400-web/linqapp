import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { CreditCard, Plus, ArrowLeft, Receipt, CheckCircle2 } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — linQ" },
      { name: "description", content: "Manage payment methods, plans and billing history." },
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
              Plans, methods and billing history.
            </p>
          </div>
          <Link
            to="/pricing"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-95"
          >
            Upgrade
          </Link>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          <section className="rounded-3xl border border-border bg-card p-6 lg:col-span-2">
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

          <section className="rounded-3xl border border-border bg-card p-6">
            <p className="text-sm font-semibold text-muted-foreground">PAYMENT METHODS</p>
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-secondary p-3">
              <CreditCard className="size-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-semibold">UPI / Card</p>
                <p className="text-xs text-muted-foreground">Add at checkout</p>
              </div>
            </div>
            <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary">
              <Plus className="size-4" /> Add method
            </button>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Receipt className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Billing history</h2>
          </div>
          <div className="divide-y divide-border">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{h.label}</p>
                  <p className="text-xs text-muted-foreground">{h.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{h.amount}</p>
                  <p className="text-xs text-muted-foreground">{h.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
