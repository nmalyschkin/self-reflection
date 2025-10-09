import type { LMStatus, Reflection } from '../types';

type Props = {
  reflections: Reflection[];
  lmStatus: LMStatus;
  onStart: () => void;
  onOpen: (id: string) => void;
  onStartDownload?: () => void;
  downloadButton?: boolean;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function StartView({
  reflections,
  lmStatus,
  onStart,
  onOpen,
  onStartDownload,
  downloadButton,
}: Props) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Self Reflection</h1>
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={onStart}>
        Start reflecting
      </button>
      {downloadButton && lmStatus === 'downloadable' && (
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={onStartDownload}>
          Download model
        </button>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-medium mb-2">History</h2>
        {reflections.length === 0 ? (
          <p className="text-sm text-gray-500">No reflections yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {reflections.map((r) => {
              const firstLine = r.entries[0]?.text?.split('\n')[0] ?? '';
              return (
                <li key={r.id} className="py-2">
                  <button
                    className="text-left w-full hover:bg-gray-50 rounded p-2"
                    onClick={() => onOpen(r.id)}
                  >
                    <div className="text-sm font-medium truncate">{firstLine || '(no text)'}</div>
                    <div className="text-xs text-gray-500">{formatDate(r.createdAt)}</div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
