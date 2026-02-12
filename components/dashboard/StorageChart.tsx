import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { StorageStat } from '../../types';

interface Props {
  data: StorageStat[];
  loading: boolean;
  activeIndex?: number;
  onHover?: (index: number | undefined) => void;
}

// Inject keyframes for the active sector "pop" animation
// This makes the expansion feel like a spring/bounce rather than a hard snap
const style = `
  @keyframes sector-pop {
    0% { transform: scale(0.96); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
  .sector-active-anim {
    animation: sector-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
`;

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  return (
    <g style={{ cursor: 'pointer' }}>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="sector-active-anim"
        style={{ 
            filter: `drop-shadow(0 4px 12px ${fill}60)`,
            transformOrigin: `${cx}px ${cy}px`,
        }}
      />
      {/* Outer ripple/glow ring for extra effect */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 14}
        fill={fill}
        opacity={0.1}
        className="animate-pulse"
        style={{ 
             pointerEvents: 'none'
        }}
      />
    </g>
  );
};

export const StorageChart: React.FC<Props> = ({ data, loading, activeIndex, onHover }) => {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full text-sm relative z-10">
      <style>{style}</style>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
            cornerRadius={6}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => onHover && onHover(index)}
            onMouseLeave={() => onHover && onHover(undefined)}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                stroke="transparent"
                className="outline-none focus:outline-none"
                style={{
                  opacity: activeIndex !== undefined && activeIndex !== index ? 0.3 : 1,
                  // Smooth transition for opacity when state changes
                  transition: 'opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  cursor: 'pointer'
                }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};