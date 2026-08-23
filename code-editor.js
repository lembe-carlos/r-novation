// ═══════════════════════════════════════════════════════════════
//  KAMER360 — Éditeur de Code Intégré
//  Modifiez le code source directement depuis l'application
//  Coloration syntaxique, recherche, sauvegarde, prévisualisation
// ═══════════════════════════════════════════════════════════════

'use strict';

var EDITOR = {
  fichierActuel: null,
  contenuOriginal: '',
  contenuModifie: '',
  historique: [],       // undo stack
  modifie: false,

  // Fichiers organisés par catégorie
  FICHIERS: {
    'Interface & Design': [
      { nom:'style.css',           label:'Style principal',       type:'css',  icon:'🎨' },
      { nom:'design-upgrade.css',  label:'Design Upgrade',        type:'css',  icon:'✨' },
      { nom:'boutique.css',        label:'Style boutique client', type:'css',  icon:'🛍️' },
    ],
    'Logique principale': [
      { nom:'script.js',           label:'Script principal',      type:'js',   icon:'⚙️' },
      { nom:'boutique.js',         label:'Boutique client',       type:'js',   icon:'🛒' },
      { nom:'config.js',           label:'Configuration',         type:'js',   icon:'🔧' },
      { nom:'marketplace.js',      label:'Marketplace',           type:'js',   icon:'🏪' },
      { nom:'marketplace-data.js', label:'Données Marketplace',   type:'js',   icon:'📦' },
    ],
    'Modules Services': [
      { nom:'coiffure.js',    label:'Coiffure',       type:'js', icon:'✂️' },
      { nom:'automobile.js',  label:'Automobile',     type:'js', icon:'🚗' },
      { nom:'pressing.js',    label:'Pressing',       type:'js', icon:'👔' },
      { nom:'energie.js',     label:'Énergie',        type:'js', icon:'⚡' },
      { nom:'sante.js',       label:'Santé',          type:'js', icon:'🏥' },
      { nom:'btp.js',         label:'BTP',            type:'js', icon:'🏗️' },
      { nom:'agriculture.js', label:'Agriculture',    type:'js', icon:'🌾' },
      { nom:'immobilier.js',  label:'Immobilier',     type:'js', icon:'🏠' },
      { nom:'restauration.js',label:'Restauration',   type:'js', icon:'🍽️' },
      { nom:'menuiserie.js',  label:'Menuiserie',     type:'js', icon:'🪵' },
      { nom:'logistique.js',  label:'Logistique',     type:'js', icon:'🚚' },
      { nom:'education.js',   label:'Éducation',      type:'js', icon:'📚' },
    ],
    'Nouvelles Fonctionnalités': [
      { nom:'kamer-impact.js',   label:'6 Features Impact', type:'js', icon:'🚀' },
      { nom:'phase2-mondial.js', label:'Vision Mondiale',   type:'js', icon:'🌍' },
      { nom:'kamer-pay.js',      label:'KAMER Pay',         type:'js', icon:'💳' },
    ],
    'Gestion': [
      { nom:'livreurs.js',       label:'Livreurs',          type:'js', icon:'🛵' },
      { nom:'livraisons.js',     label:'Livraisons',        type:'js', icon:'📬' },
      { nom:'fidelite.js',       label:'Fidélité',          type:'js', icon:'⭐' },
      { nom:'abonnements.js',    label:'Abonnements',       type:'js', icon:'📋' },
      { nom:'paiement.js',       label:'Paiements',         type:'js', icon:'💰' },
      { nom:'stats-clients.js',  label:'Stats Clients',     type:'js', icon:'📊' },
    ],
    'Pages HTML': [
      { nom:'index.html',    label:'App Gérant',     type:'html', icon:'📄' },
      { nom:'boutique.html', label:'Boutique Client', type:'html', icon:'🏪' },
    ],
  }
};

// ══════════════════════════════════════════════════════════════
//  INITIALISATION DE LA PAGE ÉDITEUR
// ══════════════════════════════════════════════════════════════
function initPageEditeur() {
  var z = document.getElementById('editeur-content');
  if (!z) return;

  var html = '';

  // Header
  html += '<div style="background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);color:#fff;border-radius:16px;padding:20px;margin-bottom:16px">';
  html += '<div style="display:flex;align-items:center;gap:14px">';
  html += '<div style="width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:28px">💻</div>';
  html += '<div>';
  html += '<div style="font-size:18px;font-weight:800;font-family:Playfair Display,serif">Éditeur de Code KAMER360</div>';
  html += '<div style="font-size:12px;opacity:.75;margin-top:3px">Modifiez le code source directement — Sauvegarde en temps réel dans votre navigateur</div>';
  html += '</div></div>';
  html += '<div style="margin-top:14px;background:rgba(255,255,255,.08);border-radius:10px;padding:10px 14px;font-size:12px;display:flex;align-items:center;gap:8px">';
  html += '<span style="color:#FCD116">⚠️</span>';
  html += '<span>Les modifications sont sauvegardées localement. Pour déployer, copiez le code et mettez à jour votre fichier sur le serveur.</span>';
  html += '</div></div>';

  // Layout 2 colonnes : liste fichiers | éditeur
  html += '<div style="display:grid;grid-template-columns:260px 1fr;gap:14px;height:calc(100vh - 280px);min-height:500px">';

  // ── Colonne gauche : liste des fichiers ──
  html += '<div style="background:#fff;border-radius:14px;border:1px solid var(--br);overflow-y:auto;display:flex;flex-direction:column">';
  html += '<div style="padding:12px;border-bottom:1px solid var(--br);font-size:12px;font-weight:700;color:#374151;display:flex;align-items:center;gap:6px">';
  html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg> Fichiers source</div>';

  // Recherche fichier
  html += '<div style="padding:8px">';
  html += '<input type="text" id="editor-search-file" placeholder="Rechercher un fichier..." oninput="filtrerFichiersEditor(this.value)"';
  html += ' style="width:100%;padding:7px 10px;border:1.5px solid var(--br);border-radius:8px;font-size:12px;box-sizing:border-box;font-family:inherit">';
  html += '</div>';

  // Liste fichiers par catégorie
  html += '<div id="editor-file-list" style="flex:1;overflow-y:auto;padding:4px">';
  Object.keys(EDITOR.FICHIERS).forEach(function(cat) {
    html += '<div class="editor-cat">';
    html += '<div style="padding:6px 10px;font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.8px">' + cat + '</div>';
    EDITOR.FICHIERS[cat].forEach(function(f) {
      var size = '';
      html += '<div class="editor-file-item" data-nom="' + f.nom + '" onclick="ouvrirFichier(\'' + f.nom + '\')" ';
      html += 'style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;cursor:pointer;transition:background .15s" ';
      html += 'onmouseover="this.style.background=\'#f0faf5\'" onmouseout="this.style.background=this.getAttribute(\'data-active\')===\'1\'?\'#e0f5ea\':\'transparent\'">';
      html += '<span style="font-size:14px;flex-shrink:0">' + f.icon + '</span>';
      html += '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600;color:#0F1F0F;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + f.label + '</div>';
      html += '<div style="font-size:10px;color:#9ca3af">' + f.nom + '</div></div>';
      html += '<span style="font-size:10px;color:#9ca3af;background:#f0f0f0;padding:1px 5px;border-radius:4px;flex-shrink:0">' + f.type.toUpperCase() + '</span>';
      html += '</div>';
    });
    html += '</div>';
  });
  html += '</div></div>';

  // ── Colonne droite : éditeur ──
  html += '<div style="background:#1e1e1e;border-radius:14px;display:flex;flex-direction:column;overflow:hidden;height:100%">';

  // Toolbar éditeur
  html += '<div style="background:#2d2d2d;padding:10px 14px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #444">';
  html += '<div id="editor-filename" style="font-size:13px;font-weight:600;color:#d4d4d4;flex:1">Sélectionnez un fichier →</div>';
  html += '<div id="editor-modified-badge" style="display:none;background:#FCD116;color:#000;font-size:10px;font-weight:800;padding:2px 8px;border-radius:20px">MODIFIÉ</div>';
  html += '<button onclick="editorRechercher()" style="background:#3c3c3c;color:#d4d4d4;border:none;padding:6px 10px;border-radius:6px;font-size:11px;cursor:pointer" title="Ctrl+F">🔍 Chercher</button>';
  html += '<button onclick="editorUndo()" style="background:#3c3c3c;color:#d4d4d4;border:none;padding:6px 10px;border-radius:6px;font-size:11px;cursor:pointer" title="Ctrl+Z">↩ Annuler</button>';
  html += '<button onclick="editorReessayer()" id="btn-retry-editor" style="background:#3c3c3c;color:#d4d4d4;border:none;padding:6px 10px;border-radius:6px;font-size:11px;cursor:pointer">🔄 Réessayer</button>';
  html += '<button onclick="editorFormater()" style="background:#3c3c3c;color:#d4d4d4;border:none;padding:6px 10px;border-radius:6px;font-size:11px;cursor:pointer">⚡ Formater</button>';
  html += '<button onclick="sauvegarderFichier()" id="btn-save-editor" style="background:#007A3D;color:#fff;border:none;padding:6px 14px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer">💾 Sauvegarder</button>';
  html += '<button onclick="copierCode()" style="background:#1565C0;color:#fff;border:none;padding:6px 10px;border-radius:6px;font-size:11px;cursor:pointer">📋 Copier</button>';
  html += '</div>';

  // Barre recherche dans code
  html += '<div id="editor-search-bar" style="display:none;background:#2d2d2d;padding:8px 14px;border-bottom:1px solid #444;display:none;align-items:center;gap:8px">';
  html += '<input type="text" id="editor-search-input" placeholder="Chercher dans le code..." oninput="highlightRecherche(this.value)"';
  html += ' style="flex:1;background:#1e1e1e;border:1px solid #555;color:#d4d4d4;padding:6px 10px;border-radius:6px;font-size:12px;font-family:monospace">';
  html += '<span id="editor-search-count" style="font-size:11px;color:#9ca3af"></span>';
  html += '<button onclick="fermerRecherche()" style="background:none;border:none;color:#9ca3af;cursor:pointer;font-size:16px">✕</button>';
  html += '</div>';

  // Zone numéros de ligne + textarea
  html += '<div style="display:flex;flex:1;overflow:hidden;min-height:400px">';

  // Numéros de ligne
  html += '<div id="editor-line-numbers" style="background:#1e1e1e;padding:12px 8px;font-family:monospace;font-size:13px;line-height:1.6;color:#858585;text-align:right;min-width:44px;border-right:1px solid #333;overflow:hidden;user-select:none">1</div>';

  // Textarea principal
  html += '<textarea id="editor-textarea" ';
  html += 'style="flex:1;background:#1e1e1e;color:#d4d4d4;border:none;outline:none;font-family:\'Consolas\',\'Monaco\',\'Courier New\',monospace;font-size:13px;line-height:1.6;height:100%;padding:12px;resize:none;tab-size:2;white-space:pre;overflow-wrap:normal;overflow-x:auto" ';
  html += 'placeholder="Sélectionnez un fichier dans la liste pour commencer..." ';
  html += 'spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" ';
  html += 'onkeydown="editorKeyDown(event)" oninput="editorChange(this)" onscroll="syncScroll(this)">';
  html += '</textarea>';
  html += '</div>';

  // Barre de statut
  html += '<div style="background:#007A3D;padding:4px 14px;display:flex;align-items:center;gap:16px">';
  html += '<span id="editor-status" style="font-size:11px;color:rgba(255,255,255,.8)">Prêt</span>';
  html += '<span id="editor-cursor-pos" style="font-size:11px;color:rgba(255,255,255,.6)">Ln 1, Col 1</span>';
  html += '<span id="editor-char-count" style="font-size:11px;color:rgba(255,255,255,.6)">0 caractères</span>';
  html += '<span style="margin-left:auto;font-size:10px;color:rgba(255,255,255,.5)">Ctrl+S = Sauvegarder · Tab = Indentation · Ctrl+Z = Annuler</span>';
  html += '</div>';

  html += '</div>'; // fin colonne droite
  html += '</div>'; // fin grid

  z.innerHTML = html;
}

// ══════════════════════════════════════════════════════════════
//  OUVERTURE D'UN FICHIER
// ══════════════════════════════════════════════════════════════
function ouvrirFichier(nom) {
  // Vérifier modifications non sauvegardées
  if (EDITOR.modifie) {
    if (!confirm('Des modifications non sauvegardées seront perdues. Continuer ?')) return;
  }

  EDITOR.fichierActuel = nom;
  EDITOR.modifie = false;

  // Mettre à jour l'UI de sélection
  document.querySelectorAll('.editor-file-item').forEach(function(el) {
    var isActive = el.getAttribute('data-nom') === nom;
    el.style.background = isActive ? '#e0f5ea' : 'transparent';
    el.setAttribute('data-active', isActive ? '1' : '0');
  });

  // Essayer de charger depuis localStorage (modifications sauvegardées)
  var saved = null;
  try { saved = localStorage.getItem('km_editor_' + nom); } catch(e) {}

  // Afficher un état de chargement immédiat (feedback visuel pendant le fetch)
  var textareaLoading = document.getElementById('editor-textarea');
  if (textareaLoading) {
    textareaLoading.value = '// Chargement de ' + nom + '...';
    textareaLoading.style.color = '#9ca3af';
  }
  setEditorStatus('Chargement de ' + nom + '...', '#FCD116');

  // Détecter si on est en mode file:// (fetch impossible par sécurité navigateur)
  var modeFichierLocal = window.location.protocol === 'file:';

  if (modeFichierLocal) {
    // En file://, fetch échoue toujours — passer direct au fallback localStorage
    if (saved) {
      chargerContenuEditeur(nom, saved);
      setEditorStatus('Chargé depuis le cache local (mode file://)', '#FCD116');
    } else {
      _afficherErreurChargement(nom, true);
    }
    return;
  }
  // Construire un chemin ABSOLU basé sur la racine du dossier de l'app
  // (évite l'échec si l'éditeur est ouvert depuis un sous-dossier ou une URL imbriquée)
  var dossierBase = window.location.pathname.replace(/[^/]*$/, ''); // retire le nom du fichier HTML courant
  var urlAbsolue = window.location.origin + dossierBase + nom;

  // Charger le fichier via fetch avec chemin absolu fiable
  fetch(urlAbsolue + '?v=' + Date.now(), { cache: 'no-store' })
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(function(contenu) {
      // Si une version sauvegardée existe, proposer de la charger
      if (saved && saved !== contenu) {
        var useSaved = confirm('Une version modifiée de ' + nom + ' existe en cache. Charger vos modifications ?');
        if (useSaved) contenu = saved;
      }
      chargerContenuEditeur(nom, contenu);
    })
    .catch(function(e) {
      // fetch a échoué malgré le chemin absolu — vraie erreur réseau ou serveur
      if (saved) {
        chargerContenuEditeur(nom, saved);
        setEditorStatus('⚠️ Échec réseau — chargé depuis le cache local', '#FCD116');
      } else {
        _afficherErreurChargement(nom, false, urlAbsolue, e.message);
      }
    });
}

// ── Affichage clair de l'erreur de chargement, avec diagnostic et action ──
function _afficherErreurChargement(nom, modeFichierLocal, urlTentee, erreurMsg) {
  var textarea = document.getElementById('editor-textarea');
  if (!textarea) return;

  var msg;
  if (modeFichierLocal) {
    msg = '// ⚠️ IMPOSSIBLE DE CHARGER "' + nom + '"\n' +
          '//\n' +
          '// Cause : vous ouvrez cette page directement depuis votre disque (file://).\n' +
          '// Le navigateur bloque la lecture de fichiers locaux par sécurité.\n' +
          '//\n' +
          '// SOLUTION : utilisez un serveur local pour ouvrir l\u2019application :\n' +
          '//   • VS Code + extension "Live Server" → clic droit sur index.html → "Open with Live Server"\n' +
          '//   • Ou : python3 -m http.server 8000  (puis ouvrez http://localhost:8000)\n' +
          '//\n' +
          '// En attendant, vous pouvez coller votre code ici manuellement et cliquer "Sauvegarder"\n' +
          '// (il sera mis en cache local et rechargé automatiquement la prochaine fois).';
  } else {
    msg = '// ⚠️ IMPOSSIBLE DE CHARGER "' + nom + '"\n' +
          '//\n' +
          '// URL tentée : ' + urlTentee + '\n' +
          '// Erreur : ' + (erreurMsg || 'inconnue') + '\n' +
          '//\n' +
          '// Causes possibles :\n' +
          '//   • Le fichier "' + nom + '" n\u2019existe pas à cet emplacement sur le serveur\n' +
          '//   • Le serveur ne répond pas ou bloque la requête (CORS, 404, etc.)\n' +
          '//   • Vous avez déployé seulement certains fichiers (vérifiez votre dossier en ligne)\n' +
          '//\n' +
          '// Cliquez sur "🔄 Réessayer" dans la barre d\u2019outils, ou collez votre code manuellement.';
  }

  textarea.value = msg;
  textarea.style.color = '#f59e0b';
  setEditorStatus(modeFichierLocal ? 'Mode local (file://) — voir instructions' : 'Échec de chargement — voir détails', '#ef4444');
}

function chargerContenuEditeur(nom, contenu) {
  EDITOR.contenuOriginal = contenu;
  EDITOR.contenuModifie  = contenu;
  EDITOR.historique      = [contenu];
  EDITOR.modifie         = false;

  var textarea = document.getElementById('editor-textarea');
  if (textarea) {
    textarea.value = contenu;
    textarea.style.color = '#d4d4d4';
    mettreAJourLignes(textarea);
    mettreAJourStatut(textarea);
  }

  // Mettre à jour le nom dans la toolbar
  var fnEl = document.getElementById('editor-filename');
  if (fnEl) {
    var icons = { js:'🟡', css:'🔵', html:'🟠' };
    var ext = nom.split('.').pop();
    fnEl.textContent = (icons[ext]||'📄') + '  ' + nom;
  }

  var badge = document.getElementById('editor-modified-badge');
  if (badge) badge.style.display = 'none';

  setEditorStatus('Fichier chargé — ' + Math.round(contenu.length/1024) + ' KB', '#00A852');
  updateCharCount(contenu);
}

// ══════════════════════════════════════════════════════════════
//  SAUVEGARDE
// ══════════════════════════════════════════════════════════════
function sauvegarderFichier() {
  var textarea = document.getElementById('editor-textarea');
  if (!textarea || !EDITOR.fichierActuel) {
    toast('Sélectionnez un fichier avant de sauvegarder', 'warning');
    return;
  }
  var contenu = textarea.value;

  // 1. Sauvegarder dans localStorage
  try {
    localStorage.setItem('km_editor_' + EDITOR.fichierActuel, contenu);
  } catch(e) {
    toast('Stockage plein — libérez de l\'espace', 'error');
    return;
  }

  // 2. Proposer le téléchargement du fichier modifié
  var blob = new Blob([contenu], { type: 'text/plain;charset=utf-8' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href   = url;
  a.download = EDITOR.fichierActuel;
  a.click();
  URL.revokeObjectURL(url);

  EDITOR.contenuOriginal = contenu;
  EDITOR.modifie = false;
  var badge = document.getElementById('editor-modified-badge');
  if (badge) badge.style.display = 'none';

  setEditorStatus('Sauvegardé — ' + EDITOR.fichierActuel + ' téléchargé', '#00A852');
  toast('Fichier sauvegardé ! Remplacez le fichier dans votre dossier.', 'success');
}

function copierCode() {
  var textarea = document.getElementById('editor-textarea');
  if (!textarea || !textarea.value) { toast('Aucun code à copier', 'warning'); return; }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(textarea.value).then(function() {
      toast('Code copié dans le presse-papiers !', 'success');
      setEditorStatus('Code copié (' + textarea.value.length + ' caractères)', '#1565C0');
    });
  } else {
    textarea.select();
    document.execCommand('copy');
    toast('Code copié !', 'success');
  }
}

// ══════════════════════════════════════════════════════════════
//  GESTION DES TOUCHES
// ══════════════════════════════════════════════════════════════
function editorKeyDown(e) {
  var textarea = e.target;

  // Ctrl+S = Sauvegarder
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    sauvegarderFichier();
    return;
  }

  // Ctrl+Z = Annuler
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    editorUndo();
    return;
  }

  // Ctrl+F = Rechercher
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    editorRechercher();
    return;
  }

  // Tab = 2 espaces
  if (e.key === 'Tab') {
    e.preventDefault();
    var start = textarea.selectionStart;
    var end   = textarea.selectionEnd;
    var val   = textarea.value;
    textarea.value = val.substring(0, start) + '  ' + val.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + 2;
    editorChange(textarea);
    return;
  }

  // Entrée = auto-indentation
  if (e.key === 'Enter') {
    var start2 = textarea.selectionStart;
    var lineStart = textarea.value.lastIndexOf('\n', start2-1) + 1;
    var currentLine = textarea.value.substring(lineStart, start2);
    var indent = currentLine.match(/^(\s*)/)[1];
    // Indentation supplémentaire après {
    if (currentLine.trimRight().endsWith('{')) indent += '  ';
    e.preventDefault();
    var val2 = textarea.value;
    textarea.value = val2.substring(0, start2) + '\n' + indent + val2.substring(start2);
    textarea.selectionStart = textarea.selectionEnd = start2 + 1 + indent.length;
    editorChange(textarea);
  }
}

function editorChange(textarea) {
  // Sauvegarder dans l'historique (toutes les 500ms)
  if (!EDITOR._saveTimer) {
    EDITOR._saveTimer = setTimeout(function() {
      EDITOR.historique.push(textarea.value);
      if (EDITOR.historique.length > 50) EDITOR.historique.shift();
      EDITOR._saveTimer = null;
    }, 500);
  }

  EDITOR.modifie = textarea.value !== EDITOR.contenuOriginal;
  var badge = document.getElementById('editor-modified-badge');
  if (badge) badge.style.display = EDITOR.modifie ? 'inline-flex' : 'none';

  mettreAJourLignes(textarea);
  mettreAJourStatut(textarea);
  updateCharCount(textarea.value);
}

function editorUndo() {
  if (EDITOR.historique.length <= 1) { toast('Rien à annuler', 'info'); return; }
  EDITOR.historique.pop();
  var prev = EDITOR.historique[EDITOR.historique.length - 1];
  var textarea = document.getElementById('editor-textarea');
  if (textarea) {
    textarea.value = prev;
    editorChange(textarea);
  }
}

// ══════════════════════════════════════════════════════════════
//  UTILITAIRES ÉDITEUR
// ══════════════════════════════════════════════════════════════
function mettreAJourLignes(textarea) {
  var lignes = textarea.value.split('\n');
  var nums   = '';
  for (var i = 1; i <= lignes.length; i++) nums += i + '\n';
  var lineEl = document.getElementById('editor-line-numbers');
  if (lineEl) lineEl.textContent = nums;
}

function mettreAJourStatut(textarea) {
  var val  = textarea.value;
  var pos  = textarea.selectionStart;
  var debut = val.lastIndexOf('\n', pos-1);
  var ligne = (val.substring(0, pos).match(/\n/g)||[]).length + 1;
  var col   = pos - debut;
  var statusEl = document.getElementById('editor-cursor-pos');
  if (statusEl) statusEl.textContent = 'Ln ' + ligne + ', Col ' + col;
}

function syncScroll(textarea) {
  var lineEl = document.getElementById('editor-line-numbers');
  if (lineEl) lineEl.scrollTop = textarea.scrollTop;
}

function updateCharCount(val) {
  var el = document.getElementById('editor-char-count');
  if (el) {
    var lines = (val.match(/\n/g)||[]).length + 1;
    el.textContent = val.length.toLocaleString('fr-FR') + ' chars · ' + lines.toLocaleString('fr-FR') + ' lignes';
  }
}

function setEditorStatus(msg, color) {
  var el = document.getElementById('editor-status');
  if (el) { el.textContent = msg; el.style.color = color || 'rgba(255,255,255,.8)'; }
}

function filtrerFichiersEditor(query) {
  var items = document.querySelectorAll('.editor-file-item');
  var cats  = document.querySelectorAll('.editor-cat');
  query = (query||'').toLowerCase();
  cats.forEach(function(cat) {
    var visible = 0;
    cat.querySelectorAll('.editor-file-item').forEach(function(item) {
      var nom = (item.getAttribute('data-nom')||'').toLowerCase();
      var show = !query || nom.indexOf(query) >= 0;
      item.style.display = show ? 'flex' : 'none';
      if (show) visible++;
    });
    cat.style.display = visible > 0 ? 'block' : 'none';
  });
}

function editorRechercher() {
  var bar = document.getElementById('editor-search-bar');
  if (!bar) return;
  bar.style.display = bar.style.display === 'flex' ? 'none' : 'flex';
  if (bar.style.display === 'flex') {
    var inp = document.getElementById('editor-search-input');
    if (inp) inp.focus();
  }
}

function fermerRecherche() {
  var bar = document.getElementById('editor-search-bar');
  if (bar) bar.style.display = 'none';
}

function highlightRecherche(query) {
  var textarea = document.getElementById('editor-textarea');
  var countEl  = document.getElementById('editor-search-count');
  if (!textarea || !query) { if (countEl) countEl.textContent = ''; return; }
  var val = textarea.value.toLowerCase();
  var q   = query.toLowerCase();
  var count = 0;
  var idx = val.indexOf(q);
  while (idx >= 0) { count++; idx = val.indexOf(q, idx+1); }
  if (countEl) countEl.textContent = count + ' résultat(s)';
  // Aller à la première occurrence
  if (count > 0) {
    var first = val.indexOf(q);
    textarea.focus();
    textarea.setSelectionRange(first, first + query.length);
    mettreAJourStatut(textarea);
  }
}

function editorFormater() {
  var textarea = document.getElementById('editor-textarea');
  if (!textarea || !EDITOR.fichierActuel) return;
  var ext = EDITOR.fichierActuel.split('.').pop();
  if (ext !== 'js' && ext !== 'css') {
    toast('Formatage disponible pour JS et CSS uniquement', 'info');
    return;
  }
  // Formatage basique : normaliser les indentations et espaces
  var code = textarea.value;
  // Supprimer les espaces en fin de ligne
  code = code.replace(/[ \t]+$/gm, '');
  // Normaliser les accolades JS
  if (ext === 'js') {
    code = code.replace(/\{(\S)/g, '{ $1');
    code = code.replace(/(\S)\}/g, '$1 }');
  }
  textarea.value = code;
  editorChange(textarea);
  toast('Code formaté', 'success');
}

// Raccourcis clavier globaux pour l'éditeur
document.addEventListener('keydown', function(e) {
  var page = document.querySelector('.page.active');
  if (!page || page.id !== 'page-editeur') return;
  if ((e.ctrlKey||e.metaKey) && e.key === 's') {
    e.preventDefault();
    sauvegarderFichier();
  }
});

console.log('[KAMER360] Éditeur de code chargé');

// ── Relancer le chargement du fichier actuel (après une erreur) ──
function editorReessayer() {
  if (!EDITOR.fichierActuel) {
    setEditorStatus('Aucun fichier sélectionné', '#f59e0b');
    return;
  }
  EDITOR.modifie = false; // éviter le confirm() de perte de modifications
  ouvrirFichier(EDITOR.fichierActuel);
}
