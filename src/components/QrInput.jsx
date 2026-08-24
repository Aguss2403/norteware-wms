// Simulated QR input for the inbound flow (spec: Simulated QR input).
// Camera scanning is a stretch MAY behind an optional flag and is OUT of
// scope; the text field + quantity + demo codes is the default input path.
//
// Props:
//   onSubmit(code, qty) — called with the trimmed code and the received
//                        quantity when the user submits or taps a demo code.
//   error (string|null) — flow-level error (e.g. unknown SKU) shown inline.
//
// Demo codes: every seeded SKU is one tap away (they cover all 5 product
// types), so the presenter can exercise auto-assign and assigned-route flows.

import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { skus } from '../data/skus.js';

const DEMO_SKUS = skus;

export default function QrInput({ onSubmit, error = null }) {
  const [code, setCode] = useState('');
  const [qty, setQty] = useState('1');
  const [invalid, setInvalid] = useState(false);

  function parsedQty() {
    const n = Number.parseInt(qty, 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }

  function submit(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onSubmit(trimmed, parsedQty());
  }

  function handleSubmit(event) {
    event.preventDefault();
    submit(code);
  }

  function handleDemo(skuId) {
    setCode(skuId);
    setInvalid(false);
    onSubmit(skuId, parsedQty());
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
      <div className="flex items-end gap-2 max-sm:flex-wrap">
        <TextField
          id="qr-qty"
          label="Cantidad"
          type="number"
          size="small"
          value={qty}
          onChange={(event) => setQty(event.target.value)}
          InputProps={{
            inputProps: { min: 1, style: { fontFamily: '"IBM Plex Mono", monospace' } },
            sx: { maxWidth: '6.5rem' },
          }}
        />
        <Button type="submit" variant="contained" sx={{ mb: 0.25 }}>
          Recibir
        </Button>
      </div>

      <div className="border-t border-border pt-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          Códigos demo
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DEMO_SKUS.map((sku) => (
            <button
              key={sku.skuId}
              type="button"
              title={sku.name}
              onClick={() => handleDemo(sku.skuId)}
              className="rounded-md border border-border bg-surface px-2 py-1 font-mono-ui text-[11px] font-medium text-text-muted transition-colors hover:border-brand/50 hover:text-text"
            >
              {sku.skuId}
            </button>
          ))}
        </div>
      </div>

      {(invalid || error) && (
        <Alert severity="error">{invalid ? 'Ingrese un código de SKU' : error}</Alert>
      )}
    </form>
  );
}
