
CREATE TABLE public.diagnostic_metrics (
	"name" varchar(128) NULL,
	oru_sonic_codes varchar(64) NULL,
	diagnostic varchar(128) NULL,
	diagnostic_groups varchar(64) NULL,
	oru_sonic_units varchar(50) NULL,
	units varchar(50) NULL,
	min_age int4 NULL,
	max_age int4 NULL,
	gender varchar(50) NULL,
	standard_lower float4 NULL,
	standard_higher float4 NULL,
	everlab_lower float4 NULL,
	everlab_higher float4 NULL
);