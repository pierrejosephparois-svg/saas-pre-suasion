# Hermes Agent — brancher Telegram et WhatsApp (VPS Hostinger)

Runbook pour connecter l'agent Hermes (`hermes-agent-cl0a-hermes-agent-1`) à
Telegram puis à WhatsApp. Sources : documentation officielle Nous Research
(`NousResearch/hermes-agent`).

---

## 0. Le bug de la capture (à comprendre une fois pour toutes)

Sur la capture, le prompt était déjà :

```
root@58bc2013fbdb:/opt/hermes#
```

Ce prompt **est déjà à l'intérieur du conteneur** (le terminal web Hostinger t'y
place automatiquement — la ligne « You are now in Docker container … » le dit).

La commande lancée ensuite était :

```bash
docker exec -it hermes-agent-cl0a-hermes-agent-1 bash   # ❌
```

→ `Cannot connect to the Docker daemon at unix:///var/run/docker.sock`

C'est normal : il n'y a pas de démon Docker **dans** le conteneur (le socket
`/var/run/docker.sock` n'est pas monté). On ne rentre pas dans une pièce où
l'on se trouve déjà.

**Règle :**

| Prompt affiché | Où tu es | Ce que tu tapes |
|---|---|---|
| `root@58bc2013fbdb:/opt/hermes#` | dans le conteneur | `hermes ...` directement |
| `root@srvXXXXXX:~#` | sur l'hôte VPS | `docker exec -it hermes-agent-cl0a-hermes-agent-1 bash` d'abord |

Astuce : si le terminal affiche `>` (guillemet ou accent grave resté ouvert),
appuie sur **Ctrl+C** avant de retaper.

---

## 1. Telegram — ~5 minutes, gratuit

### 1.1 Créer le bot

Dans Telegram, parler à [@BotFather](https://t.me/BotFather) :

1. `/newbot`
2. Nom affiché (ex. « Super PJo-bot »)
3. Username unique finissant par `bot`
4. BotFather renvoie un token de la forme `123456789:ABCdef...`

> Le token vaut mot de passe. S'il fuite : `/revoke` chez BotFather.

### 1.2 Récupérer son user ID numérique

Parler à [@userinfobot](https://t.me/userinfobot) → il répond un nombre
(ex. `123456789`). Ce n'est **pas** le `@pseudo`.

### 1.3 Configurer Hermes

Dans le conteneur (prompt `/opt/hermes#`) :

```bash
hermes gateway setup
```

Choisir **Telegram**, coller le token, coller le user ID.

Équivalent manuel dans `~/.hermes/.env` :

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdef...
TELEGRAM_ALLOWED_USERS=123456789
```

### 1.4 Démarrer

```bash
hermes gateway restart
```

Envoyer un message au bot en DM : il doit répondre en quelques secondes.

### 1.5 Pièges connus

- **Groupes** : le mode privacy est ON par défaut, le bot ne voit que les
  messages commençant par `/`. Le désactiver via BotFather →
  `/mybots` → Bot Settings → Group Privacy → Turn off, **puis retirer et
  ré-ajouter le bot au groupe** (Telegram met l'état en cache à l'arrivée).
  Alternative : passer le bot admin du groupe.
- **Un seul gateway par token.** Telegram refuse le polling concurrent : un
  token par profil Hermes.

---

## 2. WhatsApp — oui, c'est faisable, et c'est gratuit

Hermes propose **deux** chemins WhatsApp. Le premier est presque aussi simple
que Telegram.

### Option A — pont Baileys (recommandé pour un usage perso)

C'est une session « WhatsApp Web » émulée. **Aucun compte Meta Business,
aucune vérification d'entreprise, aucun paiement, aucune URL publique.**

```bash
hermes whatsapp
```

L'assistant :

1. demande le mode (`bot` ou `self-chat`),
2. installe les dépendances du pont si besoin,
3. affiche un **QR code** dans le terminal,
4. attend le scan.

Scanner depuis le téléphone : **WhatsApp → Réglages → Appareils connectés →
Connecter un appareil**.

Puis dans `~/.hermes/.env` :

```bash
WHATSAPP_ENABLED=true
WHATSAPP_MODE=bot                    # ou self-chat
WHATSAPP_ALLOWED_USERS=336XXXXXXXX   # indicatif pays, sans le +
```

Et :

```bash
hermes gateway restart
```

**Deux modes :**

| Mode | Fonctionnement | Pour qui |
|---|---|---|
| `bot` (recommandé) | numéro dédié au bot, les gens lui écrivent | UX propre, plusieurs users, moins de risque |
| `self-chat` | ton propre WhatsApp, tu t'écris à toi-même | test rapide, un seul utilisateur |

**Le vrai coût du mode A n'est pas de l'argent, c'est du risque :** WhatsApp ne
supporte pas officiellement les bots tiers hors Business API. Le risque de
restriction du compte est faible mais réel. Pour le réduire :

- numéro **dédié** au bot, pas ton numéro perso ;
- pas d'envoi en masse, rester conversationnel ;
- ne jamais démarcher quelqu'un qui n'a pas écrit en premier.

Second numéro : Google Voice (gratuit, US), SIM prépayée (5–15 € une fois), ou
VoIP type TextNow. Certains numéros VoIP sont refusés par WhatsApp.

**Contraintes techniques :** aucune côté image Docker officielle — Node.js et le
pont `scripts/whatsapp-bridge/` y sont déjà inclus. La session est sauvegardée
dans `~/.hermes/platforms/whatsapp/session` (volume `/opt/data`, donc elle
survit aux redémarrages). Ne jamais partager ni committer ce dossier : il donne
un accès complet au compte WhatsApp.

Si la session casse (téléphone réinitialisé, mise à jour WhatsApp, appareil
délié) : relancer `hermes whatsapp` et rescanner.

### Option B — WhatsApp Business Cloud API (officiel Meta)

Le chemin « production » : pas de risque de ban, mais nettement plus lourd.

```bash
hermes whatsapp-cloud
```

Il faut réunir :

- un compte **Meta Business** (pas un WhatsApp perso),
- une app Meta avec WhatsApp activé → **Phone Number ID**, **Access Token**
  (`EAA...`), **App Secret** (32 hex),
- un **numéro dédié** business,
- une **URL HTTPS publique** pour le webhook (le VPS convient, ou Cloudflare
  Tunnel gratuit),
- un **token permanent** via System User (les tokens temporaires expirent en
  24 h) avec `business_management`, `whatsapp_business_messaging`,
  `whatsapp_business_management`, expiration **Never**.

**Piège n°1 :** coller le numéro de téléphone dans le champ *Phone Number ID*.
Le Phone Number ID est un identifiant numérique de 15–17 chiffres, pas le numéro.

**Coût réel (tarification Meta au message depuis le 1er juillet 2025) :**

| Situation | Prix |
|---|---|
| Tu écris au bot, il répond dans les 24 h | **gratuit** (fenêtre de service, illimitée) |
| Le bot t'écrit spontanément après 24 h de silence | template payant, ~0,01–0,12 $ selon pays/catégorie |
| Via un BSP (Twilio & co) | + 0,003–0,010 $ de marge par message |

Pour un assistant perso — c'est toujours toi qui écris en premier — la Cloud API
serait donc **de fait gratuite**. Ce qui coûte, c'est la paperasse : compte
Business, vérification, numéro dédié, webhook, templates.

---

## 3. Verdict

| | Telegram | WhatsApp Baileys | WhatsApp Cloud API |
|---|---|---|---|
| Temps de mise en place | ~5 min | ~10 min | quelques heures + vérification Meta |
| Compte Meta / vérification | non | non | **oui** |
| Numéro dédié | non | recommandé | **obligatoire** |
| URL publique HTTPS | non | non | **oui** |
| Coût par message | 0 | 0 | 0 dans la fenêtre 24 h |
| Risque de ban | nul | faible mais réel | nul |

**Recommandation :** finir Telegram d'abord (5 minutes, zéro risque, ça valide
que le gateway tourne), puis lancer `hermes whatsapp` en mode `bot` avec un
numéro dédié. Passer à la Cloud API seulement le jour où WhatsApp devient un
canal client sérieux.

Aucun de ces chemins n'ajoute un centime aux ~25 €/mois de Hostinger.

---

## 4. Le serveur MCP « max »

Séparé du sujet messagerie. Séquence de diagnostic, depuis le conteneur :

```bash
hermes mcp test max        # sans guillemets ni accent grave
```

- Test OK → `hermes mcp configure max` puis `hermes gateway restart`
- Test KO → lire l'erreur : en Docker, **tout chemin de commande et toute URL
  localhost doivent se résoudre à l'intérieur du conteneur**. Un binaire stdio
  présent seulement sur l'hôte ne sera pas trouvé ; `127.0.0.1:3002` désigne le
  conteneur lui-même, pas l'hôte (utiliser le nom de service Compose, ou
  `host.docker.internal` si supporté).

La config manuelle doit se trouver sous la clé de premier niveau
`mcp_servers:` dans `~/.hermes/config.yaml`.
