import { cn } from "@/lib/utils";

export default function AnimatedButton({
  children,
  color = "bg-purple",
  backgroundColor = "bg-purple300",
  className,
  ...props
}: {
  children: React.ReactNode;
  color?: string;
  backgroundColor?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        `rounded-md group outline-offset-4`,
        backgroundColor,
        className
      )}
      {...props}
    >
      <span
        className={cn(
          `-translate-y-1 h-full text-tertiary group-hover:-translate-y-[6px] transition-transform duration-500 group-hover:duration-200 group-active:-translate-y-[2px] group-active:duration-75 rounded-md py-2 px-3 flex items-center justify-center`,
          color,
          className
        )}
      >
        {children}
      </span>
    </button>
  );
}
