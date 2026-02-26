'use client';

import { useState } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';

interface EmojiPickerProps {
  trigger: React.ReactNode;
  onEmojiSelected: (emoji: string) => void;
}

const EMOJI_CATEGORIES = [
  {
    label: 'Rostos',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
      '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗',
      '😚', '😋', '😛', '😜', '🤪', '😝',
    ],
  },
  {
    label: 'Gestos',
    emojis: [
      '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌',
      '🤝', '🙏', '💪', '🦾', '👈', '👉', '👆', '👇',
      '✌️', '🤞', '🤟', '🤘', '🤙',
    ],
  },
  {
    label: 'Objetos',
    emojis: [
      '🚀', '💡', '🔥', '⭐', '✨', '💎', '🎯', '🏆',
      '🎨', '📊', '💰', '📈', '🔑', '🎁', '💼', '📱',
      '💻', '🖥️', '📝', '✅', '❌',
    ],
  },
  {
    label: 'Natureza',
    emojis: [
      '🌟', '🌈', '🌺', '🌸', '🍀', '🌿', '🌴', '🌊',
      '💧', '☀️', '🌙', '⚡', '🔥', '❄️', '🌪️', '🌍',
    ],
  },
];

export function EmojiPicker({ trigger, onEmojiSelected }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(emoji: string) {
    onEmojiSelected(emoji);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="max-h-72 w-80 overflow-y-auto p-3" align="start">
        <div className="flex flex-col gap-3">
          {EMOJI_CATEGORIES.map((category) => (
            <div key={category.label}>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {category.label}
              </span>
              <div className="grid grid-cols-8 gap-1">
                {category.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelect(emoji)}
                    className="flex size-8 cursor-pointer items-center justify-center rounded text-base transition-colors hover:bg-accent"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
