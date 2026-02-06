import React from 'react';
import AppShell from '../../components/layout/AppShell';
import DoItYourselfSection from '../../components/diy/DoItYourselfSection';

const DoItYourselfScreen = () => {
  return (
    <AppShell title="Do It Yourself">
      <DoItYourselfSection />
    </AppShell>
  );
};

export default DoItYourselfScreen;
