create table public.reviews (
  id uuid not null default gen_random_uuid (),
  ride_id uuid null,
  reviewer_id uuid not null,
  reviewed_user_id uuid not null,
  rating integer not null,
  review text null,
  created_at timestamp with time zone null default now (),
  updated_at timestamp with time zone null default now (),
  constraint reviews_pkey primary key (id),
  constraint reviews_ride_id_fkey foreign key (ride_id) references public.ride_posts (id) on delete set null,
  constraint reviews_rating_check check ((rating >= 1) and (rating <= 5)),
  constraint reviews_reviewer_reviewed_check check ((reviewer_id <> reviewed_user_id))
) tablespace pg_default;

create unique index if not exists uniq_reviews_reviewer_reviewed_user on public.reviews using btree (reviewer_id, reviewed_user_id) tablespace pg_default;

create index if not exists idx_reviews_reviewed_user_id on public.reviews using btree (reviewed_user_id) tablespace pg_default;

create index if not exists idx_reviews_reviewer_id on public.reviews using btree (reviewer_id) tablespace pg_default;

create unique index if not exists reviews_reviewer_reviewed_ride_uidx on public.reviews using btree (reviewer_id, reviewed_user_id, ride_id) tablespace pg_default;

create trigger trg_reviews_set_updated_at
before update on public.reviews
for each row
execute function public.set_updated_at ();
