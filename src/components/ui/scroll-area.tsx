'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <div
      className={cn(
        'relative overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-border/80',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { ScrollArea }; 