interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        {title}
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}