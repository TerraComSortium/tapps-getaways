import { useState } from 'react';
import { getStatus } from '../services/authentication/status';
import { getAllGetaways, getGetawayById, getGetawaysByOwner, getSubscribedGetaways } from '../services/getaways/getaways';
import { getCoupons } from '../services/coupons/coupons';
import { getClubData } from '../services/club/club';
import { searchNearby, searchFilter, searchAutocomplete } from '../services/search/search';
import { verifyEmail } from '../services/email/email';

type EndpointState = {
  data: unknown;
  loading: boolean;
  error: string | null;
};

const initState = (): EndpointState => ({ data: null, loading: false, error: null });

const useEndpoint = () => {
  const [state, setState] = useState<EndpointState>(initState());

  const call = async (fn: () => Promise<unknown>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await fn();
      setState({ data, loading: false, error: null });
    } catch (err: unknown) {
      setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Error desconocido' });
    }
  };

  return { state, call };
};

const Btn = ({
  label, loading, onClick, color = '#1976d2',
}: {
  label: string; loading: boolean; onClick: () => void; color?: string;
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    style={{
      padding: '8px 18px',
      fontSize: '14px',
      cursor: loading ? 'not-allowed' : 'pointer',
      backgroundColor: color,
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
    }}
  >
    {loading ? 'Cargando...' : label}
  </button>
);

const Result = ({ label, state }: { label: string; state: EndpointState }) => (
  <>
    {state.error && (
      <p style={{ color: '#d32f2f', marginBottom: '8px' }}>{label} Error: {state.error}</p>
    )}
    {state.data !== null && (
      <>
        <h4 style={{ margin: '12px 0 4px' }}>{label}</h4>
        <pre style={preStyle}>{JSON.stringify(state.data, null, 2)}</pre>
      </>
    )}
  </>
);

const inp = (style?: React.CSSProperties): React.CSSProperties => ({
  padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc',
  fontSize: '14px', width: '180px', ...style,
});

export default function TestApi() {
  const me = useEndpoint();
  const allGetaways = useEndpoint();
  const getawayById = useEndpoint();
  const ownerGetaways = useEndpoint();
  const subscribedGetaways = useEndpoint();
  const coupons = useEndpoint();
  const clubData = useEndpoint();
  const nearby = useEndpoint();
  const filter = useEndpoint();
  const autocomplete = useEndpoint();
  const emailVerify = useEndpoint();

  const [getawayId, setGetawayId] = useState('');
  const [nearbyLat, setNearbyLat] = useState('');
  const [nearbyLng, setNearbyLng] = useState('');
  const [filterSport, setFilterSport] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [autocompleteQ, setAutocompleteQ] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div style={{ padding: '24px', fontFamily: 'monospace', maxWidth: '900px' }}>
      <h1>Test API</h1>

      {/* ── Authentication ─────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Authentication</h2>
        <div style={rowStyle}>
          <Btn label="GET /me" loading={me.state.loading} onClick={() => me.call(getStatus)} color="#1976d2" />
        </div>
        <Result label="GET /me" state={me.state} />
      </section>

      {/* ── Getaways ────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Getaways</h2>

        <div style={rowStyle}>
          <Btn label="GET /getaways" loading={allGetaways.state.loading} onClick={() => allGetaways.call(getAllGetaways)} color="#7b1fa2" />
          <Btn label="GET /getaways/owner/me" loading={ownerGetaways.state.loading} onClick={() => ownerGetaways.call(getGetawaysByOwner)} color="#7b1fa2" />
          <Btn label="GET /getaways/subscribed" loading={subscribedGetaways.state.loading} onClick={() => subscribedGetaways.call(getSubscribedGetaways)} color="#7b1fa2" />
        </div>

        <div style={{ ...rowStyle, marginTop: '12px' }}>
          <input style={inp()} placeholder="ID del getaway" value={getawayId} onChange={e => setGetawayId(e.target.value)} />
          <Btn label={`GET /getaways/:id`} loading={getawayById.state.loading} onClick={() => getawayById.call(() => getGetawayById(getawayId))} color="#5e35b1" />
        </div>

        <Result label="GET /getaways" state={allGetaways.state} />
        <Result label="GET /getaways/owner/me" state={ownerGetaways.state} />
        <Result label="GET /getaways/subscribed" state={subscribedGetaways.state} />
        <Result label={`GET /getaways/${getawayId}`} state={getawayById.state} />
      </section>

      {/* ── Search ──────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Search</h2>

        <div style={rowStyle}>
          <input style={inp()} placeholder="lat" value={nearbyLat} onChange={e => setNearbyLat(e.target.value)} />
          <input style={inp()} placeholder="lng" value={nearbyLng} onChange={e => setNearbyLng(e.target.value)} />
          <Btn label="GET /search/nearby" loading={nearby.state.loading} onClick={() => nearby.call(() => searchNearby({ lat: nearbyLat, lng: nearbyLng }))} color="#00695c" />
        </div>

        <div style={{ ...rowStyle, marginTop: '12px' }}>
          <input style={inp()} placeholder="sport" value={filterSport} onChange={e => setFilterSport(e.target.value)} />
          <input style={inp({ width: '130px' })} type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} />
          <input style={inp({ width: '130px' })} type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} />
          <Btn label="GET /search/filter" loading={filter.state.loading} onClick={() => filter.call(() => searchFilter({ sport: filterSport, startDate: filterStart, endDate: filterEnd }))} color="#00695c" />
        </div>

        <div style={{ ...rowStyle, marginTop: '12px' }}>
          <input style={inp()} placeholder="término de búsqueda" value={autocompleteQ} onChange={e => setAutocompleteQ(e.target.value)} />
          <Btn label="GET /search/autocomplete" loading={autocomplete.state.loading} onClick={() => autocomplete.call(() => searchAutocomplete(autocompleteQ))} color="#00695c" />
        </div>

        <Result label="GET /search/nearby" state={nearby.state} />
        <Result label="GET /search/filter" state={filter.state} />
        <Result label="GET /search/autocomplete" state={autocomplete.state} />
      </section>

      {/* ── Coupons ─────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Coupons</h2>
        <div style={rowStyle}>
          <Btn label="GET /coupons" loading={coupons.state.loading} onClick={() => coupons.call(getCoupons)} color="#e65100" />
        </div>
        <Result label="GET /coupons" state={coupons.state} />
      </section>

      {/* ── Club ────────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Club</h2>
        <div style={rowStyle}>
          <Btn label="GET /club/data" loading={clubData.state.loading} onClick={() => clubData.call(getClubData)} color="#37474f" />
        </div>
        <Result label="GET /club/data" state={clubData.state} />
      </section>

      {/* ── Email ───────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Email</h2>
        <div style={rowStyle}>
          <input style={inp({ width: '240px' })} type="email" placeholder="email@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
          <Btn label="GET /verify-email" loading={emailVerify.state.loading} onClick={() => emailVerify.call(() => verifyEmail(email))} color="#c62828" />
        </div>
        <Result label="GET /verify-email" state={emailVerify.state} />
      </section>
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  borderTop: '2px solid #e0e0e0',
  paddingTop: '20px',
  marginTop: '20px',
};

const h2Style: React.CSSProperties = {
  fontSize: '16px',
  marginBottom: '12px',
  color: '#333',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const preStyle: React.CSSProperties = {
  background: '#f5f5f5',
  border: '1px solid #ddd',
  borderRadius: '6px',
  padding: '16px',
  overflowX: 'auto',
  maxHeight: '400px',
  overflowY: 'auto',
  marginBottom: '12px',
  fontSize: '12px',
};
