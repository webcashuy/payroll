export function toast(args: {
  title: string;
  description?: string;
  variant?: 'destructive' | 'default';
}) {
  const prefix = args.variant === 'destructive' ? '❌' : '✅';
  console.log(`${prefix} ${args.title} - ${args.description ?? ''}`);
}
