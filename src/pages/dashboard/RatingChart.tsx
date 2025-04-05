
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  [key: string]: string | number;
}

interface RatingChartProps {
  data: ChartData[];
}

const RatingChart: React.FC<RatingChartProps> = ({ data }) => {
  // Get player names from the data (excluding the 'name' property)
  const playerNames = data.length > 0 
    ? Object.keys(data[0]).filter(key => key !== 'name')
    : [];

  // Colors for different players
  const colors = ['#1976D2', '#4CAF50', '#FFD700', '#E91E63', '#9C27B0'];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={['dataMin - 50', 'dataMax + 50']} />
          <Tooltip />
          <Legend />
          {playerNames.map((player, index) => (
            <Line
              key={player}
              type="monotone"
              dataKey={player}
              stroke={colors[index % colors.length]}
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RatingChart;
