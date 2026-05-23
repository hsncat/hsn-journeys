import type { CostObject } from '@/server/db';
import { formatMoney, parseMoney, totalCost } from '@/lib/itinerary';
import { useEffect, useState } from 'react';

const COST_KEYS = ['package', 'transport', 'accommodation', 'food', 'shopping', 'ticket'] as const;

const COST_LABELS: Record<keyof CostObject, string> = {
  package: '报团费',
  transport: '交通费',
  accommodation: '住宿费',
  food: '餐饮费',
  shopping: '购物费',
  ticket: '门票费',
};

interface Props {
  value: CostObject;
  onChange?: (value: CostObject) => void;
  readOnly?: boolean;
}

export default function CostFields({ value, onChange, readOnly = false }: Props) {
  const setCost = (key: keyof CostObject, raw: string) => {
    if (!onChange || readOnly) return;
    onChange({ ...value, [key]: parseMoney(raw) });
  };

  return (
    <>
      <div className="cost-grid">
        {COST_KEYS.map(key => (
          <CurrencyField
            key={key}
            label={COST_LABELS[key]}
            value={value[key]}
            readOnly={readOnly}
            onChange={raw => setCost(key, raw)}
          />
        ))}
      </div>
      <div className="cost-total">
        合计 <strong>¥{formatMoney(totalCost(value))}</strong>
      </div>
    </>
  );
}

function CurrencyField({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: number;
  onChange: (raw: string) => void;
  readOnly: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!focused) setDraft(formatMoney(value));
  }, [focused, value]);

  return (
    <div className="field">
      <label>{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={focused ? draft : formatMoney(value)}
        readOnly={readOnly}
        onFocus={() => {
          if (readOnly) return;
          setFocused(true);
          setDraft(value ? String(value) : '');
        }}
        onChange={e => {
          setDraft(e.target.value);
          onChange(e.target.value);
        }}
        onBlur={() => {
          setFocused(false);
          setDraft(formatMoney(value));
        }}
      />
    </div>
  );
}
