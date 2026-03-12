import { FormItem, FormValue } from "@/services/form";

type Props = {
  item: FormItem;
  value?: FormValue;
  onChange: (val: FormValue) => void;
};

export default function FormItemRenderer({
  item,
  value,
  onChange,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{item.label}</p>

        {item.target_min != null && item.target_max != null && (
          <p className="text-xs text-gray-500">
            Target: {item.target_min} – {item.target_max} {item.unit}
          </p>
        )}
      </div>

      {/* NUMBER */}
      {item.input_type === "number" && (
        <input
          type="number"
          value={value?.value_number ?? ""}
          onChange={(e) =>
            onChange({ value_number: Number(e.target.value) })
          }
          className="w-24 rounded border px-2 py-1"
        />
      )}

      {/* TEXT */}
      {item.input_type === "text" && (
        <input
          type="text"
          value={value?.value_text ?? ""}
          onChange={(e) =>
            onChange({ value_text: e.target.value })
          }
          className="w-48 rounded border px-2 py-1"
        />
      )}

      {/* CHECKBOX */}
      {item.input_type === "checkbox" && (
        <input
          type="checkbox"
          checked={value?.value_bool ?? false}
          onChange={(e) =>
            onChange({ value_bool: e.target.checked })
          }
        />
      )}

      {/* PASS / FAIL */}
      {item.input_type === "pass_fail" && (
        <select
          value={value?.value_text ?? ""}
          onChange={(e) =>
            onChange({ value_text: e.target.value })
          }
          className="rounded border px-2 py-1"
        >
          <option value="">Pilih</option>
          <option value="pass">PASS</option>
          <option value="fail">FAIL</option>
        </select>
      )}
    </div>
  );
}
