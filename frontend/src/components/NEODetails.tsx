import React from 'react';

type Props = {
  neo: any | null;
};

export default function NEODetails({ neo }: Props) {
  if (!neo) return <div style={{ padding: 12 }}>No item selected.</div>;

  return (
    <div style={{ border: '1px solid #e6e6e6', padding: 12, borderRadius: 6, marginTop: 12 }}>
      <h3 style={{ margin: '0 0 8px 0' }}>{neo.name || neo.id}</h3>
      <div style={{ fontSize: 13, color: '#333' }}>
        <div><strong>Designation:</strong> {neo.designation}</div>
        <div><strong>JPL URL:</strong> <a href={neo.nasa_jpl_url} target="_blank" rel="noreferrer">link</a></div>
        <div><strong>Absolute mag (H):</strong> {neo.absolute_magnitude_h}</div>
        <div><strong>Potentially hazardous:</strong> {String(neo.is_potentially_hazardous_asteroid)}</div>
        <div style={{ marginTop: 8 }}>
          <strong>Estimated Diameter (km):</strong>
          <div>{neo.estimated_diameter?.kilometers ? `${neo.estimated_diameter.kilometers.estimated_diameter_min} - ${neo.estimated_diameter.kilometers.estimated_diameter_max}` : 'N/A'}</div>
        </div>
        <div style={{ marginTop: 8 }}>
          <strong>Next Close Approach:</strong>
          <div>{neo.close_approach_data?.[0]?.close_approach_date || 'N/A'}</div>
          <div>Miss distance (km): {neo.close_approach_data?.[0]?.miss_distance?.kilometers || 'N/A'}</div>
          <div>Relative velocity (km/s): {neo.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}
