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
//
// Design D1b: the SKU field renders its value in IBM Plex Mono via InputProps;
// the flow error renders as an MUI Alert with the theme's error color.

import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

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
      className="mt-4 flex max-w-[32rem] flex-col gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-card"
      onSubmit={handleSubmit}
    >
      <TextField
        id="qr-code"
        label="Código de SKU"
        placeholder="Ej: SKU-001"
        value={code}
        onChange={(event) => {
          setCode(event.target.value);
          setInvalid(false);
        }}
        InputProps={{ sx: { fontFamily: '"IBM Plex Mono", monospace', fontWeight: 500 } }}
      />
      <div className="flex gap-2 max-sm:flex-wrap">
        <Button type="submit" variant="contained">
          Recibir
        </Button>
        <Button type="button" variant="outlined" onClick={handleDemo}>
          Código demo
        </Button>
      </div>
      {(invalid || error) && (
        <Alert severity="error">{invalid ? 'Ingrese un código de SKU' : error}</Alert>
      )}
    </form>
  );
}
