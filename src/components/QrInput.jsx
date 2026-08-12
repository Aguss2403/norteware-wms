// Simulated QR input for the inbound flow (spec: Simulated QR input).
// Camera scanning is a stretch MAY behind an optional flag and is OUT of
// scope; the text field (plus demo button) is the default input path.
//
// Props:
//   onSubmit(code) — called with the trimmed code when the user submits a
//                    non-empty value or triggers the demo scan.
//   error (string|null) — flow-level error (e.g. unknown SKU) shown inline;
//                         owned by the parent page so the validation and the
//                         receiving flow share a single source of truth.

import { useState } from 'react';

const DEMO_CODE = 'SKU-001'; // seeded sample: Jugo de naranja (unassigned type -> auto-assign)

export default function QrInput({ onSubmit, error = null }) {
  const [code, setCode] = useState('');
  const [invalid, setInvalid] = useState(false);

  function submit(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onSubmit(trimmed);
  }

  function handleSubmit(event) {
    event.preventDefault();
    submit(code);
  }

  function handleDemo() {
    setCode(DEMO_CODE);
    setInvalid(false);
    onSubmit(DEMO_CODE);
  }

  return (
    <form
      className="mt-4 flex max-w-[32rem] flex-col gap-2 rounded-lg border border-border bg-surface px-5 py-4 shadow-card"
      onSubmit={handleSubmit}
    >
      <label htmlFor="qr-code" className="text-sm font-semibold">
        Código de SKU
      </label>
      <div className="flex gap-2 max-sm:flex-wrap">
        <input
          id="qr-code"
          type="text"
          value={code}
          placeholder="Ej: SKU-001"
          className="min-w-0 flex-1 rounded-md border border-[#cbd5e0] bg-white px-[0.6rem] py-2 focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand/45"
          onChange={(event) => {
            setCode(event.target.value);
            setInvalid(false);
          }}
        />
        <button
          type="submit"
          className="cursor-pointer whitespace-nowrap rounded-md border-none bg-brand px-[0.9rem] py-2 font-medium text-white transition-[background-color,transform] hover:-translate-y-px hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
        >
          Recibir
        </button>
        <button
          type="button"
          onClick={handleDemo}
          className="cursor-pointer whitespace-nowrap rounded-md border-none bg-[#52606d] px-[0.9rem] py-2 font-medium text-white transition-[background-color,transform] hover:-translate-y-px hover:bg-[#3f4a55] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
        >
          Código demo
        </button>
      </div>
      {(invalid || error) && (
        <p className="m-0 text-sm text-[#a61b1b]" role="alert">
          {invalid ? 'Ingrese un código de SKU' : error}
        </p>
      )}
    </form>
  );
}
