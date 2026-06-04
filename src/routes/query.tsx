import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { ArrowLeft, LifeBuoy, MessageSquare, Mail, Send } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/query")({
  head: () => ({
    meta: [
      { title: "Support — linQ" },
      { name: "description", content: "Submit queries, raise issues, and get help." },
    ],
  }),
  component: QueryPage,
});

function QueryPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const faqs = [
    {
      q: "How do I send a connection request?",
      a: "You get 2 free requests per day. After that, choose a weekly or monthly plan.",
    },
    {
      q: "How do refunds work?",
      a: "Refunds are processed within 5–7 business days to the original payment method.",
    },
    {
      q: "How do I delete my account?",
      a: "Go to Profile → delete account → permanently delete data.",
    },
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

        <header className="mb-6 flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LifeBuoy className="size-6" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Support</h1>
            <p className="mt-1 text-sm text-muted-foreground">We usually reply within 24 hours.</p>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-5">
          <section className="rounded-3xl border border-border bg-card p-6 lg:col-span-3">
            <h2 className="text-lg font-semibold">Submit a query</h2>
            {sent ? (
              <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-sm">
                Thanks! Your query has been received. We'll get back to you on your registered
                email.
              </div>
            ) : (
              <form
                className="mt-4 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                  setSubject("");
                  setMessage("");
                }}
              >
                <input
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
                <textarea
                  className="min-h-32 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe your issue…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                <button className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-95">
                  <Send className="size-4" /> Send query
                </button>
              </form>
            )}
          </section>

          <section className="space-y-4 lg:col-span-2">
            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-muted-foreground">CONTACT</h3>
              <a
                href="mailto:hello@linq.app"
                className="mt-3 flex items-center gap-3 rounded-xl bg-secondary p-3 hover:bg-secondary/80"
              >
                <Mail className="size-5 text-primary" />
                <span className="text-sm font-medium">gotogetherrides@gmail.coms</span>
              </a>
              <a
                href="#"
                className="mt-2 flex items-center gap-3 rounded-xl bg-secondary p-3 hover:bg-secondary/80"
              >
                <MessageSquare className="size-5 text-primary" />
                <span className="text-sm font-medium">Live chat - On Insta @gotogetherrides</span>
              </a>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-muted-foreground">FAQ</h3>
              <div className="mt-3 space-y-3">
                {faqs.map((f) => (
                  <details key={f.q} className="group rounded-xl bg-secondary p-3">
                    <summary className="cursor-pointer text-sm font-medium">{f.q}</summary>
                    <p className="mt-2 text-xs text-muted-foreground">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
