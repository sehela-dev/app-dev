"use client";

import { useEffect, useRef } from "react";

import { Loader2 } from "lucide-react";

interface IInfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
  className?: string;
}

export function InfiniteScroll({ hasMore, isLoading, onLoadMore, children, className }: IInfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className={className}>
      {children}
      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-4">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <span className="text-xs text-brand-500/50">Scroll for more</span>
          )}
        </div>
      )}
    </div>
  );
}