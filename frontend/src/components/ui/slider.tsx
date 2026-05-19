"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "./utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min]),
    [value, defaultValue, min]
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 h-4 group",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-secondary relative grow rounded-full h-[3px] w-full"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="bg-primary absolute h-full rounded-full transition-colors"
        />
      </SliderPrimitive.Track>
      
      {_values.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          data-slot="slider-thumb"
          className={cn(
            "block !size-3 shrink-0 rounded-full transition-all shadow-md",
            "bg-background border-[1.5px] border-primary",
            "focus:outline-none focus:ring-0 focus-visible:ring-0 focus:ring-offset-0", 
            "hover:scale-110 active:scale-100 cursor-grab active:cursor-grabbing",
            "data-[disabled]:opacity-0 data-[disabled]:scale-0",
            "absolute"
          )}
          style={{ 
            transform: 'translate(-50%, -50%)',
            top: '50%',
            left: `${(((_values[index] - min) / (max - min)) * 100)}%`,
            outline: 'none',
          }}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };