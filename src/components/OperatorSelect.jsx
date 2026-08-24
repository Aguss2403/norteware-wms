// Operator selector (Phase 4): simple list of demo operators, no real auth.
// The chosen operator is recorded on each ingreso/egreso movement (kardex).

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

export const OPERATORS = ['Operario 1', 'Operario 2', 'Jefe de depósito'];

export default function OperatorSelect({ value, onChange }) {
  return (
    <FormControl size="small" sx={{ minWidth: 170 }}>
      <InputLabel id="operator-select-label">Operador</InputLabel>
      <Select
        labelId="operator-select-label"
        id="operator-select"
        value={value}
        label="Operador"
        onChange={(event) => onChange(event.target.value)}
      >
        {OPERATORS.map((operator) => (
          <MenuItem key={operator} value={operator}>
            {operator}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
