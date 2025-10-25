import { cx } from '@/lib/utils/formatting';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const baseStyles = 'whitespace-nowrap inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

  const variantStyles = {
    default: 'border-transparent bg-blue-600 text-white shadow-sm',
    secondary: 'border-transparent bg-gray-200 text-gray-900 shadow-sm',
    destructive: 'border-transparent bg-red-600 text-white shadow-sm',
    outline: 'border-gray-300 bg-white text-gray-900 shadow-sm',
  };

  return (
    <div
      className={cx(baseStyles, variantStyles[variant], className)}
      {...props}
    />
  );
}
