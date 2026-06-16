#!/usr/bin/env python3
"""
Scan LinkedIn automatique — 22h chaque soir.
Utilise AppleScript pour exécuter le scan directement dans Chrome ouvert.
Chrome doit être ouvert et connecté à LinkedIn.
"""
import json, re, subprocess, sys, time
from datetime import datetime, timezone, timedelta
from pathlib import Path

BASE_DIR = Path('/Users/pjparois/Downloads/saas-pre-suasion')
DATA_JSX = BASE_DIR / 'app/data.jsx'
MAILBOX = 'urn:li:fsd_profile:ACoAAC1lTIUBWht4g0IUxnXvx_Q1L3VFxp2csWk'

now_utc   = datetime.now(timezone.utc)
today     = now_utc.strftime('%Y-%m-%d')
yesterday = (now_utc - timedelta(days=1)).strftime('%Y-%m-%d')

LAST_SCAN_FILE = Path('/tmp/linkedin_last_scan.txt')

# Vérifie si le scan a déjà été fait aujourd'hui
if LAST_SCAN_FILE.exists() and LAST_SCAN_FILE.read_text().strip() == today:
    print(f"Scan déjà fait aujourd'hui ({today}). Rien à faire.")
    sys.exit(0)

print(f"\n{'='*60}")
print(f"SCAN LINKEDIN AUTO — {today}")
print('='*60)

JS_SCAN = r"""
window.__liScan = null;
(async () => {
  const csrf = document.cookie.match(/JSESSIONID="?([^";]+)"?/)?.[1] || '';
  const h = { 'accept': 'application/json', 'csrf-token': csrf, 'x-restli-protocol-version': '2.0.0' };
  const hn = { 'accept': 'application/vnd.linkedin.normalized+json+2.1', 'csrf-token': csrf, 'x-restli-protocol-version': '2.0.0' };
  const tsDate = ms => ms ? new Date(ms).toISOString().slice(0,10) : null;
  const today = new Date().toISOString().slice(0,10);
  const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);

  // 1. Connexions acceptées
  const connR = await fetch('/voyager/api/relationships/connections?start=0&count=40&sortType=RECENTLY_ADDED', {headers:h}).then(r=>r.json());
  const connToday = [], connYest = [];
  for (const e of connR?.elements || []) {
    const d = tsDate(e.createdAt);
    const mp = e.miniProfile || {};
    const entry = { name: (mp.firstName||'')+' '+(mp.lastName||''), poste: mp.occupation||'' };
    if (d === today) connToday.push(entry);
    else if (d === yesterday) connYest.push(entry);
  }

  // 2. Connexions envoyées
  let invToday = 0;
  try {
    const invR = await fetch('/voyager/api/relationships/sentInvitationViewsV2?start=0&count=40&invitationType=CONNECTION', {headers:h}).then(r=>r.json());
    invToday = (invR?.elements||[]).filter(e => tsDate(e.sentTime) === today).length;
  } catch(e) { invToday = 0; }

  // 3. Conversations
  const MAILBOX = 'MAILBOX_URN';
  const enc = encodeURIComponent(MAILBOX);
  const msgUrl = `/voyager/api/voyagerMessagingGraphQL/graphql?queryId=messengerConversations.0d5e6781bbee71c3e51c8843c6519f48&variables=(mailboxUrn:${enc})`;
  const msgR = await fetch(msgUrl, {headers:hn}).then(r=>r.json());
  const included = msgR?.included || [];
  const convs = included.filter(x => x.$type === 'com.linkedin.messenger.Conversation');
  const parts = included.filter(x => x.$type === 'com.linkedin.messenger.MessagingParticipant');
  const partMap = {};
  for (const p of parts) {
    if (p.entityUrn) {
      const fn = p.participantType?.member?.firstName?.text || '';
      const ln = p.participantType?.member?.lastName?.text || '';
      partMap[p.entityUrn] = { name: (fn+' '+ln).trim(), isMe: p.hostIdentityUrn === MAILBOX };
    }
  }
  const unreadConvs = [], activeToday = [];
  for (const c of convs) {
    const d = tsDate(c.lastActivityAt);
    const names = (c['*conversationParticipants']||[]).map(u => partMap[u]).filter(p=>p&&!p.isMe).map(p=>p.name);
    const name = names.join(', ') || '?';
    if ((c.unreadCount||0) > 0) unreadConvs.push({ name, unread: c.unreadCount, time: new Date(c.lastActivityAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) });
    if (d === today) activeToday.push(name);
  }

  window.__liScan = JSON.stringify({ connToday, connYest, invToday, unreadConvs, activeToday });
})();
'started'
""".replace('MAILBOX_URN', MAILBOX)

JS_READ = "window.__liScan || ''"

def find_linkedin_tab():
    """Trouve l'index du tab LinkedIn dans Chrome via AppleScript."""
    script = '''
tell application "Google Chrome"
    set winIdx to 0
    set tabIdx to 0
    repeat with w from 1 to count of windows
        repeat with t from 1 to count of tabs of window w
            if URL of tab t of window w contains "linkedin.com" then
                set winIdx to w
                set tabIdx to t
            end if
        end repeat
    end repeat
    return (winIdx as string) & "," & (tabIdx as string)
end tell
'''
    r = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
    parts = r.stdout.strip().split(',')
    if len(parts) == 2 and parts[0] != '0':
        return int(parts[0]), int(parts[1])
    return None, None

def run_js_in_chrome(win, tab, js):
    """Exécute du JavaScript dans un tab Chrome via AppleScript."""
    safe_js = js.replace('\\', '\\\\').replace('"', '\\"')
    script = f'''
tell application "Google Chrome"
    set result to execute tab {tab} of window {win} javascript "{safe_js}"
    return result
end tell
'''
    r = subprocess.run(['osascript', '-e', script], capture_output=True, text=True, timeout=60)
    return r.stdout.strip(), r.stderr.strip()

def run_scan():
    print("\n[1/3] Recherche de LinkedIn dans Chrome...")

    # Vérifie si Chrome est ouvert
    r = subprocess.run(['pgrep', '-x', 'Google Chrome'], capture_output=True, text=True)
    if r.returncode != 0:
        print("  ❌ Chrome n'est pas ouvert. Lance Chrome et connecte-toi à LinkedIn.")
        sys.exit(1)

    win, tab = find_linkedin_tab()
    if not win:
        # Ouvre LinkedIn dans un nouvel onglet
        print("  → Ouverture de LinkedIn...")
        subprocess.run(['osascript', '-e', 'tell application "Google Chrome" to open location "https://www.linkedin.com/feed/"'])
        time.sleep(5)
        win, tab = find_linkedin_tab()

    if not win:
        print("  ❌ Impossible d'ouvrir LinkedIn dans Chrome.")
        sys.exit(1)

    print(f"  ✓ LinkedIn trouvé (fenêtre {win}, onglet {tab})")

    # Vérifie la connexion
    url_out, _ = run_js_in_chrome(win, tab, 'location.href')
    if 'login' in url_out or 'connexion' in url_out.lower():
        print("  ❌ Non connecté à LinkedIn. Connecte-toi d'abord dans Chrome.")
        sys.exit(1)

    print("\n[2/3] Scan des données LinkedIn...")
    # Lance le scan async (stocke le résultat dans window.__liScan)
    run_js_in_chrome(win, tab, JS_SCAN)

    # Attend que le résultat soit prêt (max 30s)
    result_str = ''
    for _ in range(15):
        time.sleep(2)
        result_str, _ = run_js_in_chrome(win, tab, JS_READ)
        if result_str and result_str != 'missing value' and result_str != '':
            break

    if not result_str or result_str == 'missing value':
        print("  ❌ Timeout : LinkedIn n'a pas répondu.")
        sys.exit(1)

    try:
        return json.loads(result_str)
    except json.JSONDecodeError:
        print(f"  ❌ Résultat invalide : {result_str[:200]}")
        sys.exit(1)

data = run_scan()

conn_today   = data.get('connToday', [])
conn_yest    = data.get('connYest', [])
inv_today    = data.get('invToday', 0)
unread_convs = data.get('unreadConvs', [])
active_today = data.get('activeToday', [])

print(f"\n  ✅ Connexions acceptées aujourd'hui : {len(conn_today)}")
for c in conn_today: print(f"    + {c['name']}")
print(f"  ✅ Invitations envoyées aujourd'hui : {inv_today}")
print(f"  ✅ Non lus : {len(unread_convs)}")
for u in unread_convs: print(f"    • {u['name']} (x{u['unread']}) à {u['time']}")
print(f"  ✅ Conversations actives : {len(active_today)}")

# ─── MISE À JOUR data.jsx ─────────────────────────────────────────
print("\n[3/3] Mise à jour data.jsx + push...")
code = DATA_JSX.read_text()

new_today_block = (
    f"// Scan auto {today} 22h00 — AppleScript + Voyager API\n"
    f"const TODAY = {{ newDM: 0, fu: {len(active_today)}, looms: 0, reponses: {len(unread_convs)}, "
    f"propCall: 0, bookes: 0, closes: 0, connEnv: {inv_today}, connAcc: {len(conn_today)} }};"
)
code = re.sub(
    r'(//[^\n]*\n)*const TODAY = \{[^\}]+\};(\n//[^\n]*)*',
    new_today_block,
    code
)

try:
    import locale
    locale.setlocale(locale.LC_TIME, 'fr_FR.UTF-8')
except: pass
day_fr = datetime.now().strftime('%A %-d %B').capitalize()
code = re.sub(r'dateLabel: "[^"]*"', f'dateLabel: "{day_fr}"', code)

conn_names   = ', '.join(c['name'].strip() for c in conn_today[:4]) or 'aucune'
unread_names = ', '.join('{} (x{})'.format(u['name'], u['unread']) for u in unread_convs[:4]) or 'aucun'
new_signals = (
    '  signals: [\n'
    '    { tag: "iClosed réel", tone: "good", text: "21 calls bookés depuis le 16/05 · 8 potentiels sans booking." },\n'
    f'    {{ tag: "Non lus ({today})", tone: "warn", text: "{len(unread_convs)} non lus : {unread_names}." }},\n'
    f'    {{ tag: "Réseau ({today})", tone: "neutral", text: "Acceptées : {len(conn_today)} ({conn_names}) · Envoyées : {inv_today}." }},\n'
    '  ],'
)
code = re.sub(r'  signals: \[[\s\S]*?\],', new_signals, code)

DATA_JSX.write_text(code)

try:
    subprocess.run(['git', 'add', 'app/data.jsx'], cwd=BASE_DIR, check=True)
    msg = f"data: scan auto {today} 22h — {len(conn_today)} connexions, {len(unread_convs)} non lus"
    subprocess.run(['git', 'commit', '-m', msg], cwd=BASE_DIR, check=True)
    subprocess.run(['git', 'push', 'origin', 'main'], cwd=BASE_DIR, check=True)
    print("  ✅ Dashboard mis à jour et déployé sur Vercel")
except subprocess.CalledProcessError:
    print("  ⚠️  Git : rien à committer ou erreur push")

# Marque le scan comme fait aujourd'hui
LAST_SCAN_FILE.write_text(today)

print(f"\n{'='*60}\nSCAN TERMINÉ\n{'='*60}")
