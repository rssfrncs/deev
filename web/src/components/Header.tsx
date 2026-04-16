import { useState, useEffect, useRef } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { useAppSelector, useAppDispatch } from '../store/hooks';

function playSuccessSound() {
  const ctx = new AudioContext();
  // C5 → E5 → G5 soft major arpeggio
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.start(t);
    osc.stop(t + 0.45);
  });
}

function CreateVideoPopover() {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const creating = useAppSelector((s) => s.videos.creating);
  const createError = useAppSelector((s) => s.videos.createError);
  const topTags = useAppSelector((s) => s.topTags);
  const closeRef = useRef<(() => void) | null>(null);
  const prevCreatingRef = useRef(false);

  const suggestions = topTags
    .map((t) => t.name)
    .filter((name) => !tags.includes(name))
    .filter((name) => !tagInput || name.includes(tagInput.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  useEffect(() => { setHighlightedIndex(-1); }, [tagInput]);

  useEffect(() => {
    if (prevCreatingRef.current && !creating && closeRef.current) {
      if (createError) {
        setFormError(createError);
        closeRef.current = null;
      } else {
        setSuccess(true);
        playSuccessSound();
        const timer = setTimeout(() => {
          setSuccess(false);
          closeRef.current?.();
          closeRef.current = null;
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
    prevCreatingRef.current = creating;
  }, [creating, createError]);

  function addTag(value: string) {
    const tag = value.trim().toLowerCase();
    if (tag && !tags.includes(tag)) setTags((prev) => [...prev, tag]);
    setTagInput('');
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        addTag(suggestions[highlightedIndex]);
      } else {
        addTag(tagInput);
      }
      setHighlightedIndex(-1);
    } else if (e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
      setHighlightedIndex(-1);
    } else if (e.key === 'Backspace' && !tagInput) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function handleSubmit(e: React.FormEvent, close: () => void) {
    e.preventDefault();
    const finalTags = tagInput.trim()
      ? [...new Set([...tags, tagInput.trim().toLowerCase()])]
      : tags;
    closeRef.current = close;
    setFormError(null);
    dispatch({ type: '[ui] create video submitted', payload: { title, duration: Number(duration), tags: finalTags } });
    setTitle('');
    setDuration('');
    setTags([]);
    setTagInput('');
  }

  return (
    <Popover className="relative">
      <PopoverButton className="flex items-center gap-2 rounded-pill bg-veed-green hover:bg-veed-green-hover text-ink font-medium text-sm px-5 py-2.5 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink">
        + Add video
      </PopoverButton>
      <PopoverPanel
        anchor="bottom end"
        className="z-30 mt-2 w-96 rounded-2xl bg-canvas border border-border shadow-lg p-4"
      >
        {({ close }) => (
          <form onSubmit={(e) => handleSubmit(e, close)} className="flex flex-col gap-3">
            <input
              className="rounded-xl bg-input-bg px-4 py-2.5 text-sm text-ink placeholder-ink-tertiary focus:outline-none"
              placeholder="Video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
            <input
              className="rounded-xl bg-input-bg px-4 py-2.5 text-sm text-ink placeholder-ink-tertiary focus:outline-none"
              placeholder="Duration (s)"
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
            <div
              className="rounded-xl bg-input-bg px-3 py-2 flex flex-wrap gap-1.5 cursor-text min-h-[42px]"
              onClick={() => tagInputRef.current?.focus()}
            >
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs bg-canvas border border-border px-2 py-0.5 rounded-pill text-ink-secondary">
                  {tag}
                  <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))} aria-label={`Remove ${tag} tag`} className="hover:text-ink leading-none">×</button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                className="flex-1 min-w-[80px] bg-transparent text-sm text-ink placeholder-ink-tertiary focus:outline-none"
                placeholder={tags.length === 0 ? 'Tags (Enter to add)' : ''}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => { setShowSuggestions(false); setHighlightedIndex(-1); }}
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <ul className="rounded-xl border border-border overflow-hidden">
                {suggestions.map((name, i) => (
                  <li
                    key={name}
                    onMouseDown={(e) => { e.preventDefault(); addTag(name); setHighlightedIndex(-1); }}
                    className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                      i === highlightedIndex ? 'bg-veed-green text-ink' : 'text-ink-secondary hover:bg-surface'
                    }`}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
            {formError && (
              <p role="alert" className="text-xs text-red-500 px-1">{formError}</p>
            )}
            <button
              type="submit"
              disabled={creating || success}
              className="rounded-pill bg-veed-green text-ink font-medium text-sm px-5 py-2.5 transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ opacity: creating ? 0.7 : 1 }}
            >
              {success ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Added!
                </>
              ) : creating ? (
                <>
                  <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Adding…
                </>
              ) : 'Add video'}
            </button>
          </form>
        )}
      </PopoverPanel>
    </Popover>
  );
}

export function Header() {
  const dispatch = useAppDispatch();
  const route = useAppSelector((s) => s.route);
  return (
    <header className="sticky top-0 z-10 bg-canvas border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: '[ui] navigate home' })}
          className="text-ink hover:opacity-70 transition-opacity"
          aria-label="VEED home"
        >
          <svg viewBox="0 0 115 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5">
            <path d="m32.626.367-8.802 21.589a3.284 3.284 0 0 1-3.041 2.043h-8.895a3.283 3.283 0 0 1-3.04-2.04L.02.367A.266.266 0 0 1 .266 0h8.91c.222 0 .421.138.5.346l6.672 17.795L22.967.348a.533.533 0 0 1 .5-.348h8.912c.189 0 .318.192.247.367Zm.813-.1v23.466c0 .147.12.267.267.267h24.463c.146 0 .266-.12.266-.267v-5.851a.267.267 0 0 0-.266-.267h-15.92a.267.267 0 0 1-.266-.267v-1.927c0-.146.12-.266.267-.266h15.557c.147 0 .267-.12.267-.267V9.082a.267.267 0 0 0-.267-.267H42.25a.267.267 0 0 1-.267-.267V6.652c0-.147.12-.267.267-.267h15.919c.146 0 .266-.12.266-.267V.267A.267.267 0 0 0 58.17 0H33.706a.267.267 0 0 0-.267.267Zm26.12 0v23.466c0 .147.12.267.268.267H84.29c.146 0 .266-.12.266-.267v-5.851a.268.268 0 0 0-.266-.267H68.37a.267.267 0 0 1-.266-.267v-1.927c0-.146.12-.266.267-.266h15.557c.147 0 .267-.12.267-.267V9.082a.267.267 0 0 0-.267-.267H68.37a.267.267 0 0 1-.267-.267V6.652c0-.147.12-.267.267-.267H84.29c.146 0 .266-.12.266-.267V.267A.268.268 0 0 0 84.29 0H59.826a.267.267 0 0 0-.266.267Zm26.123 23.466c0 .147.12.267.266.267h16.76c3.668 0 6.627-.951 8.891-2.868 2.264-1.902 3.396-4.95 3.396-9.147s-1.132-7.245-3.396-9.148C109.335.95 106.377 0 102.708 0h-16.76a.267.267 0 0 0-.266.267v23.466Zm8.81-6.163a.267.267 0 0 1-.267-.267V6.697c0-.147.12-.267.266-.267h6.255c1.932 0 3.366.423 4.302 1.268.936.845 1.403 2.279 1.403 4.287s-.467 3.472-1.403 4.317c-.936.846-2.37 1.268-4.302 1.268h-6.255Z" fill="currentColor" />
          </svg>
        </button>
        {route.name === 'home' && <CreateVideoPopover />}
      </div>
    </header>
  );
}
