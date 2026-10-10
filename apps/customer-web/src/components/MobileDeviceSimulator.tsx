import React from 'react';

export interface MobileDeviceSimulatorProps {
  children: React.ReactNode;
}

export const MobileDeviceSimulator: React.FC<MobileDeviceSimulatorProps> = ({ children }) => {
  return <>{children}</>;
};
