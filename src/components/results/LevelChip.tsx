import { Chip, ChipProps } from '@mui/material';
import type { LevelId } from '@/lib/types';

/**
 * The five official maturity levels are ordinal, so the palette has to read as
 * a ladder rather than five arbitrary colours. `beginning` and `inadequate`
 * share a hue and separate on fill.
 */
const STYLES: Record<LevelId, { color: ChipProps['color']; variant: ChipProps['variant'] }> = {
  outstanding: { color: 'success', variant: 'filled' },
  mature: { color: 'info', variant: 'filled' },
  developing: { color: 'warning', variant: 'filled' },
  beginning: { color: 'error', variant: 'outlined' },
  inadequate: { color: 'error', variant: 'filled' },
};

interface Props {
  level: LevelId;
  label: string;
  size?: ChipProps['size'];
}

export default function LevelChip({ level, label, size = 'small' }: Props) {
  const style = STYLES[level] ?? { color: 'default', variant: 'outlined' };
  return <Chip label={label} size={size} color={style.color} variant={style.variant} />;
}
