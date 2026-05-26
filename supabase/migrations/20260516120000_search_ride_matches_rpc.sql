-- Distance-based search over active ride_posts using Haversine (no PostGIS required).
-- SECURITY DEFINER so the app can call this with the anon key without opening full profile rows via RLS.
-- Review grants / policies for your threat model.

create or replace function public.haversine_km(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
)
returns double precision
language sql
immutable
parallel safe
as $$
  select case
    when lat1 is null or lon1 is null or lat2 is null or lon2 is null then null::double precision
    else (
      6371.0 * acos(
        least(
          1.0::double precision,
          greatest(
            -1.0::double precision,
            cos(radians(lat1::double precision))
              * cos(radians(lat2::double precision))
              * cos(radians(lon2::double precision) - radians(lon1::double precision))
            + sin(radians(lat1::double precision)) * sin(radians(lat2::double precision))
          )
        )
      )
    )::double precision
  end;
$$;

create or replace function public.search_ride_matches_by_route(
  p_pickup_lat double precision,
  p_pickup_lon double precision,
  p_drop_lat double precision,
  p_drop_lon double precision,
  p_min_lon double precision default null,
  p_min_lat double precision default null,
  p_max_lon double precision default null,
  p_max_lat double precision default null,
  p_max_route_km double precision default 800,
  p_limit integer default 24,
  p_exclude_owner_id uuid default null
)
returns table (
  ride_id uuid,
  owner_id uuid,
  owner_name text,
  pickup_location text,
  drop_location text,
  ride_type text,
  vehicle_type text,
  seats integer,
  pickup_distance_km double precision,
  drop_distance_km double precision,
  route_distance_km double precision,
  overlap_pct integer,
  connect_method text,
  connect_id text,
  bio text
)
language sql
stable
security definer
set search_path = public
as $$
  with base as (
    select
      r.id as rid,
      r.owner_id as oid,
      coalesce(p.name, 'Rider')::text as oname,
      r.pickup_location,
      r.drop_location,
      r.ride_type,
      r.vehicle_type,
      r.seats,
      r.pickup_lat as r_plat,
      r.pickup_lon as r_plon,
      r.drop_lat as r_dlat,
      r.drop_lon as r_dlon,
      public.haversine_km(p_pickup_lat, p_pickup_lon, r.pickup_lat, r.pickup_lon) as d_pick,
      public.haversine_km(p_drop_lat, p_drop_lon, r.drop_lat, r.drop_lon) as d_drop,
      p.connect_method::text as cmethod,
      p.connect_id::text as cid,
      coalesce(p.bio, '')::text as pbio
    from public.ride_posts r
    left join public.profiles p on p.id = r.owner_id
    where r.status = 'active'
      and r.pickup_lat is not null
      and r.pickup_lon is not null
      and r.drop_lat is not null
      and r.drop_lon is not null
      and (p_exclude_owner_id is null or r.owner_id is distinct from p_exclude_owner_id)
  ),
  scored as (
    select
      b.*,
      (coalesce(b.d_pick, 1e9::double precision) + coalesce(b.d_drop, 1e9::double precision)) as route_km
    from base b
    where b.d_pick is not null
      and b.d_drop is not null
      and (
        (p_min_lat is null and p_max_lat is null and p_min_lon is null and p_max_lon is null)
        or (
          (b.r_plat between p_min_lat and p_max_lat and b.r_plon between p_min_lon and p_max_lon)
          or (b.r_dlat between p_min_lat and p_max_lat and b.r_dlon between p_min_lon and p_max_lon)
        )
      )
  )
  select
    s.rid as ride_id,
    s.oid as owner_id,
    s.oname as owner_name,
    s.pickup_location,
    s.drop_location,
    s.ride_type,
    s.vehicle_type,
    s.seats,
    round(s.d_pick::numeric, 2)::double precision as pickup_distance_km,
    round(s.d_drop::numeric, 2)::double precision as drop_distance_km,
    round(s.route_km::numeric, 2)::double precision as route_distance_km,
    greatest(
      5,
      least(
        99,
        floor(
          greatest(0::double precision, 100::double precision - (s.route_km * 0.35::double precision))
        )::integer
      )
    ) as overlap_pct,
    s.cmethod as connect_method,
    s.cid as connect_id,
    s.pbio as bio
  from scored s
  where s.route_km <= p_max_route_km
  order by s.route_km asc
  limit greatest(1, least(p_limit, 100));
$$;

grant execute on function public.haversine_km(double precision, double precision, double precision, double precision) to anon, authenticated;

grant execute on function public.search_ride_matches_by_route(
  double precision,
  double precision,
  double precision,
  double precision,
  double precision,
  double precision,
  double precision,
  double precision,
  double precision,
  integer,
  uuid
) to anon, authenticated;
