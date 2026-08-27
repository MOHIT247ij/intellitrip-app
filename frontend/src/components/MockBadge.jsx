import { FlaskConical } from 'lucide-react';

/** Required by the spec everywhere mock/demo data is shown — never presented as real. */
export default function MockBadge({ label = 'Development / Mock Data' }) {
  return (
    <span className="badge-mock" title="This data is simulated for demo purposes and is not a real live booking.">
      <FlaskConical size={12} />
      {label}
    </span>
  );
}
