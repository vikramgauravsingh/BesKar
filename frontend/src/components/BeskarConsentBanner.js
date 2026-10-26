import React, { useState, useEffect } from 'react';

const BeskarConsentBanner = ({ userId, onConsent }) => {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [selections, setSelections] = useState({});

  const BANNER_ID = '9897ed92-542d-4ec0-b6a3-3a1d20cb1754';
  const API_URL = 'https://portal.beskarit.com/api/dpdpa/public';
  const VERSION = '1.0';

  const purposes = [
    {
      id: '62a4c970-11d5-43ed-8bb9-83f1cd0bbf16',
      name: 'Essential Service Delivery',
      mandatory: true,
      category: 'essential',
      retention_days: 365,
    },
    {
      id: '5b4934ee-0288-46f6-9fda-633d510c6314',
      name: 'Session cookies',
      mandatory: true,
      category: 'essential',
      retention_days: 365,
    },
    {
      id: 'dd8148c9-b59d-4386-b615-b71b7f60ab45',
      name: 'Marketing Communications',
      mandatory: false,
      category: 'marketing',
      retention_days: 365,
    },
  ];

  const openBanner = () => {
    setSelections((prev) => {
      // Preload from last stored selection if available, otherwise mandatory-only
      try {
        const stored = JSON.parse(localStorage.getItem('beskar_consent_' + BANNER_ID) || 'null');
        if (stored && Array.isArray(stored.accepted)) {
          return Object.fromEntries(
            purposes.map((p) => [p.id, p.mandatory || stored.accepted.includes(p.id)])
          );
        }
      } catch (e) {
        /* ignore */
      }
      return Object.fromEntries(purposes.map((p) => [p.id, p.mandatory]));
    });
    setVisible(true);
    fetch(API_URL + '/banner/' + BANNER_ID + '/impression', { method: 'POST' }).catch(() => {});
  };

  useEffect(() => {
    const stored = localStorage.getItem('beskar_consent_' + BANNER_ID);
    let needsBanner = true;
    if (stored) {
      try {
        const prev = JSON.parse(stored);
        if (prev.version === VERSION) needsBanner = false;
      } catch (e) {
        /* ignore parse errors */
      }
    }
    if (needsBanner) {
      setVisible(true);
      setSelections(Object.fromEntries(purposes.map((p) => [p.id, p.mandatory])));
      fetch(API_URL + '/banner/' + BANNER_ID + '/impression', { method: 'POST' }).catch(() => {});
    }

    const handleOpen = () => openBanner();
    window.addEventListener('beskar:open-consent', handleOpen);
    return () => window.removeEventListener('beskar:open-consent', handleOpen);
  }, []);

  const handleConsent = async (accepted, rejected) => {
    const resolvedUserId =
      userId || (typeof window !== 'undefined' ? window.__beskarUserId : null) || null;
    const principal =
      resolvedUserId ||
      localStorage.getItem('beskar_uid') ||
      'anon_' + Math.random().toString(36).substr(2, 12);
    if (!resolvedUserId) localStorage.setItem('beskar_uid', principal);

    let data = {};
    try {
      const resp = await fetch(API_URL + '/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banner_id: BANNER_ID,
          principal_identifier: principal,
          identifier_type: resolvedUserId ? 'user_id' : 'cookie',
          purposes_accepted: accepted,
          purposes_rejected: rejected,
          user_agent: navigator.userAgent,
        }),
      });
      data = await resp.json();
      console.log('Beskar consent recorded:', data.consent_id, 'records:', data.records_created);
    } catch (e) {
      console.warn('Beskar consent submission failed:', e);
    }

    localStorage.setItem(
      'beskar_consent_' + BANNER_ID,
      JSON.stringify({ accepted, rejected, version: VERSION, ts: Date.now() })
    );
    window.dispatchEvent(new Event('beskar:consent-changed'));
    setVisible(false);
    setShowCustomize(false);
    onConsent?.({ accepted, rejected, retention: data.retention_info });
  };

  if (!visible) return null;

  return (
    <>
      <div
        data-testid="beskar-consent-banner"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          background: '#1e3a5f',
          color: '#ffffff',
          padding: '16px 24px',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <strong>We value your privacy</strong>
          <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: '13px' }}>
            We use cookies and process personal data as per DPDPA 2023. We use cookies to enhance
            your browsing experience, serve personalized content, and analyze our traffic. By
            clicking "Accept All", you consent to our use of cookies. Read our{' '}
            <a
              href="/Privacy-Policy"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="consent-privacy-link"
              style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: 600 }}
            >
              Privacy Policy
            </a>
            {' '}and{' '}
            <a
              href="/Terms-Of-Use"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="consent-terms-link"
              style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: 600 }}
            >
              Terms of Use
            </a>
            .
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            data-testid="consent-accept-all"
            onClick={() => handleConsent(purposes.map((p) => p.id), [])}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: '6px',
              background: '#ffffff',
              color: '#1e3a5f',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Accept All
          </button>
          <button
            data-testid="consent-manage"
            onClick={() => setShowCustomize(true)}
            style={{
              padding: '8px 20px',
              border: '1px solid #ffffff',
              borderRadius: '6px',
              background: 'transparent',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            Manage Preference
          </button>
          <button
            data-testid="consent-reject-all"
            onClick={() =>
              handleConsent(
                purposes.filter((p) => p.mandatory).map((p) => p.id),
                purposes.filter((p) => !p.mandatory).map((p) => p.id)
              )
            }
            style={{
              padding: '8px 20px',
              border: '1px solid #ffffff',
              borderRadius: '6px',
              background: 'transparent',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            Reject All
          </button>
        </div>
      </div>

      {showCustomize && (
        <div
          data-testid="consent-customize-modal"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 24,
              maxWidth: 480,
              width: '90%',
              color: '#333',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Manage Cookie Preferences</h3>
            {purposes.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #eee',
                }}
              >
                <div>
                  <strong style={{ fontSize: 13 }}>{p.name}</strong>
                  <br />
                  <small style={{ color: '#888' }}>Retention: {p.retention_days} days</small>
                  {!p.mandatory && (
                    <small style={{ display: 'block', color: '#888' }}>
                      Includes visitor analytics: approximate location, IP, browser, referral source, language and pages viewed
                    </small>
                  )}
                </div>
                <input
                  data-testid={`consent-toggle-${p.id}`}
                  type="checkbox"
                  checked={!!selections[p.id]}
                  disabled={p.mandatory}
                  onChange={(e) =>
                    setSelections((prev) => ({ ...prev, [p.id]: e.target.checked }))
                  }
                  style={{ width: 18, height: 18 }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button
                data-testid="consent-save-preferences"
                onClick={() => {
                  const acc = purposes.filter((p) => selections[p.id]).map((p) => p.id);
                  const rej = purposes.filter((p) => !selections[p.id]).map((p) => p.id);
                  handleConsent(acc, rej);
                }}
                style={{
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: 6,
                  background: '#1e3a5f',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Save Preferences
              </button>
              <button
                data-testid="consent-cancel"
                onClick={() => setShowCustomize(false)}
                style={{
                  padding: '8px 20px',
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BeskarConsentBanner;
