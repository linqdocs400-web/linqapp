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
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  linkedin_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  photo_url: z.string().url().optional().or(z.literal("")),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  
  // Ride-sharing fields
  pickup_location: z.string().min(2, "Pickup location is required"),
  drop_location: z.string().min(2, "Drop location is required"),
  has_vehicle: z.boolean().default(false),
  willing_to_give_lift: z.boolean().default(false),
  vehicle_details: z.string().optional(),
  seats: z.coerce.number().min(1, "Must be at least 1").default(1),
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
      bio: "",
      linkedin_url: "",
      photo_url: user?.user_metadata?.avatar_url || "",
      interests: [],
      pickup_location: "",
      drop_location: "",
      has_vehicle: false,
      willing_to_give_lift: false,
      vehicle_details: "",
      seats: 1,
    },
  });

  const hasVehicle = form.watch("has_vehicle");
  const willingToGiveLift = form.watch("willing_to_give_lift");

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    setError("");

    try {
      let role = "passenger";
      if (values.has_vehicle && values.willing_to_give_lift) {
        role = "driver";
      } else if (values.has_vehicle && !values.willing_to_give_lift) {
        role = "participant";
      }

      const { willing_to_give_lift, ...dbValues } = values;

      const { error: submitError } = await supabase
        .from("event_participants")
        .insert({
          event_id: eventId,
          user_id: user.id,
          ...dbValues,
          role,
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
            placeholder="John Doe"
          />
          {form.formState.errors.full_name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.full_name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City *</label>
            <input 
              {...form.register("city")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="San Francisco"
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
            placeholder="Stanford University"
          />
          {form.formState.errors.organization && <p className="text-red-500 text-xs mt-1">{form.formState.errors.organization.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Short Bio *</label>
          <textarea 
            {...form.register("bio")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
            placeholder="I am a researcher focusing on AGI..."
          />
          {form.formState.errors.bio && <p className="text-red-500 text-xs mt-1">{form.formState.errors.bio.message}</p>}
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
        <h3 className="text-lg font-semibold border-b pb-2">2. Ride Sharing Options</h3>
        <p className="text-xs text-muted-foreground">Find people to travel with to LaunchPadX 2026.</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pickup Location *</label>
            <input 
              {...form.register("pickup_location")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g. Madhapur"
            />
            {form.formState.errors.pickup_location && <p className="text-red-500 text-xs mt-1">{form.formState.errors.pickup_location.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Drop Location *</label>
            <input 
              {...form.register("drop_location")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g. Hitex Exhibition Center"
            />
            {form.formState.errors.drop_location && <p className="text-red-500 text-xs mt-1">{form.formState.errors.drop_location.message}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input 
            type="checkbox" 
            id="has_vehicle"
            {...form.register("has_vehicle")}
            className="rounded border-gray-300 text-primary focus:ring-primary size-4"
          />
          <label htmlFor="has_vehicle" className="text-sm font-medium cursor-pointer">Do you have a vehicle?</label>
        </div>

        {hasVehicle && (
          <div className="pl-7 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle Details (Optional)</label>
              <input 
                {...form.register("vehicle_details")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g. Honda City (White)"
              />
            </div>

            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="willing_to_give_lift"
                {...form.register("willing_to_give_lift")}
                className="rounded border-gray-300 text-primary focus:ring-primary size-4"
              />
              <label htmlFor="willing_to_give_lift" className="text-sm font-medium cursor-pointer">
                Are you willing to give a lift to someone heading in the same direction?
              </label>
            </div>
          </div>
        )}

        <div className="pl-7">
          <label className="block text-sm font-medium mb-1">
            {hasVehicle && willingToGiveLift ? "Number of Vacant Seats *" : "Number of Seats Required *"}
          </label>
          <input 
            type="number"
            min="1"
            max="10"
            {...form.register("seats")}
            className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {form.formState.errors.seats && <p className="text-red-500 text-xs mt-1">{form.formState.errors.seats.message}</p>}
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
