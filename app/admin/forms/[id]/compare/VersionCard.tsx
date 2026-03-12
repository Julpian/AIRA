import type { FormTemplate } from "@/types/form";

type Props = {
  title: string;
  data: FormTemplate;
};

export default function VersionCard({ title, data }: Props) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="mb-4 text-lg font-semibold text-white">
        {title} (v{data.version})
      </h2>

      {data.sections.map((section) => (
        <div key={section.id}>
          <h3 className="font-medium text-slate-200">
            {section.code}. {section.title}
          </h3>

          <ul className="ml-4 mt-2 list-disc text-sm text-slate-400">
            {section.items.map((item) => (
              <li key={item.id}>
                {item.label} — {item.input_type}
                {item.required && " (required)"}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
