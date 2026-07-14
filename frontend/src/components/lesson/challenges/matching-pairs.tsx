"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playCachedAudio } from "@/lib/audio";
import { Volume2 } from "lucide-react";

type Item = {
  id: number;
  text: string;
  type: "source" | "target";
  pairId: number;
  audioSrc?: string;
};

type Props = {
  pairs: { source: string; target: string; id: number; audioSrc?: string }[];
  onComplete: (success: boolean) => void;
  disabled?: boolean;
};

const shuffle = (items: Item[]) => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

const createColumns = (pairs: Props["pairs"]) => {
  const sourceItems: Item[] = pairs.map(p => ({ id: p.id, text: p.source, type: "source", pairId: p.id, audioSrc: p.audioSrc }));
  const targetItems: Item[] = pairs.map(p => ({ id: p.id + 1000, text: p.target, type: "target", pairId: p.id }));

  return {
    sourceItems: shuffle(sourceItems),
    targetItems: shuffle(targetItems),
  };
};

export const MatchingPairs = ({ pairs, onComplete, disabled }: Props) => {
  const [{ sourceItems, targetItems }] = useState(() => createColumns(pairs));
  const [selectedSource, setSelectedSource] = useState<number | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [wrongMatch, setWrongMatch] = useState<{ source: number; target: number } | null>(null);

  const onSelect = useCallback((item: Item) => {
    if (disabled || matchedIds.includes(item.pairId)) return;

    if (item.audioSrc) {
       playCachedAudio(item.audioSrc);
    }

    if (item.type === "source") {
        if (selectedTarget !== null) {
            const target = targetItems.find(i => i.id === selectedTarget);
            if (target && target.pairId === item.pairId) {
                const newMatched = [...matchedIds, item.pairId];
                setMatchedIds(newMatched);
                setSelectedTarget(null);
                if (newMatched.length === pairs.length) onComplete(true);
            } else {
                setWrongMatch({ source: item.id, target: selectedTarget });
                setTimeout(() => {
                    setWrongMatch(null);
                    setSelectedTarget(null);
                }, 500);
            }
        } else {
            setSelectedSource(item.id);
        }
    } else {
        if (selectedSource !== null) {
            const source = sourceItems.find(i => i.id === selectedSource);
            if (source && source.pairId === item.pairId) {
                const newMatched = [...matchedIds, item.pairId];
                setMatchedIds(newMatched);
                setSelectedSource(null);
                if (newMatched.length === pairs.length) onComplete(true);
            } else {
                setWrongMatch({ source: selectedSource, target: item.id });
                setTimeout(() => {
                    setWrongMatch(null);
                    setSelectedSource(null);
                }, 500);
            }
        } else {
            setSelectedTarget(item.id);
        }
    }
  }, [disabled, matchedIds, sourceItems, targetItems, selectedSource, selectedTarget, pairs.length, onComplete]);

  const renderItem = (item: Item) => {
        const isMatched = matchedIds.includes(item.pairId);
        const isSelected = selectedSource === item.id || selectedTarget === item.id;
        const isWrong = wrongMatch?.source === item.id || wrongMatch?.target === item.id;

        return (
          <Button
            key={item.id}
            variant="outline"
            disabled={disabled || isMatched}
            onClick={() => onSelect(item)}
            className={cn(
              "h-auto min-h-20 min-w-0 whitespace-normal px-3 py-4 text-sm leading-snug sm:px-4 sm:text-base lg:py-5 lg:text-lg border-2 border-b-4 transition-all duration-200",
              isSelected && "border-sky-300 bg-sky-100",
              isMatched && "opacity-0 pointer-events-none",
              isWrong && "border-rose-400 bg-rose-100 animate-shake"
            )}
          >
            <div className="flex w-full min-w-0 items-center justify-center gap-x-2 text-center">
                {item.audioSrc && <Volume2 className="h-4 w-4 shrink-0 text-sky-500" />}
                <span className="min-w-0 break-words">{item.text}</span>
            </div>
          </Button>
        );
  };

  return (
    <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:gap-4">
      <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
        {sourceItems.map(renderItem)}
      </div>
      <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
        {targetItems.map(renderItem)}
      </div>
    </div>
  );
};
