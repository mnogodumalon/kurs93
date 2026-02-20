import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, DoorOpen, ClipboardList, TrendingUp, Euro, CheckCircle, AlertCircle } from 'lucide-react';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Kurse, Anmeldungen } from '@/types/app';

interface Stats {
  kurse: number;
  aktiveKurse: number;
  teilnehmer: number;
  dozenten: number;
  raeume: number;
  anmeldungen: number;
  bezahlt: number;
  offen: number;
  umsatz: number;
}

const statusLabel: Record<string, string> = {
  geplant: 'Geplant',
  aktiv: 'Aktiv',
  abgeschlossen: 'Abgeschlossen',
  abgesagt: 'Abgesagt',
};

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    kurse: 0, aktiveKurse: 0, teilnehmer: 0, dozenten: 0,
    raeume: 0, anmeldungen: 0, bezahlt: 0, offen: 0, umsatz: 0,
  });
  const [recentKurse, setRecentKurse] = useState<Kurse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      LivingAppsService.getKurse(),
      LivingAppsService.getTeilnehmer(),
      LivingAppsService.getDozenten(),
      LivingAppsService.getRaeume(),
      LivingAppsService.getAnmeldungen(),
    ]).then(([kurse, teilnehmer, dozenten, raeume, anmeldungen]) => {
      const aktiveKurse = kurse.filter((k: Kurse) => k.fields.status === 'aktiv').length;
      const bezahlt = anmeldungen.filter((a: Anmeldungen) => a.fields.bezahlt === true).length;
      const offen = anmeldungen.length - bezahlt;
      const kurseWithPrice = kurse.filter((k: Kurse) => k.fields.preis && k.fields.preis > 0);
      const avgPrice = kurseWithPrice.length > 0
        ? kurseWithPrice.reduce((sum: number, k: Kurse) => sum + (k.fields.preis || 0), 0) / kurseWithPrice.length
        : 0;
      const umsatz = bezahlt * avgPrice;
      setStats({
        kurse: kurse.length, aktiveKurse,
        teilnehmer: teilnehmer.length,
        dozenten: dozenten.length,
        raeume: raeume.length,
        anmeldungen: anmeldungen.length,
        bezahlt, offen, umsatz,
      });
      setRecentKurse(kurse.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Hero Header */}
      <div className="gradient-hero rounded-2xl p-8 text-white shadow-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative">
          <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-2">Kursverwaltungssystem</p>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-1">Übersicht</h1>
          <p className="text-white/70 text-base mt-2">
            {loading ? '...' : `${stats.aktiveKurse} aktive Kurse · ${stats.anmeldungen} Anmeldungen gesamt`}
          </p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-4">
          <div className="text-right">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Gesamtanmeldungen</p>
            <p className="stat-number text-5xl text-white">{loading ? '—' : stats.anmeldungen}</p>
          </div>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/kurse" className="group bg-card rounded-xl p-5 shadow-card border border-border hover:border-primary/30 transition-smooth hover:shadow-hero">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-lg" style={{ background: 'oklch(0.38 0.16 264 / 0.1)' }}>
              <BookOpen className="w-5 h-5" style={{ color: 'oklch(0.38 0.16 264)' }} />
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full badge-aktiv">
              {loading ? '—' : stats.aktiveKurse} aktiv
            </span>
          </div>
          <p className="stat-number text-3xl text-foreground mb-1">{loading ? '—' : stats.kurse}</p>
          <p className="text-sm text-muted-foreground font-medium">Kurse gesamt</p>
        </Link>

        <Link to="/teilnehmer" className="group bg-card rounded-xl p-5 shadow-card border border-border hover:border-primary/30 transition-smooth hover:shadow-hero">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-lg" style={{ background: 'oklch(0.55 0.16 160 / 0.12)' }}>
              <Users className="w-5 h-5" style={{ color: 'oklch(0.35 0.14 160)' }} />
            </div>
          </div>
          <p className="stat-number text-3xl text-foreground mb-1">{loading ? '—' : stats.teilnehmer}</p>
          <p className="text-sm text-muted-foreground font-medium">Teilnehmer</p>
        </Link>

        <Link to="/dozenten" className="group bg-card rounded-xl p-5 shadow-card border border-border hover:border-primary/30 transition-smooth hover:shadow-hero">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-lg" style={{ background: 'oklch(0.72 0.14 75 / 0.15)' }}>
              <GraduationCap className="w-5 h-5" style={{ color: 'oklch(0.48 0.14 60)' }} />
            </div>
          </div>
          <p className="stat-number text-3xl text-foreground mb-1">{loading ? '—' : stats.dozenten}</p>
          <p className="text-sm text-muted-foreground font-medium">Dozenten</p>
        </Link>

        <Link to="/raeume" className="group bg-card rounded-xl p-5 shadow-card border border-border hover:border-primary/30 transition-smooth hover:shadow-hero">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-lg" style={{ background: 'oklch(0.62 0.12 220 / 0.12)' }}>
              <DoorOpen className="w-5 h-5" style={{ color: 'oklch(0.42 0.12 220)' }} />
            </div>
          </div>
          <p className="stat-number text-3xl text-foreground mb-1">{loading ? '—' : stats.raeume}</p>
          <p className="text-sm text-muted-foreground font-medium">Räume</p>
        </Link>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-card border border-border">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-foreground text-base">Anmeldungen</h2>
              <p className="text-sm text-muted-foreground">Bezahlstatus</p>
            </div>
            <Link to="/anmeldungen" className="text-xs font-medium px-3 py-1.5 rounded-lg transition-smooth" style={{ background: 'oklch(0.38 0.16 264 / 0.08)', color: 'oklch(0.38 0.16 264)' }}>
              Alle anzeigen →
            </Link>
          </div>
          <div className="mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Bezahlt</span>
              <span className="font-semibold stat-number" style={{ color: 'oklch(0.35 0.14 160)' }}>
                {loading ? '—' : `${stats.anmeldungen > 0 ? Math.round((stats.bezahlt / stats.anmeldungen) * 100) : 0}%`}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-smooth"
                style={{
                  width: stats.anmeldungen > 0 ? `${(stats.bezahlt / stats.anmeldungen) * 100}%` : '0%',
                  background: 'oklch(0.55 0.16 160)',
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <ClipboardList className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="stat-number text-2xl text-foreground">{loading ? '—' : stats.anmeldungen}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Gesamt</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-4 h-4 mx-auto mb-1" style={{ color: 'oklch(0.35 0.14 160)' }} />
              <p className="stat-number text-2xl" style={{ color: 'oklch(0.35 0.14 160)' }}>{loading ? '—' : stats.bezahlt}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Bezahlt</p>
            </div>
            <div className="text-center">
              <AlertCircle className="w-4 h-4 mx-auto mb-1" style={{ color: 'oklch(0.45 0.22 27)' }} />
              <p className="stat-number text-2xl" style={{ color: 'oklch(0.45 0.22 27)' }}>{loading ? '—' : stats.offen}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Offen</p>
            </div>
          </div>
        </div>

        <div className="gradient-amber rounded-xl p-6 shadow-card">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-lg bg-white/30">
              <Euro className="w-5 h-5 text-white" />
            </div>
            <TrendingUp className="w-4 h-4 text-white/60" />
          </div>
          <p className="stat-number text-4xl font-bold mb-1" style={{ color: 'oklch(0.25 0.08 60)' }}>
            {loading ? '—' : stats.umsatz > 0 ? `${Math.round(stats.umsatz).toLocaleString('de-DE')} €` : '—'}
          </p>
          <p className="text-sm font-medium mb-1" style={{ color: 'oklch(0.35 0.1 60)' }}>Geschätzter Umsatz</p>
          <p className="text-xs" style={{ color: 'oklch(0.45 0.1 60)' }}>Ø Preis × bezahlte Anmeldungen</p>
        </div>
      </div>

      {/* Recent Kurse */}
      <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Aktuelle Kurse</h2>
          <Link to="/kurse" className="text-xs font-medium transition-smooth" style={{ color: 'oklch(0.38 0.16 264)' }}>
            Alle Kurse →
          </Link>
        </div>
        {loading ? (
          <div className="px-6 py-8 text-center text-muted-foreground text-sm">Wird geladen...</div>
        ) : recentKurse.length === 0 ? (
          <div className="px-6 py-8 text-center text-muted-foreground text-sm">
            Noch keine Kurse vorhanden.{' '}
            <Link to="/kurse" className="font-medium" style={{ color: 'oklch(0.38 0.16 264)' }}>Kurs erstellen →</Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentKurse.map((kurs) => (
              <div key={kurs.record_id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-smooth">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg flex-shrink-0" style={{ background: 'oklch(0.38 0.16 264 / 0.08)' }}>
                    <BookOpen className="w-4 h-4" style={{ color: 'oklch(0.38 0.16 264)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{kurs.fields.titel || '—'}</p>
                    <p className="text-xs text-muted-foreground">
                      {kurs.fields.startdatum ? new Date(kurs.fields.startdatum).toLocaleDateString('de-DE') : '—'}
                      {kurs.fields.enddatum ? ` – ${new Date(kurs.fields.enddatum).toLocaleDateString('de-DE')}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {kurs.fields.preis != null && (
                    <span className="text-sm stat-number text-muted-foreground hidden sm:block">
                      {kurs.fields.preis.toLocaleString('de-DE')} €
                    </span>
                  )}
                  {kurs.fields.status && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full badge-${kurs.fields.status}`}>
                      {statusLabel[kurs.fields.status] || kurs.fields.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Schnellzugriff</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { to: '/kurse', icon: BookOpen, label: 'Kurs anlegen', color: 'oklch(0.38 0.16 264)', bg: 'oklch(0.38 0.16 264 / 0.1)' },
            { to: '/dozenten', icon: GraduationCap, label: 'Dozent anlegen', color: 'oklch(0.48 0.14 60)', bg: 'oklch(0.72 0.14 75 / 0.15)' },
            { to: '/teilnehmer', icon: Users, label: 'Teilnehmer anlegen', color: 'oklch(0.35 0.14 160)', bg: 'oklch(0.55 0.16 160 / 0.12)' },
            { to: '/raeume', icon: DoorOpen, label: 'Raum anlegen', color: 'oklch(0.42 0.12 220)', bg: 'oklch(0.62 0.12 220 / 0.12)' },
            { to: '/anmeldungen', icon: ClipboardList, label: 'Anmeldung erfassen', color: 'oklch(0.45 0.22 27)', bg: 'oklch(0.577 0.245 27 / 0.1)' },
          ].map(({ to, icon: Icon, label, color, bg }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-border shadow-card hover:border-primary/30 transition-smooth text-center group"
            >
              <div className="p-2.5 rounded-lg transition-smooth group-hover:scale-110" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="text-xs font-medium text-foreground leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
