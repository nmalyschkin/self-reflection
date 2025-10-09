import type { LMStatus, Reflection } from '../types';
import { useCallback, useEffect, useState } from 'react';
import ReflectionSession from '../state/ReflectionSession';

type Props = {
  reflectionId: string | null;
  lmStatus: LMStatus;
  isExisting: boolean;
  onSave: () => void;
  onBack: () => void;
};

export default function ReflectView({ reflectionId, lmStatus, isExisting, onSave, onBack }: Props) {
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [reflectionSession, setReflectionSession] = useState<ReflectionSession | null>(null);
  const [input, setInput] = useState('');
  const [promptState, setPromptState] = useState<'idle' | 'processing'>('idle');

  useEffect(() => {
    const reflectionSession = new ReflectionSession(reflectionId);
    reflectionSession.subscribeReflectioState((reflection, promptState) => {
      setReflection(reflection);
      setPromptState(promptState);
    });
    setReflectionSession(reflectionSession);
  }, [reflectionId]);

  const submitReflectionStatement = useCallback(() => {
    if (!reflectionSession) return;
    reflectionSession.userSubmit(input);
  }, [reflectionSession, input]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reflection</h1>
        <button className="text-sm text-blue-600" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="space-y-3">
        {reflection?.entries.map((e, i) => (
          <div key={e.createdAt + i} className="space-y-1">
            <div
              className={`rounded p-3 text-sm ${
                e.type === 'user'
                  ? 'bg-gray-100'
                  : e.type === 'ai-answer'
                    ? 'bg-blue-50'
                    : 'bg-green-50'
              }`}
            >
              {e.text}
            </div>
          </div>
        ))}
      </div>

      <div>
        <textarea
          className="w-full border rounded p-2 min-h-[120px]"
          placeholder="Write a reflection..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {promptState === 'processing' ? (
        <div className="text-sm text-gray-500">Thinking...</div>
      ) : (
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={onSave}>
            Save
          </button>
          <button
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={submitReflectionStatement}
            disabled={lmStatus !== 'available'}
          >
            Deeper reflection
          </button>
        </div>
      )}
      {isExisting && (
        <p className="text-xs text-gray-500">Viewing past reflection (changes won’t be saved).</p>
      )}
    </div>
  );
}
