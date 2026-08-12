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
    <form className="qr-form" onSubmit={handleSubmit}>
      <label htmlFor="qr-code">Código de SKU</label>
      <div className="qr-form-row">
        <input
          id="qr-code"
          type="text"
          value={code}
          placeholder="Ej: SKU-001"
          onChange={(event) => {
            setCode(event.target.value);
            setInvalid(false);
          }}
        />
        <button type="submit">Recibir</button>
        <button type="button" onClick={handleDemo}>
          Código demo
        </button>
      </div>
      {(invalid || error) && (
        <p className="qr-error" role="alert">
          {invalid ? 'Ingrese un código de SKU' : error}
        </p>
      )}
    </form>
  );
}
