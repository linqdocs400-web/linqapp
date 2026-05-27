import { z } from "zod";

const EnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(20),
  VITE_RAZORPAY_KEY_ID: z.string().min(10),
});

type Env = z.infer<typeof EnvSchema>;

function readEnv(): Env {
  const candidate = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID,
  };

  const parsed = EnvSchema.safeParse(candidate);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Missing/invalid environment variables:\n${message}`);
  }

  return parsed.data;
}

export const env = readEnv();

