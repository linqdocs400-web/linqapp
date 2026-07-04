import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { ArrowLeft, LifeBuoy, MessageSquare, Mail } from "lucide-react";

export const Route = createFileRoute("/query")({
  head: () => ({
    meta: [
      { title: "Support — linQ" },
      {
        name: "description",
        content: "Submit queries, raise issues, and get help.",
      },
    ],
  }),
  component: QueryPage,
});

function QueryPage() {
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
      a: "Go to Profile → Delete Account → Permanently Delete Data.",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-5 pt-6 pb-32 lg:px-8 lg:pt-10">
        <Link
          to="/profile"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to Profile
        </Link>

        <header className="mb-6 flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LifeBuoy className="size-6" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Support
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              We're here to help.
            </p>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-5">
          <section className="rounded-3xl border border-border bg-card p-6 lg:col-span-3">
            <h2 className="text-lg font-semibold">Submit a Query</h2>

            <div className="mt-5 overflow-hidden rounded-2xl border border-border">
              <iframe
                src="https://tally.so/r/7R5bvZ"
                title="Support Form"
                className="h-[700px] w-full"
                frameBorder="0"
              />
            </div>
          </section>

          <section className="space-y-4 lg:col-span-2">
            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-muted-foreground">
                CONTACT
              </h3>

              <a
                href="mailto:gotogetherrides@gmail.com"
                className="mt-3 flex items-center gap-3 rounded-xl bg-secondary p-3 hover:bg-secondary/80"
              >
                <Mail className="size-5 text-primary" />
                <span className="text-sm font-medium">
                  gotogetherrides@gmail.com
                </span>
              </a>

              <a
                href="https://instagram.com/gotogetherrides"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-3 rounded-xl bg-secondary p-3 hover:bg-secondary/80"
              >
                <MessageSquare className="size-5 text-primary" />
                <span className="text-sm font-medium">
                  Live Chat - @gotogetherrides
                </span>
              </a>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-muted-foreground">
                FAQ
              </h3>

              <div className="mt-3 space-y-3">
                {faqs.map((f) => (
                  <details key={f.q} className="rounded-xl bg-secondary p-3">
                    <summary className="cursor-pointer text-sm font-medium">
                      {f.q}
                    </summary>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {f.a}
                    </p>
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
