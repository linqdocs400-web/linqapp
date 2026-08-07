import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  city: z.string().min(2, "City is required"),
  profession: z.string().min(2, "Profession is required"),
  organization: z.string().min(2, "Organization is required"),
  linkedin_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  photo_url: z.string().url().optional().or(z.literal("")),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  // Team & Travel details
  team_name: z.string().min(2, "Team name is required"),
  team_size: z.coerce.number().min(1, "Must be at least 1").default(1),
  is_local: z.boolean().default(false),
  willing_to_pool_cab: z.boolean().default(false),
  
  // Local fields
  local_location: z.string().optional(),
  travel_time: z.string().optional(),

  // Non-local fields
  origin_city: z.string().optional(),
  travel_medium: z.string().optional(),
  pickup_station: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PROFESSIONS = [
  "Student", "Founder", "Developer", "Investor", "Product Manager", 
  "Designer", "Researcher", "Recruiter", "Entrepreneur", "Other"
];

const INTERESTS = [
  "Networking", "Co-founder", "Hiring", "Looking for Job", "AI", 
  "ML", "Robotics", "Startup", "Investment", "Mentorship", 
  "Collaboration", "Product", "Research"
];

export function LaunchpadRegistrationForm({ eventId, onSuccess }: { eventId: string, onSuccess: () => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user?.user_metadata?.name || "",
      city: "",
      profession: "",
      organization: "",
      linkedin_url: "",
      photo_url: user?.user_metadata?.avatar_url || "",
      interests: [],
      team_name: "",
      team_size: 1,
      is_local: false,
      willing_to_pool_cab: false,
      local_location: "",
      travel_time: "",
      origin_city: "",
      travel_medium: "",
      pickup_station: "",
    },
  });

  const isLocal = form.watch("is_local");


  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    setError("");

    try {
      const { error: submitError } = await supabase
        .from("event_participants")
        .insert({
          event_id: eventId,
          user_id: user.id,
          ...values,
          linkedin_url: values.linkedin_url || null,
          photo_url: values.photo_url || null,
        });

      if (submitError) throw submitError;

      await queryClient.invalidateQueries({ queryKey: ["event_registration"] });
      await queryClient.invalidateQueries({ queryKey: ["event_participants"] });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-left">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">1. Personal Info</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input 
            {...form.register("full_name")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Anjana"
          />
          {form.formState.errors.full_name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.full_name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City *</label>
            <input 
              {...form.register("city")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Hyderabad"
            />
            {form.formState.errors.city && <p className="text-red-500 text-xs mt-1">{form.formState.errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Profession *</label>
            <select 
              {...form.register("profession")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select Profession</option>
              {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {form.formState.errors.profession && <p className="text-red-500 text-xs mt-1">{form.formState.errors.profession.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Organization / College *</label>
          <input 
            {...form.register("organization")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="IIIT Hyderabad"
          />
          {form.formState.errors.organization && <p className="text-red-500 text-xs mt-1">{form.formState.errors.organization.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Interests / Looking For *</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {INTERESTS.map(interest => (
              <label key={interest} className="flex items-center gap-1.5 cursor-pointer bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-full text-sm transition-colors border border-border">
                <input 
                  type="checkbox" 
                  value={interest} 
                  {...form.register("interests")}
                  className="rounded border-gray-300 text-primary focus:ring-primary size-3.5"
                />
                {interest}
              </label>
            ))}
          </div>
          {form.formState.errors.interests && <p className="text-red-500 text-xs mt-1">{form.formState.errors.interests.message}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">2. Team & Travel Details</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Team Name *</label>
            <input 
              {...form.register("team_name")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g. Innovators"
            />
            {form.formState.errors.team_name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.team_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Team Strength (No. of people) *</label>
            <input 
              type="number"
              min="1"
              {...form.register("team_size")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {form.formState.errors.team_size && <p className="text-red-500 text-xs mt-1">{form.formState.errors.team_size.message}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="is_local"
              {...form.register("is_local")}
              className="rounded border-gray-300 text-primary focus:ring-primary size-4"
            />
            <label htmlFor="is_local" className="text-sm font-medium cursor-pointer">Are you local to the event city?</label>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="willing_to_pool_cab"
              {...form.register("willing_to_pool_cab")}
              className="rounded border-gray-300 text-primary focus:ring-primary size-4"
            />
            <label htmlFor="willing_to_pool_cab" className="text-sm font-medium cursor-pointer">Are you willing for auto or cab pool too? (chargeable)</label>
          </div>
        </div>

        <div className="pl-7 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {isLocal ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Where are you coming from?</label>
                <input 
                  {...form.register("local_location")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g. Madhapur"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time & Date</label>
                <input 
                  {...form.register("travel_time")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g. Oct 12, 9:00 AM"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Travelling From</label>
                <input 
                  {...form.register("origin_city")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g. Bangalore"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Travel Media</label>
                <input 
                  {...form.register("travel_medium")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g. Train, Bus, Flight"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Station / Airport of Pickup</label>
                <input 
                  {...form.register("pickup_station")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g. Secunderabad Junction"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-8"
      >
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Complete Profile & Join Hub"}
      </button>
    </form>
  );
}
