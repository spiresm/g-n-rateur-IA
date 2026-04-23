import { memo } from "react";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { QuotaDisplay } from "./QuotaDisplay";

export const Header = memo(function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.photoURL ||
    null;

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Artiste";

  const handleUpgradeClick = () => {
    window.dispatchEvent(new Event("open-upgrade-modal"));
  };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 80,
      background: '#181818',
      borderBottom: '1px solid #2a2a2a',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 50,
    }}>

      {/* LOGO + TITRE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          background: '#0f172a', padding: '6px 12px', borderRadius: 8,
          fontWeight: 800, fontSize: 20, color: '#d4af37', letterSpacing: 3,
          border: '1px solid rgba(212,175,55,0.2)',
        }}>
          RUBENS
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f2f2f2', lineHeight: 1 }}>
            Générateur de Contenu IA
          </h1>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4,
            fontSize: 11, fontWeight: 600,
            background: 'rgba(212,175,55,0.15)', color: '#f4d47c',
            padding: '2px 8px', borderRadius: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4af37', display: 'inline-block' }} />
            Connecté
          </div>
        </div>
      </div>

      {isAuthenticated && user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <QuotaDisplay onUpgradeClick={handleUpgradeClick} />
          <div style={{ width: 1, height: 40, background: '#2a2a2a' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600, textTransform: 'uppercase' }}>Connecté en tant que</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f2f2f2' }}>{userName}</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(212,175,55,0.4)', flexShrink: 0 }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profil" referrerPolicy="no-referrer"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} color="#aaa" />
                </div>
              )}
            </div>
            <button
              type="button"
              title="Se déconnecter"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof logout === 'function') {
                  logout();
                } else {
                  localStorage.clear();
                  window.location.href = '/';
                }
              }}
              style={{
                background: '#222', border: '1px solid #2a2a2a', borderRadius: 8,
                color: '#aaa', padding: '8px 12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', zIndex: 100,
                pointerEvents: 'all',
                flexShrink: 0,
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
});
