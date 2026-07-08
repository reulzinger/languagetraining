"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("@/components/App"), {
  ssr: false,
  loading: () => (
    <div className="splash">
      <div className="splash-emoji">🦸</div>
      <div className="splash-title">Sprachhelden</div>
    </div>
  ),
});

export default function Page() {
  return <App />;
}
