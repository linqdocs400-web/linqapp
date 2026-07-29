import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { ArrowLeft } from "lucide-react";
import { SEO } from "@/components/seo";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — linQ" },
      { name: "description", content: "Join the linQ team and help us build the future of mobility." },
    ],
  }),
  component: CareersPage,
});

function CareersPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-background text-foreground pb-20">
      <SEO
        title="Careers"
        description="Join the linQ team and help us build the future of mobility."
        canonical="https://linqrides.in/careers"
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-sm font-semibold tracking-tight">Careers</h1>
        </div>
      </header>

      {/* Embed Tally Form */}
      <div className="flex-1 w-full">
        <iframe
          src="https://tally.so/r/5BedVQ?transparentBackground=1"
          width="100%"
          height="100%"
          className="min-h-[calc(100dvh-56px-80px)] border-0"
          title="Careers at linQ"
        />
      </div>

      <BottomNav />
    </main>
  );
}
