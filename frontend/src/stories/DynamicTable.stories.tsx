import React from 'react';
import DynamicTable from '../components/DynamicTable';
import NEODetails from '../components/NEODetails';

export default {
  title: 'Components/DynamicTable',
  component: DynamicTable,
};

const neo1 = {
  id: '1',
  neo_reference_id: '3542519',
  name: 'Test Asteroid 1',
  designation: '2021 AB',
  nasa_jpl_url: 'https://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3542519',
  absolute_magnitude_h: 22.1,
  estimated_diameter: {
    kilometers: { estimated_diameter_min: 0.05, estimated_diameter_max: 0.12 },
  },
  is_potentially_hazardous_asteroid: false,
  close_approach_data: [
    {
      close_approach_date: '2021-01-01',
      close_approach_date_full: '2021-Jan-01 00:00',
      epoch_date_close_approach: 1609459200000,
      relative_velocity: { kilometers_per_second: '5.1', kilometers_per_hour: '18360', miles_per_hour: '11410' },
      miss_distance: { astronomical: '0.042', lunar: '16.3', kilometers: '6350000', miles: '3940000' },
      orbiting_body: 'Earth',
    },
  ],
};

const neo2 = {
  id: '2',
  neo_reference_id: '9999999',
  name: 'Dangerous Rock',
  designation: '2022 ZX',
  nasa_jpl_url: 'https://ssd.jpl.nasa.gov/sbdb.cgi?sstr=9999999',
  absolute_magnitude_h: 18.7,
  estimated_diameter: {
    kilometers: { estimated_diameter_min: 0.3, estimated_diameter_max: 0.7 },
  },
  is_potentially_hazardous_asteroid: true,
  close_approach_data: [
    {
      close_approach_date: '2022-02-02',
      close_approach_date_full: '2022-Feb-02 12:30',
      epoch_date_close_approach: 1643800200000,
      relative_velocity: { kilometers_per_second: '12.0', kilometers_per_hour: '43200', miles_per_hour: '26833' },
      miss_distance: { astronomical: '0.002', lunar: '0.8', kilometers: '300000', miles: '186000' },
      orbiting_body: 'Earth',
    },
  ],
};

export const NEOItem = () => (
  <DynamicTable
    data={[neo1]}
    columns={[
      'id',
      'name',
      'absolute_magnitude_h',
      'estimated_diameter.kilometers.estimated_diameter_min',
      'is_potentially_hazardous_asteroid',
      'close_approach_data.0.miss_distance.kilometers',
    ]}
    headers={['ID', 'Name', 'H', 'Min km', 'Hazardous', 'Miss km']}
  />
);

export const BrowseResponse = () => (
  <DynamicTable
    data={[neo1, neo2]}
    columns={['id', 'name', 'nasa_jpl_url', 'absolute_magnitude_h', 'is_potentially_hazardous_asteroid']}
    headers={['ID', 'Name', 'JPL URL', 'H', 'Hazardous']}
  />
);

export const FeedResponse = () => {
  const feed: Record<string, any[]> = {
    '2021-01-01': [neo1],
    '2022-02-02': [neo2],
  };
  const flattened = Object.values(feed).flat();
  const [selected, setSelected] = React.useState<any | null>(null);
  return (
    <div>
      <DynamicTable
        data={flattened}
        columns={['id', 'name', 'close_approach_data.0.close_approach_date', 'close_approach_data.0.miss_distance.kilometers']}
        headers={['ID', 'Name', 'Approach Date', 'Miss (km)']}
        onRowClick={(row) => setSelected(row)}
      />
      <NEODetails neo={selected} />
    </div>
  );
};

export const BrowseResponseInteractive = () => {
  const items = [neo1, neo2];
  const [selected, setSelected] = React.useState<any | null>(null);
  return (
    <div>
      <DynamicTable
        data={items}
        columns={['id', 'name', 'nasa_jpl_url', 'absolute_magnitude_h', 'is_potentially_hazardous_asteroid']}
        headers={['ID', 'Name', 'JPL URL', 'H', 'Hazardous']}
        onRowClick={(row) => setSelected(row)}
      />
      <NEODetails neo={selected} />
    </div>
  );
};

export const DetailsPage = () => {
  // Demonstrates a details-only view (e.g., navigated to /neo/:id)
  return <NEODetails neo={neo2} />;
};
