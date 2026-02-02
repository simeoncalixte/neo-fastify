
import { Type, Static } from '@sinclair/typebox';

export const LinksSchema = Type.Object({
  self: Type.String(),
  previous: Type.Optional(Type.String()),
  next: Type.Optional(Type.String()),
});

export const EstimatedDiameterRangeSchema = Type.Object({
  estimated_diameter_min: Type.Number(),
  estimated_diameter_max: Type.Number(),
});

export const EstimatedDiameterSchema = Type.Object({
  kilometers: EstimatedDiameterRangeSchema,
  meters: EstimatedDiameterRangeSchema,
  miles: EstimatedDiameterRangeSchema,
  feet: EstimatedDiameterRangeSchema,
});

export const RelativeVelocitySchema = Type.Object({
  kilometers_per_second: Type.String(),
  kilometers_per_hour: Type.String(),
  miles_per_hour: Type.String(),
});

export const MissDistanceSchema = Type.Object({
  astronomical: Type.String(),
  lunar: Type.String(),
  kilometers: Type.String(),
  miles: Type.String(),
});

export const CloseApproachDataSchema = Type.Object({
  close_approach_date: Type.String(),
  close_approach_date_full: Type.String(),
  epoch_date_close_approach: Type.Number(),
  relative_velocity: RelativeVelocitySchema,
  miss_distance: MissDistanceSchema,
  orbiting_body: Type.String(),
});

export const OrbitClassSchema = Type.Object({
  orbit_class_type: Type.String(),
  orbit_class_description: Type.String(),
  orbit_class_range: Type.String(),
});

export const OrbitalDataSchema = Type.Object({
  orbit_id: Type.String(),
  orbit_determination_date: Type.String(),
  first_observation_date: Type.String(),
  last_observation_date: Type.String(),
  data_arc_in_days: Type.Number(),
  observations_used: Type.Number(),
  orbit_uncertainty: Type.String(),
  minimum_orbit_intersection: Type.String(),
  jupiter_tisserand_invariant: Type.String(),
  epoch_osculation: Type.String(),
  eccentricity: Type.String(),
  semi_major_axis: Type.String(),
  inclination: Type.String(),
  ascending_node_longitude: Type.String(),
  orbital_period: Type.String(),
  perihelion_distance: Type.String(),
  perihelion_argument: Type.String(),
  aphelion_distance: Type.String(),
  perihelion_time: Type.String(),
  mean_anomaly: Type.String(),
  mean_motion: Type.String(),
  equinox: Type.String(),
  orbit_class: OrbitClassSchema,
});

export const NEOSchema = Type.Object({
  links: LinksSchema,
  id: Type.String(),
  neo_reference_id: Type.Optional(Type.String()),
  name: Type.String(),
  designation: Type.Optional(Type.String()),
  nasa_jpl_url: Type.String(),
  absolute_magnitude_h: Type.Number(),
  estimated_diameter: EstimatedDiameterSchema,
  is_potentially_hazardous_asteroid: Type.Boolean(),
  close_approach_data: Type.Array(CloseApproachDataSchema),
  orbital_data: Type.Optional(OrbitalDataSchema),
  is_sentry_object: Type.Boolean(),
});

export const NEOBrowseResponseSchema = Type.Object({
  links: LinksSchema,
  page: Type.Object({
    size: Type.Number(),
    total_elements: Type.Number(),
    total_pages: Type.Number(),
    number: Type.Number(),
  }),
  near_earth_objects: Type.Array(NEOSchema),
});

export const NEOFeedResponseSchema = Type.Object({
  links: LinksSchema,
  element_count: Type.Number(),
  near_earth_objects: Type.Record(Type.String(), Type.Array(NEOSchema)),
});

export type NEO = Static<typeof NEOSchema>;

