/*
 * Robô Explorador — telas, física do robô, Portal da Pergunta, estrelas e progresso.
 */
(function () {
  'use strict';

  var CHAVE_PROGRESSO = 'roboExplorador.progresso.v1';
  var CHAVE_DESAFIO = 'roboExplorador.desafio';
  var $ = function (id) { return document.getElementById(id); };

  /* ================= Progresso (salvo só neste navegador) ================= */
  var progresso = carregarProgresso();

  function carregarProgresso() {
    try {
      var d = JSON.parse(localStorage.getItem(CHAVE_PROGRESSO));
      if (d && typeof d === 'object') {
        return { estrelas: d.estrelas || {}, liberarTudo: !!d.liberarTudo };
      }
    } catch (e) { /* sem acesso ao armazenamento */ }
    return { estrelas: {}, liberarTudo: false };
  }
  function salvarProgresso() {
    try { localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(progresso)); } catch (e) { /* ignora */ }
  }
  function estrelasDe(ano, i) { return progresso.estrelas[ano + '-' + i] || 0; }
  function faseLiberada(ano, i) { return progresso.liberarTudo || i === 0 || estrelasDe(ano, i - 1) > 0; }

  /* ================= Modo Desafio (lembrado neste navegador) ================= */
  var modoDesafio = false;
  try { modoDesafio = localStorage.getItem(CHAVE_DESAFIO) === 'sim'; } catch (e) { /* ignora */ }

  function atualizarBotaoDesafio() {
    var b = document.getElementById('btn-desafio');
    b.textContent = modoDesafio ? '🔥 Modo Desafio: ligado' : '🔥 Modo Desafio: desligado';
    b.setAttribute('aria-pressed', modoDesafio ? 'true' : 'false');
  }

  /* ================= Perguntas (de perguntas.js) ================= */
  var banco = {};
  var problemasPerguntas = [];
  var perguntasComErro = typeof PERGUNTAS !== 'object' || !PERGUNTAS;

  function validarPergunta(q) {
    if (!q || typeof q.pergunta !== 'string' || !q.pergunta.trim()) return 'falta o texto da pergunta';
    if (!Array.isArray(q.respostas) || q.respostas.length < 2 || q.respostas.length > 3) return 'precisa ter 2 ou 3 respostas';
    var certas = 0;
    for (var i = 0; i < q.respostas.length; i++) {
      var r = q.respostas[i];
      if (!r || (!r.texto && !r.imagem)) return 'a resposta ' + (i + 1) + ' precisa de texto ou imagem';
      if (r.certa === true) certas++;
    }
    if (certas !== 1) return 'precisa ter exatamente uma resposta com certa: true';
    return null;
  }

  if (!perguntasComErro) {
    Object.keys(PERGUNTAS).forEach(function (tema) {
      var lista = PERGUNTAS[tema];
      if (!Array.isArray(lista)) { problemasPerguntas.push(tema + ': não é uma lista entre [ e ]'); return; }
      banco[tema] = lista.filter(function (q, i) {
        var erro = validarPergunta(q);
        if (erro) problemasPerguntas.push(tema + ', pergunta ' + (i + 1) + ': ' + erro);
        return !erro;
      });
    });
  }

  function embaralhar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function sortearPerguntas(temas, quantidade) {
    var porTema = temas.map(function (t) { return embaralhar(banco[t] || []); });
    var escolhidas = [];
    // Na revisão, alterna os temas para variar
    var rodada = 0;
    while (escolhidas.length < quantidade) {
      var algum = false;
      for (var k = 0; k < porTema.length && escolhidas.length < quantidade; k++) {
        var idx = (k + rodada) % porTema.length;
        if (porTema[idx].length) { escolhidas.push(porTema[idx].shift()); algum = true; }
      }
      if (!algum) break;
      rodada++;
    }
    return embaralhar(escolhidas);
  }

  /* ================= Som (desligado no começo) ================= */
  var Som = {
    ligado: false,
    ctx: null,
    tocar: function (tipo) {
      if (!this.ligado) return;
      try {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        var c = this.ctx;
        var notas = {
          pulo: [[520, 0, 0.08]], item: [[880, 0, 0.06], [1320, 0.06, 0.08]],
          certo: [[660, 0, 0.1], [880, 0.1, 0.1], [1100, 0.2, 0.18]],
          errado: [[300, 0, 0.15], [240, 0.15, 0.2]], bandeira: [[600, 0, 0.08], [900, 0.08, 0.12]],
          queda: [[400, 0, 0.1], [250, 0.1, 0.15]], vitoria: [[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12], [1046, 0.36, 0.3]]
        }[tipo] || [];
        notas.forEach(function (n) {
          var o = c.createOscillator(), g = c.createGain();
          o.type = 'triangle';
          o.frequency.value = n[0];
          g.gain.setValueAtTime(0.15, c.currentTime + n[1]);
          g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + n[1] + n[2]);
          o.connect(g); g.connect(c.destination);
          o.start(c.currentTime + n[1]);
          o.stop(c.currentTime + n[1] + n[2] + 0.02);
        });
      } catch (e) { /* sem som neste computador */ }
    }
  };

  function atualizarBotoesSom() {
    var botoes = document.querySelectorAll('.btn-som');
    for (var i = 0; i < botoes.length; i++) {
      botoes[i].textContent = Som.ligado ? '🔊 Som ligado' : '🔇 Som desligado';
      botoes[i].setAttribute('aria-pressed', Som.ligado ? 'true' : 'false');
    }
  }

  /* ================= Telas ================= */
  var anoAtual = null;     // objeto de ANOS
  var faseAtual = 0;       // índice da fase

  function mostrarTela(id) {
    var telas = document.querySelectorAll('.tela');
    for (var i = 0; i < telas.length; i++) telas[i].classList.remove('ativa');
    $(id).classList.add('ativa');
    if (id === 'tela-inicio') document.body.classList.remove('ano-1');
    window.scrollTo(0, 0);
  }

  function textoEstrelas(n, total) {
    var s = '';
    for (var i = 0; i < total; i++) {
      s += '<span class="' + (i < n ? 'estrela-cheia' : 'estrela-vazia') + '">★</span>';
    }
    return s;
  }

  function montarInicio() {
    var lista = $('lista-anos');
    lista.innerHTML = '';
    var emojis = { 1: '👃🧼🌙✏️', 2: '🌱🐸🔦🍄', 3: '🦋👂🟫🌍' };
    ANOS.forEach(function (a) {
      var total = 0;
      a.fases.forEach(function (f, i) { total += estrelasDe(a.ano, i); });
      var b = document.createElement('button');
      b.className = 'cartao-ano';
      b.style.background = a.cor;
      b.innerHTML = '<span class="ano-nome">' + a.nome + '</span>' +
        '<span class="ano-emojis" aria-hidden="true">' + emojis[a.ano] + '</span>' +
        '<span class="ano-estrelas">⭐ ' + total + ' de ' + a.fases.length * 3 + '</span>';
      b.addEventListener('click', function () { abrirMapa(a); });
      lista.appendChild(b);
    });

    if (perguntasComErro || problemasPerguntas.length) {
      var aviso = $('aviso-perguntas');
      aviso.hidden = false;
      aviso.innerHTML = perguntasComErro
        ? '<b>Atenção, professor(a):</b> o arquivo <b>perguntas.js</b> tem um erro de digitação e não pôde ser lido. ' +
          'Confira vírgulas, aspas e chaves na última alteração. Enquanto isso, o portal abre sem perguntas.'
        : '<b>Atenção, professor(a):</b> algumas perguntas do arquivo perguntas.js têm problema e foram puladas. ' +
          'Veja quais na Área do professor.';
    }
  }

  function abrirMapa(ano) {
    anoAtual = ano;
    document.body.classList.toggle('ano-1', ano.ano === 1);
    $('mapa-titulo').textContent = ano.nome;
    var lista = $('lista-fases');
    lista.innerHTML = '';
    ano.fases.forEach(function (f, i) {
      var amb = AMBIENTES[f.ambiente];
      var livre = faseLiberada(ano.ano, i);
      var b = document.createElement('button');
      b.className = 'cartao-fase';
      b.disabled = !livre;
      b.innerHTML = '<span class="fase-numero">Fase ' + (i + 1) + '</span>' +
        '<span class="fase-emoji" aria-hidden="true">' + amb.emoji + '</span>' +
        '<span class="fase-titulo">' + f.titulo + '</span>' +
        '<span class="fase-ambiente">' + amb.nome + '</span>' +
        '<span class="fase-estrelas" aria-label="' + estrelasDe(ano.ano, i) + ' estrelas">' + textoEstrelas(estrelasDe(ano.ano, i), 3) + '</span>' +
        (livre ? '' : '<span class="cadeado" aria-label="Fase bloqueada">🔒</span>');
      if (livre) b.addEventListener('click', function () { abrirPreFase(i); });
      lista.appendChild(b);
    });
    mostrarTela('tela-mapa');
  }

  function abrirPreFase(i) {
    faseAtual = i;
    var f = anoAtual.fases[i];
    var amb = AMBIENTES[f.ambiente];
    $('prefase-numero').textContent = anoAtual.nome + ' · Fase ' + (i + 1) + ' · ' + amb.nome;
    $('prefase-titulo').textContent = f.titulo;
    $('prefase-item').src = Desenho.iconeItem(amb.item, 112);
    $('prefase-coletar').textContent = 'Pegue as ' + amb.nomeItens + '!';
    $('prefase-desafio').hidden = !modoDesafio;
    var tipos = Obstaculos.plano(anoAtual.ano, f.ambiente, modoDesafio).tipos;
    $('lista-obstaculos').innerHTML = tipos.map(function (t) {
      return '<li><img src="' + Obstaculos.icone(t, 96) + '" alt="">' + Obstaculos.CATALOGO[t].nome + '</li>';
    }).join('');
    mostrarTela('tela-prefase');
    $('prefase-comecar').focus();
  }

  /* ================= Janelas ================= */
  function abrirModal(id) { $(id).hidden = false; }
  function fecharModal(id) { $(id).hidden = true; }
  function algumModalAberto() {
    return !$('modal-quiz').hidden || !$('modal-pausa').hidden || !$('modal-ajuda').hidden || !$('modal-professor').hidden;
  }

  /* ================= Jogo ================= */
  var canvas = $('canvas');
  var ctx = canvas.getContext('2d');
  var escalaCanvas = 1;

  var GRAVIDADE = 2200;
  var VEL_PULO = 820;
  var VEL_ANDAR = 230;
  var ACELERACAO = 1800;

  var jogo = null;
  var teclas = { esq: false, dir: false };

  // Quem pediu ao computador menos movimento na tela (acessibilidade) tem obstáculos mais lentos e sem giros
  var movimentoReduzido = false;
  try { movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* ignora */ }

  var MENSAGENS_OPS = {
    tropecou: ['Opa, tropeçou! 🤭', 'Ops! Que tombo engraçado! 😄', 'Upa! Vamos de novo! 😅'],
    molhou: ['Ops, molhou! 💦', 'Splash! O robô se molhou! 💧']
  };
  var ultimoTempo = 0;
  var rodando = false;

  function novaPartida() {
    var faseInfo = anoAtual.fases[faseAtual];
    var amb = AMBIENTES[faseInfo.ambiente];
    var f = construirFase(anoAtual.ano, faseAtual, amb.enfeites, { desafio: modoDesafio, calmo: movimentoReduzido });
    jogo = {
      info: faseInfo, ambiente: faseInfo.ambiente, tipoItem: amb.item, fase: f,
      calmo: movimentoReduzido, ano1: anoAtual.ano === 1, ops: null,
      robo: { x: f.inicio.x, y: f.inicio.y - 60, w: 34, h: 60, vx: 0, vy: 0, noChao: false, dir: 1, coyote: 0, pedidoPulo: 0, sobre: null, cipo: null, esperaCipo: 0, pulosNoAr: 0 },
      salvamento: { x: f.inicio.x, y: f.inicio.y },
      cam: 0, t: 0, coletados: 0, estado: 'jogando',
      particulas: [], textos: [], piscar: 0,
      portalAberto: false, saida: 0,
      quiz: null, acertosPrimeira: 0, totalPerguntas: 0
    };
    teclas.esq = teclas.dir = false;
    $('hud-titulo').textContent = (modoDesafio ? '🔥 ' : '') + 'Fase ' + (faseAtual + 1) + ': ' + faseInfo.titulo;
    $('hud-icone').src = Desenho.iconeItem(amb.item, 84);
    atualizarHud();
  }

  function atualizarHud() {
    var f = jogo.fase;
    $('hud-contador').textContent = jogo.coletados + ' / ' + f.totalItens;
    var meta = $('hud-meta');
    if (jogo.coletados >= f.metaItens) {
      meta.textContent = '⭐ meta!';
      meta.classList.add('ok');
    } else {
      meta.textContent = 'meta: ' + f.metaItens;
      meta.classList.remove('ok');
    }
  }

  var avisoTimer = null;
  function aviso(texto, tipo) {
    var el = $('aviso-jogo');
    el.textContent = texto;
    el.className = 'aviso-jogo visivel ' + (tipo || '');
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(function () { el.className = 'aviso-jogo'; }, 1800);
  }

  function comecarFase() {
    novaPartida();
    mostrarTela('tela-jogo');
    ajustarCanvas();
    if (document.activeElement) document.activeElement.blur();
    aviso('Vamos lá! 🚀', 'bom');
    if (!rodando) {
      rodando = true;
      ultimoTempo = performance.now();
      requestAnimationFrame(quadro);
    }
  }

  function ajustarCanvas() {
    var area = $('area-canvas');
    var w = area.clientWidth, h = area.clientHeight;
    if (!w || !h) return;
    var s = Math.min(w / LARGURA_JOGO, h / ALTURA_JOGO);
    canvas.style.width = Math.floor(LARGURA_JOGO * s) + 'px';
    canvas.style.height = Math.floor(ALTURA_JOGO * s) + 'px';
    var dpr = window.devicePixelRatio || 1;
    escalaCanvas = Math.max(1, Math.min(1.5, s * dpr));
    canvas.width = Math.round(LARGURA_JOGO * escalaCanvas);
    canvas.height = Math.round(ALTURA_JOGO * escalaCanvas);
  }

  function sobrepoe(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function atualizar(dt) {
    var g = jogo, r = g.robo, f = g.fase;
    g.t += dt;

    // Plataformas que se mexem
    f.plataformas.forEach(function (p) {
      if (!p.movel) return;
      var m = p.movel;
      var antes = p.x;
      // para um pouquinho em cada margem, para dar tempo de subir e descer
      if (m.parada > 0) m.parada -= dt;
      else p.x += m.vel * m.sentido * dt;
      if (p.x > m.ate) { p.x = m.ate; m.sentido = -1; m.parada = 0.9; }
      if (p.x < m.de) { p.x = m.de; m.sentido = 1; m.parada = 0.9; }
      p.dx = p.x - antes;
    });
    Obstaculos.mover(g, dt);

    // Tropeçou ou se molhou: animação engraçada e volta para a bandeira
    if (g.estado === 'ops') {
      g.ops.t += dt;
      if (g.ops.t > (g.calmo ? 1.1 : 0.9)) {
        voltarParaBandeira();
        g.estado = 'jogando';
        g.ops = null;
      }
      atualizarEfeitos(dt);
      return;
    }

    var ef = Obstaculos.efeitos(g);

    // Pendurado no cipó: pular solta o robô
    if (r.cipo) {
      r.pedidoPulo -= dt;
      if (g.estado === 'jogando' && r.pedidoPulo > 0) {
        r.cipo = null;
        r.esperaCipo = 0.4;
        r.vy = -650;
        r.vx = teclas.esq && !teclas.dir ? -VEL_ANDAR : VEL_ANDAR;
        r.pedidoPulo = 0;
        r.pulosNoAr = 0;
        Som.tocar('pulo');
      } else {
        verificarObstaculos(dt);
        coletar();
        atualizarEfeitos(dt);
        return;
      }
    }

    if (g.estado === 'jogando') {
      var alvo = ((teclas.dir ? 1 : 0) - (teclas.esq ? 1 : 0)) * VEL_ANDAR * ef.vel;
      var dv = alvo - r.vx;
      var maxDv = ACELERACAO * dt;
      r.vx += Math.max(-maxDv, Math.min(maxDv, dv));
      if (alvo !== 0) r.dir = alvo > 0 ? 1 : -1;

      r.coyote = r.noChao ? 0.1 : r.coyote - dt;
      if (r.noChao) r.pulosNoAr = 0;
      r.pedidoPulo -= dt;
      // Pulo duplo: apertar de novo no ar dá mais um pulo
      if (r.pedidoPulo > 0 && r.coyote <= 0 && !r.noChao && r.pulosNoAr < 1) {
        r.vy = -VEL_PULO * 0.9;
        r.pedidoPulo = 0;
        r.pulosNoAr = 1;
        Som.tocar('pulo');
        for (var k = 0; k < 8; k++) {
          g.particulas.push({ x: r.x + r.w / 2 + (k - 3.5) * 5, y: r.y + r.h, vx: (k - 3.5) * 30, vy: 60 + Math.random() * 40, vida: 0.35, cor: '#ffffff' });
        }
      }
      if (r.pedidoPulo > 0 && r.coyote > 0) {
        r.vy = -VEL_PULO * ef.pulo;
        r.pedidoPulo = 0;
        r.coyote = 0;
        r.noChao = false;
        r.sobre = null;
        Som.tocar('pulo');
      }
    } else if (g.estado === 'saindo') {
      // O robô caminha sozinho até o centro do portal
      var destino = f.portal.x - r.w / 2;
      r.vx = Math.abs(destino - r.x) > 4 ? (destino > r.x ? 120 : -120) : 0;
      r.dir = 1;
      g.saida += dt;
    } else {
      r.vx = 0;
    }

    r.vy = Math.min(r.vy + GRAVIDADE * dt, 1100);

    if (r.sobre && r.sobre.dx) r.x += r.sobre.dx;
    if (r.sobre && r.sobre.dy) r.y += r.sobre.dy;

    // Movimento horizontal (a correnteza empurra para trás)
    r.x += (r.vx + ef.empurra) * dt;
    if (r.x < 0) r.x = 0;
    if (r.x > f.largura - r.w) r.x = f.largura - r.w;
    f.solidos.forEach(function (s) {
      if (sobrepoe(r, s)) {
        if (r.vx + ef.empurra > 0 || (r.sobre && r.sobre.dx > 0)) r.x = s.x - r.w;
        else r.x = s.x + s.w;
        r.vx = 0;
      }
    });

    // Movimento vertical
    var baseAntes = r.y + r.h;
    r.y += r.vy * dt;
    r.noChao = false;
    r.sobre = null;
    f.solidos.forEach(function (s) {
      if (sobrepoe(r, s)) {
        if (r.vy > 0) { r.y = s.y - r.h; r.vy = 0; r.noChao = true; }
        else { r.y = s.y + s.h; r.vy = 0; }
      }
    });
    if (r.vy >= 0) {
      f.plataformas.forEach(function (p) {
        if (p.solida === false) return;
        if (r.x + r.w > p.x + 2 && r.x < p.x + p.w - 2 && baseAntes <= p.y + 2 && r.y + r.h >= p.y) {
          r.y = p.y - r.h; r.vy = 0; r.noChao = true; r.sobre = p;
        }
      });
    }

    // Caiu no buraco: volta para a última bandeira
    if (r.y > ALTURA_JOGO + 120) {
      voltarParaBandeira();
      aviso(AMBIENTES[g.ambiente].agua ? 'Ops, molhou! Vamos de novo 💦' : 'Ops! Vamos tentar de novo 🚩', 'atencao');
      Som.tocar('queda');
    }
    if (g.piscar > 0) g.piscar -= dt;

    verificarObstaculos(dt);

    coletar();

    // Chegou ao portal
    if (g.estado === 'jogando' && r.x + r.w / 2 >= f.portal.x - 50 && r.noChao) {
      g.estado = 'pergunta';
      teclas.esq = teclas.dir = false;
      setTimeout(abrirQuiz, 350);
    }

    if (g.estado === 'saindo' && g.saida > 1.6) {
      g.estado = 'fim';
      mostrarResultado();
    }

    atualizarEfeitos(dt);
  }

  // Itens e bandeiras (pontos de salvamento)
  function coletar() {
    var g = jogo, f = g.fase, r = g.robo;
    var caixaRobo = { x: r.x - 4, y: r.y - 6, w: r.w + 8, h: r.h + 6 };
    f.itens.forEach(function (it) {
      if (it.pego) return;
      if (sobrepoe(caixaRobo, { x: it.x - 16, y: it.y - 16, w: 32, h: 32 })) {
        it.pego = true;
        g.coletados++;
        atualizarHud();
        Som.tocar('item');
        for (var k = 0; k < 8; k++) {
          var ang = k * Math.PI / 4;
          g.particulas.push({ x: it.x, y: it.y, vx: Math.cos(ang) * 160, vy: Math.sin(ang) * 160, vida: 0.5, cor: '#fff176' });
        }
        g.textos.push({ x: it.x, y: it.y - 10, texto: '+1', vida: 0.8 });
        if (g.coletados === f.metaItens) aviso('Meta de itens! ⭐', 'bom');
      }
    });

    // Bandeiras (pontos de salvamento)
    f.bandeiras.forEach(function (b) {
      if (!b.ativa && r.x + r.w / 2 > b.x) {
        b.ativa = true;
        g.salvamento = { x: b.x - r.w / 2, y: b.y };
        aviso('Bandeira salva! 🚩', 'bom');
        Som.tocar('bandeira');
        for (var k = 0; k < 10; k++) {
          g.particulas.push({ x: b.x + 20, y: b.y - 80, vx: (Math.random() - 0.5) * 260, vy: -Math.random() * 260, vida: 0.7, cor: '#66bb6a' });
        }
      }
    });
  }

  function verificarObstaculos(dt) {
    var g = jogo;
    var tocou = Obstaculos.verificar(g, dt);
    if (tocou && g.estado === 'jogando') {
      var reacao = AMBIENTES[g.ambiente].agua && (tocou === 'pedra' || tocou === 'correnteza') ? 'molhou' : 'tropecou';
      g.estado = 'ops';
      g.ops = { tipo: tocou, reacao: reacao, t: 0 };
      g.robo.cipo = null;
      g.robo.vx = g.robo.vy = 0;
      var lista = MENSAGENS_OPS[reacao];
      aviso(lista[Math.floor(Math.random() * lista.length)], 'atencao');
      Som.tocar('queda');
    }
  }

  function voltarParaBandeira() {
    var g = jogo, r = g.robo;
    r.x = g.salvamento.x;
    r.y = g.salvamento.y - r.h;
    r.vx = r.vy = 0;
    r.cipo = null;
    r.sobre = null;
    g.piscar = 1.2;
    g.cam = Math.max(0, r.x - LARGURA_JOGO * 0.35);
  }

  function atualizarEfeitos(dt) {
    var g = jogo, f = g.fase, r = g.robo;
    g.particulas = g.particulas.filter(function (p) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; p.vida -= dt;
      return p.vida > 0;
    });
    g.textos = g.textos.filter(function (tx) { tx.y -= 50 * dt; tx.vida -= dt; return tx.vida > 0; });

    // Câmera
    var alvoCam = Math.max(0, Math.min(f.largura - LARGURA_JOGO, r.x - LARGURA_JOGO * 0.38));
    g.cam += (alvoCam - g.cam) * Math.min(1, dt * 6);
  }

  function desenhar() {
    var g = jogo, f = g.fase, r = g.robo;
    ctx.setTransform(escalaCanvas, 0, 0, escalaCanvas, 0, 0);
    Desenho.fundo(ctx, g.ambiente, g.cam, g.t);
    ctx.save();
    ctx.translate(-Math.round(g.cam), 0);
    Desenho.cenario(ctx, f, g.ambiente, g.cam, g.t);
    Obstaculos.desenhar(ctx, g, g.calmo);
    f.bandeiras.forEach(function (b) { Desenho.bandeira(ctx, b, g.t); });
    Desenho.portal(ctx, f.portal, g.t, g.portalAberto);
    f.itens.forEach(function (it, i) {
      if (!it.pego) Desenho.item(ctx, g.tipoItem, it.x, it.y + Math.sin(g.t * 3 + i) * 4, 1);
    });

    var opcoesRobo = { andando: Math.abs(r.vx) > 20 && r.noChao, noAr: !r.noChao };
    if (g.estado === 'saindo' || g.estado === 'fim') {
      var progressoSaida = Math.max(0, (g.saida - 0.6) / 0.9);
      opcoesRobo.escala = Math.max(0.05, 1 - progressoSaida);
      opcoesRobo.alpha = Math.max(0, 1 - progressoSaida);
    }
    var visivel = g.piscar <= 0 || Math.floor(g.piscar * 10) % 2 === 0;
    if (g.estado === 'ops') {
      Obstaculos.desenharRoboOps(ctx, r, g.ops, g.t, g.calmo, function (o) { Desenho.robo(ctx, r, g.t, o); });
    } else if (visivel) {
      if (r.cipo) opcoesRobo = { noAr: true };
      Desenho.robo(ctx, r, g.t, opcoesRobo);
    }

    g.particulas.forEach(function (p) {
      ctx.globalAlpha = Math.max(0, p.vida * 2);
      ctx.fillStyle = p.cor;
      ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.font = 'bold 28px Verdana, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    g.textos.forEach(function (tx) {
      ctx.globalAlpha = Math.min(1, tx.vida * 2);
      ctx.lineWidth = 5; ctx.strokeStyle = '#1b1b1b';
      ctx.strokeText(tx.texto, tx.x, tx.y);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(tx.texto, tx.x, tx.y);
    });
    ctx.globalAlpha = 1;
    Obstaculos.desenharPlacas(ctx, g, g.calmo, g.ano1);
    ctx.restore();

    // Seta indicando o caminho no começo
    if (g.t < 4 && g.estado === 'jogando') {
      ctx.globalAlpha = Math.min(1, (4 - g.t));
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1b1b1b';
      ctx.lineWidth = 4;
      var ax = 300 + Math.sin(g.t * 6) * 10;
      ctx.beginPath();
      ctx.moveTo(ax, 200); ctx.lineTo(ax + 50, 230); ctx.lineTo(ax, 260); ctx.lineTo(ax, 245);
      ctx.lineTo(ax - 50, 245); ctx.lineTo(ax - 50, 215); ctx.lineTo(ax, 215); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function quadro(agora) {
    if (!$('tela-jogo').classList.contains('ativa') || !jogo) { rodando = false; return; }
    var dt = Math.min(1 / 30, (agora - ultimoTempo) / 1000);
    ultimoTempo = agora;
    if (jogo.estado !== 'pausa') {
      // passos menores deixam as colisões mais firmes
      atualizar(dt / 2);
      atualizar(dt / 2);
    }
    desenhar();
    requestAnimationFrame(quadro);
  }

  /* ================= Pausa ================= */
  var estadoAntesDaPausa = null;
  function pausar() {
    if (!jogo || jogo.estado === 'pausa' || jogo.estado === 'fim') return;
    if (!$('modal-quiz').hidden) return;
    estadoAntesDaPausa = jogo.estado;
    jogo.estado = 'pausa';
    teclas.esq = teclas.dir = false;
    abrirModal('modal-pausa');
    $('pausa-continuar').focus();
  }
  function continuar() {
    if (!jogo || jogo.estado !== 'pausa') return;
    fecharModal('modal-pausa');
    jogo.estado = estadoAntesDaPausa || 'jogando';
    // Se pausou bem na chegada ao portal, abre as perguntas agora
    if (jogo.estado === 'pergunta' && $('modal-quiz').hidden) setTimeout(abrirQuiz, 200);
    ultimoTempo = performance.now();
    if (document.activeElement) document.activeElement.blur();
  }

  /* ================= Portal da Pergunta ================= */
  function abrirQuiz() {
    if (!jogo || jogo.estado !== 'pergunta') return;
    var perguntas = perguntasComErro ? [] : sortearPerguntas(jogo.info.temas, anoAtual.perguntasPorPortal);
    jogo.quiz = { lista: perguntas, indice: 0, errouEsta: false };
    jogo.totalPerguntas = perguntas.length;
    jogo.acertosPrimeira = 0;
    if (!perguntas.length) { abrirPortal(); return; }
    abrirModal('modal-quiz');
    mostrarPergunta();
  }

  function mostrarPergunta() {
    var qz = jogo.quiz;
    var q = qz.lista[qz.indice];
    qz.errouEsta = false;
    var bolinhas = '';
    for (var i = 0; i < qz.lista.length; i++) bolinhas += i < qz.indice ? '🟢' : (i === qz.indice ? '🟡' : '⚪');
    $('quiz-progresso').innerHTML = '<span aria-hidden="true">' + bolinhas + '</span>';
    $('quiz-progresso').setAttribute('aria-label', 'Pergunta ' + (qz.indice + 1) + ' de ' + qz.lista.length);
    $('quiz-imagem').textContent = q.imagem || '';
    $('quiz-pergunta').textContent = q.pergunta;
    $('quiz-retorno').hidden = true;

    var area = $('quiz-opcoes');
    area.innerHTML = '';
    embaralhar(q.respostas).forEach(function (r, i) {
      var b = document.createElement('button');
      b.className = 'opcao';
      b.dataset.numero = String(i + 1);
      var img = r.imagem ? '<span class="opcao-imagem' + (Array.from(r.imagem).length > 3 ? ' longa' : '') + '" aria-hidden="true">' + escapar(r.imagem) + '</span>' : '';
      b.innerHTML = '<span class="opcao-numero" aria-hidden="true">' + (i + 1) + '</span>' + img +
        (r.texto ? '<span class="opcao-texto">' + escapar(r.texto) + '</span>' : '');
      if (!r.texto) b.setAttribute('aria-label', 'Alternativa ' + (i + 1));
      b.addEventListener('click', function () { responder(b, r, q); });
      area.appendChild(b);
    });
  }

  function escapar(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  function responder(botao, resposta, q) {
    var qz = jogo.quiz;
    if (botao.disabled || !$('quiz-retorno').hidden) return;
    var retorno = $('quiz-retorno');
    var botaoRetorno = $('retorno-botao');
    if (resposta.certa) {
      if (!qz.errouEsta) jogo.acertosPrimeira++;
      botao.classList.add('certa');
      var opcoes = $('quiz-opcoes').querySelectorAll('.opcao');
      for (var i = 0; i < opcoes.length; i++) opcoes[i].disabled = true;
      retorno.className = 'quiz-retorno bom';
      $('retorno-titulo').textContent = qz.errouEsta ? '✔ Agora acertou!' : '🎉 Muito bem!';
      $('retorno-imagem').textContent = q.imagemExplicacao || '';
      $('retorno-texto').textContent = q.explicacao || '';
      var ultima = qz.indice === qz.lista.length - 1;
      botaoRetorno.textContent = ultima ? 'Abrir o portal ✨' : 'Próxima pergunta ➜';
      botaoRetorno.onclick = function () {
        if (ultima) { fecharModal('modal-quiz'); abrirPortal(); }
        else { qz.indice++; mostrarPergunta(); }
      };
      Som.tocar('certo');
    } else {
      qz.errouEsta = true;
      botao.classList.add('errada');
      botao.disabled = true;
      retorno.className = 'quiz-retorno ruim';
      $('retorno-titulo').textContent = '🤔 Quase! Vamos aprender:';
      $('retorno-imagem').textContent = q.imagemExplicacao || '';
      $('retorno-texto').textContent = q.explicacao || 'Tente outra resposta.';
      botaoRetorno.textContent = '↺ Tentar de novo';
      botaoRetorno.onclick = function () {
        retorno.hidden = true;
        var primeira = $('quiz-opcoes').querySelector('.opcao:not([disabled])');
        if (primeira) primeira.focus();
      };
      Som.tocar('errado');
    }
    retorno.hidden = false;
    botaoRetorno.focus();
    retorno.parentNode.scrollTop = 0;
  }

  function abrirPortal() {
    jogo.portalAberto = true;
    jogo.estado = 'saindo';
    jogo.saida = 0;
    aviso('O portal abriu! ✨', 'bom');
    Som.tocar('vitoria');
    if (document.activeElement) document.activeElement.blur();
  }

  /* ================= Resultado e estrelas ================= */
  function mostrarResultado() {
    var g = jogo, f = g.fase;
    var ganhouItens = g.coletados >= f.metaItens;
    var ganhouAcertos = g.totalPerguntas === 0 || g.acertosPrimeira === g.totalPerguntas;
    var estrelas = 1 + (ganhouItens ? 1 : 0) + (ganhouAcertos ? 1 : 0);
    var chave = anoAtual.ano + '-' + faseAtual;
    progresso.estrelas[chave] = Math.max(progresso.estrelas[chave] || 0, estrelas);
    salvarProgresso();

    $('resultado-titulo').textContent = estrelas === 3 ? 'Incrível! Fase completa!' : 'Fase completa!';
    var html = '';
    for (var i = 0; i < 3; i++) html += '<span class="' + (i < estrelas ? 'estrela-cheia' : 'estrela-vazia') + '">★</span>';
    $('resultado-estrelas').innerHTML = html;
    $('resultado-estrelas').setAttribute('aria-label', estrelas + ' estrelas');

    var nomeItens = AMBIENTES[g.ambiente].nomeItens;
    var linhas = [
      [true, 'Chegou ao portal'],
      [ganhouItens, 'Pegou ' + g.coletados + ' de ' + f.totalItens + ' ' + nomeItens + (ganhouItens ? '' : ' (meta: ' + f.metaItens + ')')],
      [ganhouAcertos, g.totalPerguntas === 0 ? 'Portal sem perguntas'
        : 'Acertou de primeira ' + g.acertosPrimeira + ' de ' + g.totalPerguntas + ' perguntas']
    ];
    $('resultado-lista').innerHTML = linhas.map(function (l) {
      return '<li class="' + (l[0] ? 'ganhou' : 'faltou') + '"><span class="marca" aria-hidden="true">' +
        (l[0] ? '⭐' : '☆') + '</span>' + l[1] + '</li>';
    }).join('');

    var temProxima = faseAtual < anoAtual.fases.length - 1;
    $('resultado-proxima').hidden = !temProxima;
    mostrarTela('tela-resultado');
    (temProxima ? $('resultado-proxima') : $('resultado-mapa')).focus();
  }

  /* ================= Área do professor ================= */
  var contaProfessor = 0;
  function abrirProfessor() {
    var a = 5 + Math.floor(Math.random() * 5);
    var b = 5 + Math.floor(Math.random() * 5);
    contaProfessor = a + b;
    $('professor-conta').textContent = 'Quanto é ' + a + ' + ' + b + '?';
    $('professor-resposta').value = '';
    $('professor-erro').textContent = '';
    $('professor-trava').hidden = false;
    $('professor-painel').hidden = true;
    $('professor-confirmar').hidden = true;
    $('professor-mensagem').textContent = '';
    abrirModal('modal-professor');
    $('professor-resposta').focus();
  }

  function listarPerguntasProfessor() {
    var html = '';
    ANOS.forEach(function (a) {
      html += '<p><b>' + a.nome + '</b></p><ul>';
      a.fases.forEach(function (f) {
        if (f.temas.length > 1) return;
        var n = (banco[f.temas[0]] || []).length;
        html += '<li>' + escapar(f.titulo) + ': ' + n + ' perguntas</li>';
      });
      html += '</ul>';
    });
    if (perguntasComErro) {
      html = '<p class="problema">O arquivo perguntas.js não pôde ser lido. Confira vírgulas, aspas e chaves.</p>';
    } else if (problemasPerguntas.length) {
      html += '<p class="problema"><b>Perguntas com problema (foram puladas):</b></p><ul>' +
        problemasPerguntas.map(function (p) { return '<li class="problema">' + escapar(p) + '</li>'; }).join('') + '</ul>';
    }
    $('professor-lista-perguntas').innerHTML = html;
  }

  $('professor-trava').addEventListener('submit', function (e) {
    e.preventDefault();
    if (parseInt($('professor-resposta').value, 10) === contaProfessor) {
      $('professor-trava').hidden = true;
      $('professor-painel').hidden = false;
      listarPerguntasProfessor();
      $('professor-liberar').focus();
    } else {
      $('professor-erro').textContent = 'Resposta errada. Tente de novo.';
      $('professor-resposta').select();
    }
  });
  $('professor-liberar').addEventListener('click', function () {
    progresso.liberarTudo = true;
    salvarProgresso();
    $('professor-confirmar').hidden = true;
    $('professor-mensagem').textContent = '✔ Todas as fases foram liberadas neste computador.';
    montarInicio();
  });
  $('professor-apagar').addEventListener('click', function () {
    $('professor-mensagem').textContent = '';
    $('professor-confirmar').hidden = false;
    $('professor-confirmar-nao').focus();
  });
  $('professor-confirmar-nao').addEventListener('click', function () {
    $('professor-confirmar').hidden = true;
  });
  $('professor-confirmar-sim').addEventListener('click', function () {
    progresso = { estrelas: {}, liberarTudo: false };
    try { localStorage.removeItem(CHAVE_PROGRESSO); } catch (e) { /* ignora */ }
    $('professor-confirmar').hidden = true;
    $('professor-mensagem').textContent = '✔ Progresso apagado. O jogo começa do zero.';
    montarInicio();
  });
  var botoesFecharProfessor = document.querySelectorAll('[data-fechar-professor]');
  for (var bf = 0; bf < botoesFecharProfessor.length; bf++) {
    botoesFecharProfessor[bf].addEventListener('click', function () {
      fecharModal('modal-professor');
      if ($('tela-mapa').classList.contains('ativa') && anoAtual) abrirMapa(anoAtual);
    });
  }
  $('btn-professor').addEventListener('click', abrirProfessor);

  /* ================= Botões ================= */
  var botoesAjuda = document.querySelectorAll('[data-abrir-ajuda]');
  for (var ba = 0; ba < botoesAjuda.length; ba++) {
    botoesAjuda[ba].addEventListener('click', function () {
      $('ajuda-itens').innerHTML = ['semente', 'gota', 'folha', 'estrela'].map(function (t) {
        return '<img src="' + Desenho.iconeItem(t, 92) + '" alt="">';
      }).join('');
      $('ajuda-obstaculos').innerHTML = ['abelha', 'tronco', 'galinha', 'morcego'].map(function (t) {
        return '<img src="' + Obstaculos.icone(t, 80) + '" alt="">';
      }).join('');
      abrirModal('modal-ajuda');
      $('ajuda-fechar').focus();
    });
  }
  $('ajuda-fechar').addEventListener('click', function () {
    fecharModal('modal-ajuda');
    if (!$('modal-pausa').hidden) $('pausa-continuar').focus();
  });

  var botoesSom = document.querySelectorAll('.btn-som');
  for (var bs = 0; bs < botoesSom.length; bs++) {
    botoesSom[bs].addEventListener('click', function () {
      Som.ligado = !Som.ligado;
      atualizarBotoesSom();
      Som.tocar('item');
    });
  }

  $('btn-desafio').addEventListener('click', function () {
    modoDesafio = !modoDesafio;
    try { localStorage.setItem(CHAVE_DESAFIO, modoDesafio ? 'sim' : 'nao'); } catch (e) { /* ignora */ }
    atualizarBotaoDesafio();
  });
  $('mapa-voltar').addEventListener('click', function () { montarInicio(); mostrarTela('tela-inicio'); });
  $('prefase-voltar').addEventListener('click', function () { abrirMapa(anoAtual); });
  $('prefase-comecar').addEventListener('click', comecarFase);
  $('btn-pausa').addEventListener('click', pausar);
  $('pausa-continuar').addEventListener('click', continuar);
  $('pausa-recomecar').addEventListener('click', function () {
    fecharModal('modal-pausa');
    comecarFase();
  });
  $('pausa-sair').addEventListener('click', function () {
    fecharModal('modal-pausa');
    jogo = null;
    abrirMapa(anoAtual);
  });
  $('resultado-mapa').addEventListener('click', function () { abrirMapa(anoAtual); });
  $('resultado-repetir').addEventListener('click', function () { abrirPreFase(faseAtual); });
  $('resultado-proxima').addEventListener('click', function () { abrirPreFase(faseAtual + 1); });

  /* ================= Teclado ================= */
  function jogoAtivo() { return $('tela-jogo').classList.contains('ativa') && jogo; }

  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (!$('modal-professor').hidden) {
      if (k === 'Escape') fecharModal('modal-professor');
      return;
    }
    if (!$('modal-ajuda').hidden) {
      if (k === 'Escape') { e.preventDefault(); $('ajuda-fechar').click(); }
      return;
    }
    if (!$('modal-quiz').hidden) {
      if (/^[1-3]$/.test(k) && $('quiz-retorno').hidden) {
        var b = $('quiz-opcoes').querySelector('[data-numero="' + k + '"]');
        if (b && !b.disabled) b.click();
      }
      return;
    }
    if (!jogoAtivo()) return;
    if (jogo.estado === 'pausa') {
      if (k === 'Escape' || k === 'p' || k === 'P') { e.preventDefault(); continuar(); }
      return;
    }
    var usada = true;
    if (k === 'ArrowLeft' || k === 'Left') teclas.esq = true;
    else if (k === 'ArrowRight' || k === 'Right') teclas.dir = true;
    else if (k === 'ArrowUp' || k === 'Up' || k === ' ' || k === 'Spacebar') {
      if (!e.repeat && jogo.estado === 'jogando') jogo.robo.pedidoPulo = 0.15;
    } else if (k === 'p' || k === 'P' || k === 'Escape') pausar();
    else if (k === 'ArrowDown' || k === 'Down') { /* nada, só evita rolar a página */ }
    else usada = false;
    if (usada) e.preventDefault();
  });

  document.addEventListener('keyup', function (e) {
    var k = e.key;
    if (k === 'ArrowLeft' || k === 'Left') teclas.esq = false;
    if (k === 'ArrowRight' || k === 'Right') teclas.dir = false;
    if (jogoAtivo() && (k === ' ' || k === 'Spacebar')) e.preventDefault();
  });

  // Se a janela perder o foco, pausa o jogo (por exemplo, ao trocar de programa)
  window.addEventListener('blur', function () {
    teclas.esq = teclas.dir = false;
    if (jogoAtivo() && jogo.estado === 'jogando') pausar();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && jogoAtivo() && jogo.estado === 'jogando') pausar();
  });
  window.addEventListener('resize', function () {
    if (jogoAtivo()) ajustarCanvas();
  });

  // Usado só pelos testes automáticos (endereço terminado em ?teste)
  if (/[?&]teste\b/.test(location.search)) window.estadoDoJogo = function () { return jogo; };

  /* ================= Começo ================= */
  $('logo-robo').src = Desenho.iconeRobo(220);
  atualizarBotoesSom();
  atualizarBotaoDesafio();
  montarInicio();

  // Guarda os arquivos para o jogo abrir mesmo sem internet
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.register('sw.js').catch(function () { /* sem problema */ });
  }
})();
