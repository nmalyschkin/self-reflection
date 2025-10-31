/**
 * Insert markdown into the self-reflection editor and submit it.
 * This simulates a user pasting text into the TipTap editor and pressing Cmd/Ctrl+Enter.
 */
export async function typeReflectionAndSubmit(
  markdown: string,
  options: { simulate?: boolean; charsPerMinute?: number; signal?: AbortSignal } = {
    simulate: true,
    charsPerMinute: 8000,
  },
): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const mdContainer = document.querySelector('.mdtext') as HTMLElement | null;
  const proseMirror = document.querySelector('.mdtext .ProseMirror') as HTMLElement | null;
  if (!mdContainer || !proseMirror) {
    throw new Error('Reflection editor not found');
  }

  proseMirror.focus();

  const simulate = options?.simulate ?? true;
  const charsPerMinute = options?.charsPerMinute ?? 150;
  const signal = options?.signal;

  if (simulate) {
    await typeTextSlowly(proseMirror, markdown, charsPerMinute, signal);
  } else {
    // Try to paste the entire markdown at once (TipTap handles paste well)
    const pasted = tryDispatchPaste(proseMirror, markdown);
    if (!pasted) {
      // Fallback to execCommand for broader compatibility
      // eslint-disable-next-line deprecation/deprecation
      const ok = document.execCommand('insertText', false, markdown);
      if (!ok) {
        // Final fallback: dispatch a generic input event to nudge updates
        proseMirror.textContent = markdown;
        proseMirror.dispatchEvent(new InputEvent('input', { bubbles: true }));
      }
    }
  }

  await sleep(0); // yield to allow TipTap update cycle

  // Submit via keyboard shortcut (works regardless of locale/button text)
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const submitEvent = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    metaKey: isMac,
    ctrlKey: !isMac,
    bubbles: true,
    cancelable: true,
  });
  mdContainer.dispatchEvent(submitEvent);
}

function tryDispatchPaste(target: HTMLElement, text: string): boolean {
  try {
    const data = new DataTransfer();
    data.setData('text/plain', text);
    data.setData('text/html', text);

    const evt = new ClipboardEvent('paste', {
      clipboardData: data,
      bubbles: true,
      cancelable: true,
    } as ClipboardEventInit);

    // Some browsers ignore the constructor clipboardData, define it explicitly
    if (!evt.clipboardData) {
      Object.defineProperty(evt, 'clipboardData', {
        value: data,
      });
    }

    return target.dispatchEvent(evt);
  } catch {
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default typeReflectionAndSubmit;

export async function typeTextSlowly(
  target: HTMLElement,
  text: string,
  charsPerMinute: number,
  signal?: AbortSignal,
): Promise<void> {
  const delayPerCharMs = Math.max(0, Math.floor(60000 / Math.max(1, charsPerMinute)));
  target.focus();

  for (let i = 0; i < text.length; i++) {
    if (signal?.aborted) throw new Error('Typing aborted');
    const ch = text[i];

    if (ch === '\n') {
      // eslint-disable-next-line deprecation/deprecation
      if (!document.execCommand('insertParagraph')) {
        target.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            bubbles: true,
            cancelable: true,
          }),
        );
      }
    } else {
      // eslint-disable-next-line deprecation/deprecation
      const ok = document.execCommand('insertText', false, ch);
      if (!ok) {
        // As a last resort, send a beforeinput/input pair
        try {
          target.dispatchEvent(
            new InputEvent('beforeinput', {
              bubbles: true,
              cancelable: true,
              data: ch,
              inputType: 'insertText',
            } as InputEventInit),
          );
          target.dispatchEvent(
            new InputEvent('input', { bubbles: true, data: ch } as InputEventInit),
          );
        } catch {
          // Fallback: append to textContent and trigger input
          target.textContent = (target.textContent || '') + ch;
          target.dispatchEvent(new InputEvent('input', { bubbles: true }));
        }
      }
    }

    await sleep(delayPerCharMs);
  }
}
