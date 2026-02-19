import { DailyKalk } from '@/features/daily-kalk';
import { Jardani } from '@/features/jardani';
import { PrintLooker } from '@/features/print-looker';
import { AuthLockedMessage } from '@/shared/ui';

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
  return (
    <div className="py-4">
      <Jardani />
    </div>
  );
}

function JardaniLockedContent() {
  return (
    <AuthLockedMessage
      title="Jardani"
      message="Controlador financeiro com cálculo de impostos do Simples Nacional. Faça login para acessar."
    />
  );
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
    isAuthRequired: true,
    lockedContent: <JardaniLockedContent />,
  },
];
