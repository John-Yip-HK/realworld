'use client';

import { useBearStore } from "../lib/state-mgmt/useBearStore"
import useStore from "../lib/state-mgmt/useStore"

export default function ZustardPage() {
  const bears = useStore(useBearStore, (store) => store.bears);

  return (
    <main>
      <p>{bears}</p>
      Zustard
    </main>
  )
}
