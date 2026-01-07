'use client';

import { DailyKalk } from '@/features/daily-kalk';
import { Tabs, UnderConstruction } from '@/shared/ui';

function DailyKalkContent() {
  return (
    <div className="py-4">
      <DailyKalk />
    </div>
  );
}

function JardaniContent() {
  return <UnderConstruction title="Jardani" message="Esta ferramenta está em desenvolvimento..." />;
}

const toolTabs = [
  {
    value: 'dailykalk',
    label: 'DailyKalK',
    content: <DailyKalkContent />,
  },
  {
    value: 'jardani',
    label: 'Jardani',
    content: <JardaniContent />,
  },
];

export function ToolsPage() {
  return (
    <main className="min-h-screen pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-thin text-glow mb-8">Tools</h1>
        <Tabs items={toolTabs} defaultValue="dailykalk" />
      </div>
    </main>
  );
}
