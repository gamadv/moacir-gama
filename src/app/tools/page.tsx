import { Suspense } from 'react';

import { ToolsPage } from '@/views/tools';

export default function Page() {
  return (
    <Suspense>
      <ToolsPage />
    </Suspense>
  );
}
