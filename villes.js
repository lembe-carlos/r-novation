// ═══════════════════════════════════════════════════════
//  TOUTES LES VILLES ET BANLIEUES DU CAMEROUN
//  10 Régions — 58 Départements — 400+ localités
// ═══════════════════════════════════════════════════════
var CAMEROUN_VILLES = [

  // ── RÉGION CENTRE ──
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Bastos' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Biyem-Assi' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Emana' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Essos' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Etoa-Meki' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Melen' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Mendong' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Nkomo' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Nsam' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Obili' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Odza' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Omnisport' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Tsinga' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Mvog-Ada' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Messa' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Nkolbisson' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Nkoldongo' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Ekounou' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Elig-Edzoa' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Elig-Effa' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Ngousso' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Nkolmesseng' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Nlong-Kak' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Mokolo' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Mvog-Mbi' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Etoudi' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Olembe' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Simbock' },
  { region:'Centre', dept:'Mfoundi', ville:'Yaoundé — Ngoa-Ekele' },
  { region:'Centre', dept:'Lekié', ville:'Monatélé' },
  { region:'Centre', dept:'Lekié', ville:'Obala' },
  { region:'Centre', dept:'Lekié', ville:'Saa' },
  { region:'Centre', dept:'Lekié', ville:'Evodoula' },
  { region:'Centre', dept:'Lekié', ville:'Batchenga' },
  { region:'Centre', dept:'Lekié', ville:'Okola' },
  { region:'Centre', dept:'Lekié', ville:'Elig-Mfomo' },
  { region:'Centre', dept:'Mbam-et-Inoubou', ville:'Bafia' },
  { region:'Centre', dept:'Mbam-et-Inoubou', ville:'Bokito' },
  { region:'Centre', dept:'Mbam-et-Inoubou', ville:'Ombessa' },
  { region:'Centre', dept:'Mbam-et-Kim', ville:'Ntui' },
  { region:'Centre', dept:'Mbam-et-Kim', ville:'Ngambe-Tikar' },
  { region:'Centre', dept:'Méfou-et-Afamba', ville:'Mfou' },
  { region:'Centre', dept:'Méfou-et-Afamba', ville:'Awaé' },
  { region:'Centre', dept:'Méfou-et-Afamba', ville:'Nkolafamba' },
  { region:'Centre', dept:'Méfou-et-Akono', ville:'Mbalmayo' },
  { region:'Centre', dept:'Méfou-et-Akono', ville:'Akono' },
  { region:'Centre', dept:'Méfou-et-Akono', ville:'Ngomedzap' },
  { region:'Centre', dept:'Nyong-et-Kellé', ville:'Eséka' },
  { region:'Centre', dept:'Nyong-et-Kellé', ville:'Makak' },
  { region:'Centre', dept:'Nyong-et-Mfoumou', ville:'Akonolinga' },
  { region:'Centre', dept:'Nyong-et-Mfoumou', ville:'Endom' },
  { region:'Centre', dept:'Nyong-et-Sooo', ville:'Mbankomo' },
  { region:'Centre', dept:'Nyong-et-Sooo', ville:'Dzeng' },

  // ── RÉGION LITTORAL ──
  { region:'Littoral', dept:'Wouri', ville:'Douala' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Akwa' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Bali' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Bassa' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Beedi' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Bepanda' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Bonabéri' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Bonamoussadi' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Bonandjo' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Bonapriso' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Cité des Palmiers' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Deido' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Kotto' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Logbaba' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Makepe' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Ndokotti' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — New Bell' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Nyalla' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — PK 10' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — PK 12' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — PK 14' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — PK 17' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Village' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Yassa' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Ndogbong' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Ndoghem' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Mboppi' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Ndog-Bati' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Bonanjo' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Japoma' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Ndogpassi' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Nkongmondo' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Boko' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Ngodi Bakoko' },
  { region:'Littoral', dept:'Wouri', ville:'Douala — Nylom' },
  { region:'Littoral', dept:'Moungo', ville:'Nkongsamba' },
  { region:'Littoral', dept:'Moungo', ville:'Loum' },
  { region:'Littoral', dept:'Moungo', ville:'Mbanga' },
  { region:'Littoral', dept:'Moungo', ville:'Manjo' },
  { region:'Littoral', dept:'Moungo', ville:'Melong' },
  { region:'Littoral', dept:'Moungo', ville:'Mombo' },
  { region:'Littoral', dept:'Moungo', ville:'Penja' },
  { region:'Littoral', dept:'Nkam', ville:'Yabassi' },
  { region:'Littoral', dept:'Nkam', ville:'Ndom' },
  { region:'Littoral', dept:'Nkam', ville:'Yingui' },
  { region:'Littoral', dept:'Sanaga-Maritime', ville:'Edéa' },
  { region:'Littoral', dept:'Sanaga-Maritime', ville:'Nyanon' },
  { region:'Littoral', dept:'Sanaga-Maritime', ville:'Dizangue' },
  { region:'Littoral', dept:'Sanaga-Maritime', ville:'Pouma' },
  { region:'Littoral', dept:'Sanaga-Maritime', ville:'Mouanko' },

  // ── RÉGION OUEST ──
  { region:'Ouest', dept:'Mifi', ville:'Bafoussam' },
  { region:'Ouest', dept:'Mifi', ville:'Bafoussam — Banengo' },
  { region:'Ouest', dept:'Mifi', ville:'Bafoussam — Djeleng' },
  { region:'Ouest', dept:'Mifi', ville:'Bafoussam — Tamdja' },
  { region:'Ouest', dept:'Mifi', ville:'Bafoussam — Ngouache' },
  { region:'Ouest', dept:'Mifi', ville:'Bafoussam — Kamkop' },
  { region:'Ouest', dept:'Haut-Nkam', ville:'Bafang' },
  { region:'Ouest', dept:'Haut-Nkam', ville:'Kekem' },
  { region:'Ouest', dept:'Haut-Nkam', ville:'Bana' },
  { region:'Ouest', dept:'Hauts-Plateaux', ville:'Baham' },
  { region:'Ouest', dept:'Hauts-Plateaux', ville:'Bangou' },
  { region:'Ouest', dept:'Hauts-Plateaux', ville:'Bamendjou' },
  { region:'Ouest', dept:'Bamboutos', ville:'Mbouda' },
  { region:'Ouest', dept:'Bamboutos', ville:'Babadjou' },
  { region:'Ouest', dept:'Bamboutos', ville:'Galim' },
  { region:'Ouest', dept:'Bamboutos', ville:'Fokoue' },
  { region:'Ouest', dept:'Menoua', ville:'Dschang' },
  { region:'Ouest', dept:'Menoua', ville:'Santchou' },
  { region:'Ouest', dept:'Menoua', ville:'Penka-Michel' },
  { region:'Ouest', dept:'Noun', ville:'Foumban' },
  { region:'Ouest', dept:'Noun', ville:'Foumbot' },
  { region:'Ouest', dept:'Noun', ville:'Malantouen' },
  { region:'Ouest', dept:'Noun', ville:'Koutaba' },
  { region:'Ouest', dept:'Noun', ville:'Magba' },
  { region:'Ouest', dept:'Nde', ville:'Bangangté' },
  { region:'Ouest', dept:'Nde', ville:'Tonga' },
  { region:'Ouest', dept:'Nde', ville:'Bazou' },
  { region:'Ouest', dept:'Koung-Khi', ville:'Barombi' },

  // ── RÉGION NORD-OUEST ──
  { region:'Nord-Ouest', dept:'Mezam', ville:'Bamenda' },
  { region:'Nord-Ouest', dept:'Mezam', ville:'Bamenda — Commercial Avenue' },
  { region:'Nord-Ouest', dept:'Mezam', ville:'Bamenda — Mile 4' },
  { region:'Nord-Ouest', dept:'Mezam', ville:'Bamenda — Nkwen' },
  { region:'Nord-Ouest', dept:'Mezam', ville:'Bamenda — Cow Street' },
  { region:'Nord-Ouest', dept:'Mezam', ville:'Bamenda — Up Station' },
  { region:'Nord-Ouest', dept:'Mezam', ville:'Santa' },
  { region:'Nord-Ouest', dept:'Mezam', ville:'Tubah' },
  { region:'Nord-Ouest', dept:'Mezam', ville:'Bafut' },
  { region:'Nord-Ouest', dept:'Momo', ville:'Mbengwi' },
  { region:'Nord-Ouest', dept:'Momo', ville:'Batibo' },
  { region:'Nord-Ouest', dept:'Momo', ville:'Widikum' },
  { region:'Nord-Ouest', dept:'Bui', ville:'Kumbo' },
  { region:'Nord-Ouest', dept:'Bui', ville:'Jakiri' },
  { region:'Nord-Ouest', dept:'Donga-Mantung', ville:'Nkambe' },
  { region:'Nord-Ouest', dept:'Donga-Mantung', ville:'Ako' },
  { region:'Nord-Ouest', dept:'Donga-Mantung', ville:'Nwa' },
  { region:'Nord-Ouest', dept:'Boyo', ville:'Fundong' },
  { region:'Nord-Ouest', dept:'Boyo', ville:'Belo' },
  { region:'Nord-Ouest', dept:'Menchum', ville:'Wum' },
  { region:'Nord-Ouest', dept:'Ngokentunjia', ville:'Ndop' },
  { region:'Nord-Ouest', dept:'Ngokentunjia', ville:'Babessi' },

  // ── RÉGION SUD-OUEST ──
  { region:'Sud-Ouest', dept:'Fako', ville:'Buea' },
  { region:'Sud-Ouest', dept:'Fako', ville:'Limbé' },
  { region:'Sud-Ouest', dept:'Fako', ville:'Tiko' },
  { region:'Sud-Ouest', dept:'Fako', ville:'Muyuka' },
  { region:'Sud-Ouest', dept:'Fako', ville:'Limbe — Bota' },
  { region:'Sud-Ouest', dept:'Fako', ville:'Limbe — Down Beach' },
  { region:'Sud-Ouest', dept:'Fako', ville:'Limbe — Mile 4' },
  { region:'Sud-Ouest', dept:'Meme', ville:'Kumba' },
  { region:'Sud-Ouest', dept:'Meme', ville:'Mbonge' },
  { region:'Sud-Ouest', dept:'Meme', ville:'Konye' },
  { region:'Sud-Ouest', dept:'Kupe-Manenguba', ville:'Bangem' },
  { region:'Sud-Ouest', dept:'Kupe-Manenguba', ville:'Nguti' },
  { region:'Sud-Ouest', dept:'Kupe-Manenguba', ville:'Tombel' },
  { region:'Sud-Ouest', dept:'Lebialem', ville:'Menji' },
  { region:'Sud-Ouest', dept:'Lebialem', ville:'Wabane' },
  { region:'Sud-Ouest', dept:'Manyu', ville:'Mamfé' },
  { region:'Sud-Ouest', dept:'Manyu', ville:'Akwaya' },
  { region:'Sud-Ouest', dept:'Ndian', ville:'Mundemba' },
  { region:'Sud-Ouest', dept:'Ndian', ville:'Ekondo-Titi' },

  // ── RÉGION NORD ──
  { region:'Nord', dept:'Bénoué', ville:'Garoua' },
  { region:'Nord', dept:'Bénoué', ville:'Garoua — Yelwa' },
  { region:'Nord', dept:'Bénoué', ville:'Garoua — Roumdé Adjia' },
  { region:'Nord', dept:'Bénoué', ville:'Lagdo' },
  { region:'Nord', dept:'Bénoué', ville:'Dembo' },
  { region:'Nord', dept:'Bénoué', ville:'Bibemi' },
  { region:'Nord', dept:'Faro', ville:'Poli' },
  { region:'Nord', dept:'Mayo-Louti', ville:'Guider' },
  { region:'Nord', dept:'Mayo-Louti', ville:'Figuil' },
  { region:'Nord', dept:'Mayo-Rey', ville:'Tcholliré' },
  { region:'Nord', dept:'Mayo-Rey', ville:'Rey Bouba' },
  { region:'Nord', dept:'Mayo-Rey', ville:'Touboro' },

  // ── RÉGION EXTRÊME-NORD ──
  { region:'Extrême-Nord', dept:'Diamaré', ville:'Maroua' },
  { region:'Extrême-Nord', dept:'Diamaré', ville:'Maroua — Domayo' },
  { region:'Extrême-Nord', dept:'Diamaré', ville:'Maroua — Kakataré' },
  { region:'Extrême-Nord', dept:'Diamaré', ville:'Maroua — Ngassa' },
  { region:'Extrême-Nord', dept:'Diamaré', ville:'Maroua — Djarengol' },
  { region:'Extrême-Nord', dept:'Diamaré', ville:'Maroua — Founangué' },
  { region:'Extrême-Nord', dept:'Diamaré', ville:'Gazawa' },
  { region:'Extrême-Nord', dept:'Diamaré', ville:'Meri' },
  { region:'Extrême-Nord', dept:'Mayo-Kani', ville:'Kaelé' },
  { region:'Extrême-Nord', dept:'Mayo-Kani', ville:'Mindif' },
  { region:'Extrême-Nord', dept:'Mayo-Sava', ville:'Mora' },
  { region:'Extrême-Nord', dept:'Mayo-Sava', ville:'Kolofata' },
  { region:'Extrême-Nord', dept:'Mayo-Sava', ville:'Tokombéré' },
  { region:'Extrême-Nord', dept:'Mayo-Tsanaga', ville:'Mokolo' },
  { region:'Extrême-Nord', dept:'Mayo-Tsanaga', ville:'Koza' },
  { region:'Extrême-Nord', dept:'Mayo-Tsanaga', ville:'Mogodé' },
  { region:'Extrême-Nord', dept:'Logone-et-Chari', ville:'Kousseri' },
  { region:'Extrême-Nord', dept:'Logone-et-Chari', ville:'Fotokol' },
  { region:'Extrême-Nord', dept:'Logone-et-Chari', ville:'Goulfey' },
  { region:'Extrême-Nord', dept:'Mayo-Danay', ville:'Yagoua' },
  { region:'Extrême-Nord', dept:'Mayo-Danay', ville:'Maga' },
  { region:'Extrême-Nord', dept:'Mayo-Danay', ville:'Kalfou' },

  // ── RÉGION ADAMAOUA ──
  { region:'Adamaoua', dept:'Vina', ville:'Ngaoundéré' },
  { region:'Adamaoua', dept:'Vina', ville:'Ngaoundéré — Baladji' },
  { region:'Adamaoua', dept:'Vina', ville:'Ngaoundéré — Burkina' },
  { region:'Adamaoua', dept:'Vina', ville:'Ngaoundéré — Dang' },
  { region:'Adamaoua', dept:'Vina', ville:'Ngaoundéré — Maképé' },
  { region:'Adamaoua', dept:'Vina', ville:'Ngaoundéré — Sabongari' },
  { region:'Adamaoua', dept:'Mbéré', ville:'Meiganga' },
  { region:'Adamaoua', dept:'Mbéré', ville:'Djohong' },
  { region:'Adamaoua', dept:'Mbéré', ville:'Belel' },
  { region:'Adamaoua', dept:'Djérem', ville:'Tibati' },
  { region:'Adamaoua', dept:'Djérem', ville:'Ngaoundal' },
  { region:'Adamaoua', dept:'Faro-et-Déo', ville:'Tignère' },
  { region:'Adamaoua', dept:'Mayo-Banyo', ville:'Banyo' },
  { region:'Adamaoua', dept:'Mayo-Banyo', ville:'Kontcha' },

  // ── RÉGION EST ──
  { region:'Est', dept:'Lom-et-Djerem', ville:'Bertoua' },
  { region:'Est', dept:'Lom-et-Djerem', ville:'Bélabo' },
  { region:'Est', dept:'Lom-et-Djerem', ville:'Mandjou' },
  { region:'Est', dept:'Boumba-et-Ngoko', ville:'Yokadouma' },
  { region:'Est', dept:'Boumba-et-Ngoko', ville:'Moloundou' },
  { region:'Est', dept:'Haut-Nyong', ville:'Abong-Mbang' },
  { region:'Est', dept:'Haut-Nyong', ville:'Doumé' },
  { region:'Est', dept:'Haut-Nyong', ville:'Lomié' },
  { region:'Est', dept:'Haut-Nyong', ville:'Messamena' },
  { region:'Est', dept:'Kadey', ville:'Batouri' },
  { region:'Est', dept:'Kadey', ville:'Kette' },
  { region:'Est', dept:'Kadey', ville:'Ndelele' },

  // ── RÉGION SUD ──
  { region:'Sud', dept:'Mvila', ville:'Ebolowa' },
  { region:'Sud', dept:'Mvila', ville:'Meyo-centre' },
  { region:'Sud', dept:'Mvila', ville:'Olamze' },
  { region:'Sud', dept:'Dja-et-Lobo', ville:'Sangmélima' },
  { region:'Sud', dept:'Dja-et-Lobo', ville:'Bengbis' },
  { region:'Sud', dept:'Vallée-du-Ntem', ville:'Ambam' },
  { region:'Sud', dept:'Vallée-du-Ntem', ville:'Kyé-Ossi' },
  { region:'Sud', dept:'Vallée-du-Ntem', ville:'Akom II' },
  { region:'Sud', dept:'Océan', ville:'Kribi' },
  { region:'Sud', dept:'Océan', ville:'Kribi — Grand Batanga' },
  { region:'Sud', dept:'Océan', ville:'Campo' },
  { region:'Sud', dept:'Océan', ville:'Lolodorf' },

];

// ═══════════════════════════════════════════════════════
//  MOTEUR DE RECHERCHE DES VILLES
// ═══════════════════════════════════════════════════════
function initVilleSearch(inputId, hiddenId, listId) {
  var input  = document.getElementById(inputId);
  var hidden = document.getElementById(hiddenId);
  var list   = document.getElementById(listId);
  if (!input || !list) return;

  input.addEventListener('input', function() {
    var q = input.value.trim().toLowerCase();
    if (hidden) hidden.value = input.value.trim();
    if (q.length < 1) { list.style.display = 'none'; return; }
    var resultats = CAMEROUN_VILLES.filter(function(v) {
      return v.ville.toLowerCase().includes(q) ||
             v.dept.toLowerCase().includes(q) ||
             v.region.toLowerCase().includes(q);
    }).slice(0, 10);
    if (resultats.length === 0) {
      list.innerHTML = '<div style="padding:10px;color:#999;font-size:13px">Aucune ville trouvée</div>';
      list.style.display = 'block';
      return;
    }
    list.innerHTML = resultats.map(function(v) {
      var safe = v.ville.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      return '<div onclick="choisirVille(\'' + inputId + '\',\'' + hiddenId + '\',\'' + listId + '\',\'' + safe + '\')" style="padding:9px 14px;cursor:pointer;border-bottom:1px solid #f0f0f0;font-size:13px;hover:background:#f0faf5">'
        + '<span style="font-weight:600;color:#111">' + v.ville + '</span>'
        + ' <span style="font-size:11px;color:#999">' + v.dept + ' — ' + v.region + '</span>'
        + '</div>';
    }).join('');
    list.style.display = 'block';
  });

  document.addEventListener('click', function(e) {
    if (input && !input.contains(e.target) && list && !list.contains(e.target)) {
      list.style.display = 'none';
    }
  });
}

function choisirVille(inputId, hiddenId, listId, ville) {
  var input  = document.getElementById(inputId);
  var hidden = document.getElementById(hiddenId);
  var list   = document.getElementById(listId);
  if (input)  input.value  = ville;
  if (hidden) hidden.value = ville;
  if (list)   list.style.display = 'none';
}

function remplirSelectVilles(selectId) {
  var sel = document.getElementById(selectId);
  if (!sel) return;
  var current = sel.value;
  sel.innerHTML = '<option value="">Sélectionner une ville...</option>';
  var regions = {};
  CAMEROUN_VILLES.forEach(function(v) {
    if (!regions[v.region]) regions[v.region] = [];
    regions[v.region].push(v.ville);
  });
  Object.keys(regions).sort().forEach(function(region) {
    var og = document.createElement('optgroup');
    og.label = region;
    regions[region].forEach(function(ville) {
      var opt = document.createElement('option');
      opt.value = ville;
      opt.textContent = ville;
      if (ville === current) opt.selected = true;
      og.appendChild(opt);
    });
    sel.appendChild(og);
  });
}
