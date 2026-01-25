import { DailyKalk } from '@/features/daily-kalk';
import { PrintLooker } from '@/features/print-looker';
import { UnderConstruction } from '@/shared/ui';

function DailyKalkContent() {
  return (
    <div className="py-4">
      <DailyKalk />
    </div>
  );
}

function PrintLookerContent() {
  return (
    <div className="py-4">
      <PrintLooker />
    </div>
  );
}

function JardaniContent() {
  return <UnderConstruction title="Jardani" message="Esta ferramenta está em desenvolvimento..." />;
}

export const toolTabs = [
  {
    value: 'dailykalk',
    label: 'DailyKalK',
    content: <DailyKalkContent />,
  },
  {
    value: 'printlooker',
    label: 'PrintLooker',
    content: <PrintLookerContent />,
  },
  {
    value: 'jardani',
    label: 'Jardani',
    content: <JardaniContent />,
  },
];
