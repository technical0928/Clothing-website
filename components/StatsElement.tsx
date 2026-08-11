// *********************
// Role of the component: Stat card on the admin dashboard, driven by real data
// Name of the component: StatsElement.tsx
// Component call: <StatsElement title="Products" value={10} change="Live from Neon" />
// Input parameters: { title: string, value: number | string, change?: string }
// Output: styled stat card with title, value and optional change hint
// *********************

import React from "react";
import { FaArrowUp } from "react-icons/fa6";

const StatsElement = ({
  title,
  value,
  change,
}: {
  title: string;
  value: number | string;
  change?: string;
}) => {
  return (
    <div className="w-80 h-32 bg-amber-100 text-charcoal flex flex-col justify-center items-center rounded-md max-md:w-full">
      <h4 className="text-xl text-charcoal">{title}</h4>
      <p className="text-2xl font-bold">{value}</p>
      {change && (
        <p className="text-amber-700 flex gap-x-1 items-center">
          <FaArrowUp />
          {change}
        </p>
      )}
    </div>
  );
};

export default StatsElement;
