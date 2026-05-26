-- spatial_ref_sys is normally installed with the PostGIS extension.
-- Only apply this on a database that does not already have PostGIS catalog tables,
-- or keep as documentation of the structure you saw in the Table Editor.

create table public.spatial_ref_sys (
  srid integer not null,
  auth_name character varying(256) null,
  auth_srid integer null,
  srtext character varying(2048) null,
  proj4text character varying(2048) null,
  constraint spatial_ref_sys_pkey primary key (srid),
  constraint spatial_ref_sys_srid_check check (((srid > 0) and (srid <= 998999)))
) tablespace pg_default;
