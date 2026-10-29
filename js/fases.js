/*
 * Robô Explorador — anos, fases e construção dos cenários.
 * As perguntas ficam em perguntas.js (na pasta principal).
 */

var TILE = 48;
var LARGURA_JOGO = 960;
var ALTURA_JOGO = 540;

var TEMAS_ANO1 = ['ano1-sentidos', 'ano1-higiene', 'ano1-dia-noite', 'ano1-materiais'];
var TEMAS_ANO2 = ['ano2-vivos', 'ano2-plantas', 'ano2-animais', 'ano2-luz-sombra'];
var TEMAS_ANO3 = ['ano3-ciclo-vida', 'ano3-som-visao', 'ano3-solo', 'ano3-terra-sol-lua'];

var ANOS = [
  {
    ano: 1, nome: '1º ano', cor: '#c62828', perguntasPorPortal: 2,
    fases: [
      { titulo: 'O corpo e os sentidos', temas: ['ano1-sentidos'], ambiente: 'jardim' },
      { titulo: 'Hábitos de higiene', temas: ['ano1-higiene'], ambiente: 'rio' },
      { titulo: 'Dia e noite', temas: ['ano1-dia-noite'], ambiente: 'noite' },
      { titulo: 'De que são feitas as coisas?', temas: ['ano1-materiais'], ambiente: 'fazenda' },
      { titulo: 'Grande revisão', temas: TEMAS_ANO1, ambiente: 'floresta' }
    ]
  },
  {
    ano: 2, nome: '2º ano', cor: '#1565c0', perguntasPorPortal: 3,
    fases: [
      { titulo: 'Seres vivos e não vivos', temas: ['ano2-vivos'], ambiente: 'rio' },
      { titulo: 'As plantas', temas: ['ano2-plantas'], ambiente: 'jardim' },
      { titulo: 'Os animais', temas: ['ano2-animais'], ambiente: 'floresta' },
      { titulo: 'Luz e sombra', temas: ['ano2-luz-sombra'], ambiente: 'noite' },
      { titulo: 'Grande revisão', temas: TEMAS_ANO2, ambiente: 'fazenda' }
    ]
  },
  {
    ano: 3, nome: '3º ano', cor: '#2e7d32', perguntasPorPortal: 3,
    fases: [
      { titulo: 'O ciclo de vida dos animais', temas: ['ano3-ciclo-vida'], ambiente: 'fazenda' },
      { titulo: 'O som, a audição e a visão', temas: ['ano3-som-visao'], ambiente: 'floresta' },
      { titulo: 'O solo', temas: ['ano3-solo'], ambiente: 'jardim' },
      { titulo: 'A Terra, o Sol e a Lua', temas: ['ano3-terra-sol-lua'], ambiente: 'noite' },
      { titulo: 'Grande revisão', temas: TEMAS_ANO3, ambiente: 'rio' }
    ]
  }
];

/*
 * Peças que formam o caminho de cada fase. O 1º ano tem poucos buracos, todos curtos.
 * Física do robô (jogo.js): pulo sobe ~150 px (3 blocos) e alcança ~170 px (3,5 blocos).
 * Os obstáculos de cada ambiente (js/obstaculos.js) entram no meio dessas peças.
 */
var DIFICULDADE = {
  1: {
    pecas: ['plano', 'buraco', 'caixa', 'plataforma', 'degrau', 'plano', 'buraco', 'plataforma', 'degrau', 'caixa', 'buraco'],
    buraco: [1, 2], degrau: 1, alturaPlataforma: 2, alturaCaixa: 1, bandeiras: 2
  },
  2: {
    pecas: ['plano', 'buraco', 'caixa', 'plataforma', 'ponte', 'buraco', 'movel', 'degrau'],
    buraco: [2, 3], degrau: 2, alturaPlataforma: 2.5, alturaCaixa: 1, bandeiras: 3
  },
  3: {
    pecas: ['buraco', 'caixa', 'plataforma', 'degrau', 'ponte', 'movel', 'buracoLongo', 'buracoLongo'],
    buraco: [2, 3], degrau: 2, alturaPlataforma: 2.5, alturaCaixa: 2, bandeiras: 4
  }
};

function criarSorteio(semente) {
  var s = semente >>> 0;
  return function () {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function inteiroEntre(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

/*
 * Monta o cenário de uma fase. Sempre o mesmo cenário para o mesmo ano, fase e modo.
 * opcoes.desafio: Modo Desafio (obstáculos mais rápidos e numerosos)
 * opcoes.calmo: movimento reduzido (obstáculos mais lentos)
 */
function construirFase(ano, indice, decoracoes, opcoes) {
  opcoes = opcoes || {};
  var desafio = !!opcoes.desafio;
  var d = DIFICULDADE[ano];
  var ambiente = ANOS[ano - 1].fases[indice].ambiente;
  var plano = Obstaculos.plano(ano, ambiente, desafio);
  var vel = Obstaculos.fatorVelocidade(ano, desafio, !!opcoes.calmo);
  var rng = criarSorteio(ano * 1000 + indice * 37 + 11 + (desafio ? 500 : 0));
  var pecas = d.pecas.slice();
  for (var i = pecas.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = pecas[i]; pecas[i] = pecas[j]; pecas[j] = tmp;
  }

  var f = {
    segmentos: [], caixas: [], plataformas: [], itens: [],
    bandeiras: [], buracos: [], decoracoes: [], solidos: [],
    obstaculos: [], placas: [], rasos: [], tiposObstaculos: plano.tipos.slice()
  };
  var cx = 0;       // posição atual, em blocos
  var nivel = 2;    // altura do chão, em blocos

  function topo() { return ALTURA_JOGO - nivel * TILE; }
  function chao(w) {
    var ultimo = f.segmentos[f.segmentos.length - 1];
    if (ultimo && ultimo.y === topo() && ultimo.x + ultimo.w === cx * TILE) ultimo.w += w * TILE;
    else f.segmentos.push({ x: cx * TILE, y: topo(), w: w * TILE });
    cx += w;
  }
  function item(xBlocos, y) { f.itens.push({ x: xBlocos * TILE, y: y, pego: false }); }
  function linhaDeItens(inicio, n, y) {
    for (var k = 0; k < n; k++) item(inicio + k + 0.5, y);
  }
  function arcoDeItens(xIni, xFim, base) {
    var alturas = [70, 115, 70];
    for (var k = 0; k < 3; k++) f.itens.push({ x: xIni + (xFim - xIni) * k / 2, y: base - alturas[k], pego: false });
  }
  function buraco(largura) {
    f.buracos.push({ x: cx * TILE, w: largura * TILE });
    cx += largura;
  }
  function bandeira() {
    f.bandeiras.push({ x: cx * TILE + TILE / 2, y: topo(), ativa: false });
  }
  // Na primeira vez, o vão é raso: quem cair só desce um degrau e sobe de novo.
  function vao(largura, seguro) {
    if (!seguro) { buraco(largura); return; }
    nivel -= 1;
    f.rasos.push({ x: cx * TILE, w: largura * TILE, y: topo() });
    chao(largura);
    nivel += 1;
  }

  var PECAS = {
    plano: function () {
      var w = inteiroEntre(rng, 4, 6);
      linhaDeItens(cx + Math.floor((w - 3) / 2), 3, topo() - 44);
      chao(w);
    },
    buraco: function () {
      chao(2);
      var g = inteiroEntre(rng, d.buraco[0], d.buraco[1]);
      arcoDeItens((cx - 0.5) * TILE, (cx + g + 0.5) * TILE, topo());
      buraco(g);
      chao(3);
    },
    // Salto longo (3º ano): 3,5 blocos, chegando 2 degraus mais baixo
    buracoLongo: function () {
      if (nivel < 3) { nivel += 2; chao(3); }
      chao(2);
      arcoDeItens((cx - 0.5) * TILE, (cx + 4) * TILE, topo());
      buraco(3.5);
      nivel -= 2;
      chao(4);
    },
    degrau: function () {
      var s = inteiroEntre(rng, 1, d.degrau);
      var direcao = rng() < 0.6 ? 1 : -1;
      if (nivel + s * direcao > 4) direcao = -1;
      if (nivel + s * direcao < 1) direcao = 1;
      nivel += s * direcao;
      linhaDeItens(cx + 1, 2, topo() - 44);
      chao(4);
    },
    caixa: function () {
      chao(2);
      var h = d.alturaCaixa * TILE;
      var c = { x: cx * TILE, y: topo() - h, w: TILE, h: h };
      f.caixas.push(c);
      item(cx + 0.5, c.y - 50);
      chao(4);
    },
    plataforma: function () {
      var x = cx + 2;
      var p = { x: x * TILE, y: topo() - d.alturaPlataforma * TILE, w: 3 * TILE, h: 18 };
      f.plataformas.push(p);
      linhaDeItens(x, 3, p.y - 34);
      chao(10); // espaço depois da plataforma para não cair direto no próximo buraco
    },
    ponte: function () {
      chao(1);
      var g = 5;
      var p = { x: (cx + 1.5) * TILE, y: topo() - TILE * 0.5, w: 2 * TILE, h: 18 };
      f.plataformas.push(p);
      linhaDeItens(cx + 1.5, 2, p.y - 34);
      buraco(g);
      chao(3);
    },
    movel: function () {
      chao(1);
      var g = 5;
      var p = {
        x: cx * TILE + 4, y: topo(), w: 2 * TILE, h: 18,
        movel: { de: cx * TILE + 4, ate: (cx + g - 2) * TILE - 4, vel: 100, sentido: 1 }
      };
      f.plataformas.push(p);
      linhaDeItens(cx + 1.5, 2, topo() - 70);
      buraco(g);
      chao(3);
    }
  };

  /* ---------- Obstáculos (seguro = primeira vez, sozinho) ---------- */
  function obstaculo(o) { o.aviso = ano === 1; o.desafio = desafio; f.obstaculos.push(o); return o; }

  // Obstáculo que voa ou cai por cima de outro trecho (combinações)
  function sobrepor(tipo, xIni, xFim, base) {
    if (tipo === 'abelha') {
      // a abelha descansa um pouco antes do trecho (atrás do robô), dando tempo de passar
      obstaculo({ tipo: 'abelha', de: xIni - 40, ate: xFim - 10, x: xFim - 10, sentido: -1, y: base - 118, vel: 45 * vel, paradaEsquerda: 2.5 });
    } else if (tipo === 'morcego') {
      obstaculo({ tipo: 'morcego', de: xIni - 40, ate: xFim - 10, x: xIni - 40, sentido: 1, yBase: base - 125, amp: 22, vel: 45 * vel, ritmo: vel, paradaEsquerda: 2.5 });
    } else if (tipo === 'feno' || tipo === 'meteoro') {
      obstaculo({ tipo: tipo, x: (xIni + xFim) / 2, yChao: base, espera: Math.max(1.1, 2.2 / vel), atraso: 0.7 });
    }
  }

  var OBST = {
    espinhos: function (seguro, sobre) {
      var w = (!seguro && (ano === 3 || desafio)) ? 2 : 1;
      chao(1);
      var x0 = cx;
      chao(w + 2);
      obstaculo({ tipo: 'espinhos', x: (x0 + 1) * TILE + 4, y: topo(), w: w * TILE - 8 });
      arcoDeItens((x0 + 0.5) * TILE, (x0 + w + 1.5) * TILE, topo());
      if (sobre) sobrepor(sobre, x0 * TILE, (x0 + w + 2) * TILE, topo());
      chao(1);
    },
    lama: function (seguro, sobre) {
      chao(1);
      var x0 = cx, L = seguro ? 3 : 4;
      chao(L);
      obstaculo({ tipo: 'lama', x: x0 * TILE, y: topo(), w: L * TILE });
      linhaDeItens(x0, L, topo() - 44);
      if (sobre) sobrepor(sobre, x0 * TILE, (x0 + L) * TILE, topo());
      chao(1);
    },
    abelha: function (seguro, sobre) {
      chao(1);
      var x0 = cx, L = 5;
      chao(L);
      obstaculo({ tipo: 'abelha', de: (x0 + 0.4) * TILE, ate: (x0 + L - 0.4) * TILE, x: (x0 + L - 0.4) * TILE, sentido: -1, y: topo() - 32, vel: 60 * vel });
      arcoDeItens((x0 + 1) * TILE, (x0 + L - 1) * TILE, topo() - 20);
      if (sobre) sobrepor(sobre, x0 * TILE, (x0 + L) * TILE, topo());
      chao(1);
    },
    tronco: function (seguro, sobre) {
      chao(1);
      var x0 = cx, L = 7;
      chao(L);
      obstaculo({ tipo: 'tronco', de: x0 * TILE, ate: (x0 + L) * TILE, x: (x0 + L) * TILE, y: topo(), raio: 18, vel: 85 * vel, espera: 0.6, giro: 0 });
      arcoDeItens((x0 + 2) * TILE, (x0 + 5) * TILE, topo());
      if (sobre) sobrepor(sobre, x0 * TILE, (x0 + L) * TILE, topo());
      chao(1);
    },
    galinha: function (seguro, sobre) {
      chao(1);
      var x0 = cx, L = 5;
      chao(L);
      obstaculo({ tipo: 'galinha', de: (x0 + 0.4) * TILE, ate: (x0 + L - 0.4) * TILE, x: (x0 + 0.4) * TILE, sentido: 1, y: topo(), vel: 70 * vel });
      arcoDeItens((x0 + 1) * TILE, (x0 + L - 1) * TILE, topo());
      if (sobre) sobrepor(sobre, x0 * TILE, (x0 + L) * TILE, topo());
      chao(1);
    },
    cerca: function (seguro, sobre) {
      chao(2);
      var x0 = cx;
      var h = (ano === 1 || seguro) ? TILE : TILE * 1.5;
      f.caixas.push({ x: cx * TILE, y: topo() - h, w: TILE, h: h, aparencia: 'cerca' });
      item(cx + 0.5, topo() - h - 50);
      chao(4);
      if (sobre) sobrepor(sobre, (x0 + 1) * TILE, (x0 + 4) * TILE, topo());
    },
    feno: function (seguro, sobre) {
      chao(1);
      var x0 = cx, L = 5;
      chao(L);
      obstaculo({ tipo: 'feno', x: (x0 + L / 2) * TILE, yChao: topo(), espera: Math.max(1.1, 2.2 / vel), atraso: 0 });
      if (!seguro && (ano === 3 || desafio)) {
        obstaculo({ tipo: 'feno', x: (x0 + 1) * TILE, yChao: topo(), espera: Math.max(1.1, 2.2 / vel), atraso: 0.4 }); // cai logo depois do outro: dá para passar pelos dois juntos
      }
      linhaDeItens(x0 + 1, 3, topo() - 44);
      if (sobre) sobrepor(sobre, x0 * TILE, (x0 + L) * TILE, topo());
      chao(1);
    },
    morcego: function (seguro, sobre) {
      chao(1);
      var x0 = cx, L = 6;
      chao(L);
      obstaculo({ tipo: 'morcego', de: (x0 + 0.4) * TILE, ate: (x0 + L - 0.4) * TILE, x: (x0 + L - 0.4) * TILE, sentido: -1, yBase: topo() - 75, amp: 32, vel: 65 * vel, ritmo: vel, paradaEsquerda: 1.5 });
      linhaDeItens(x0 + 1, 4, topo() - 44);
      if (sobre) sobrepor(sobre, x0 * TILE, (x0 + L) * TILE, topo());
      chao(1);
    },
    meteoro: function (seguro, sobre) {
      chao(1);
      var x0 = cx, L = 5;
      chao(L);
      obstaculo({ tipo: 'meteoro', x: (x0 + L / 2) * TILE, yChao: topo(), espera: Math.max(1.1, 2.2 / vel), atraso: 0 });
      if (!seguro && (ano === 3 || desafio)) {
        obstaculo({ tipo: 'meteoro', x: (x0 + 1) * TILE, yChao: topo(), espera: Math.max(1.1, 2.2 / vel), atraso: 0.4 }); // cai logo depois do outro: dá para passar pelos dois juntos
      }
      linhaDeItens(x0 + 1, 3, topo() - 44);
      if (sobre) sobrepor(sobre, x0 * TILE, (x0 + L) * TILE, topo());
      chao(1);
    },
    correnteza: function (seguro, sobre) {
      chao(1);
      var x0 = cx, L = 6;
      chao(L);
      obstaculo({ tipo: 'correnteza', x: x0 * TILE, y: topo(), w: L * TILE, forca: Math.min(160, 110 * vel) });
      linhaDeItens(x0 + 1, 4, topo() - 44);
      if (sobre) sobrepor(sobre, x0 * TILE, (x0 + L) * TILE, topo());
      chao(1);
    },
    galho: function (seguro, sobre) {
      chao(1);
      var dois = !seguro && (ano === 3 || desafio);
      var g = dois ? 6 : 5;
      var y = topo() - 12;
      var tempo = ({ 1: 1.4, 2: 0.95, 3: 0.75 })[ano] * (desafio ? 0.75 : 1) * (opcoes.calmo ? 1.4 : 1);
      // um pulo inteiro sempre termina num galho ou no chão, nunca no meio do buraco
      var trechos = dois ? [[1, 1.75], [3.5, 1.75]] : [[1.25, 2.5]];
      trechos.forEach(function (tr) {
        var p = { x: (cx + tr[0]) * TILE, y: y, y0: y, w: tr[1] * TILE, h: 14, galho: { estado: 'ok', t: 0, tempo: tempo } };
        f.plataformas.push(p);
        item(cx + tr[0] + tr[1] / 2, y - 40);
      });
      var xIni = cx * TILE;
      vao(g, seguro);
      if (sobre) sobrepor(sobre, xIni, cx * TILE, topo());
      chao(3);
    },
    cipo: function (seguro, sobre) {
      chao(1);
      var g = 6;
      var o = obstaculo({ tipo: 'cipo', px: (cx + g / 2) * TILE, py: topo() - 270, comp: 205, amp: 0.62, periodo: 2.8 / Math.min(1.25, vel), ang: 0 });
      for (var k = -1; k <= 1; k++) f.itens.push({ x: o.px + k * 100, y: topo() - 120 + Math.abs(k) * 10, pego: false });
      var xIni = cx * TILE;
      vao(g, seguro);
      if (sobre) sobrepor(sobre, xIni, cx * TILE, topo());
      chao(3);
    },
    pedra: function (seguro, sobre) {
      chao(1);
      var g = 5;
      var prof = seguro ? TILE + 10 : Math.max(50, ALTURA_JOGO - 40 - topo());
      var ciclo = 4.4 / vel;
      [[1, 0], [3, 0.7]].forEach(function (pp) { // a segunda pedra sobe pouco depois da primeira
        var p = { x: (cx + pp[0]) * TILE, y: topo(), y0: topo(), w: TILE, h: 22, pedra: { ciclo: ciclo, desloc: pp[1], prof: prof } };
        f.plataformas.push(p);
        item(cx + pp[0] + 0.5, topo() - 50);
      });
      var xIni = cx * TILE;
      vao(g, seguro);
      if (sobre) sobrepor(sobre, xIni, cx * TILE, topo());
      chao(3);
    },
    troncoBoia: function (seguro, sobre) {
      chao(1);
      var g = 5;
      var p = {
        x: cx * TILE + 4, y: topo(), w: 2 * TILE, h: 16, aparencia: 'tronco',
        movel: { de: cx * TILE + 4, ate: (cx + g - 2) * TILE - 4, vel: 75 * vel, sentido: 1 }
      };
      f.plataformas.push(p);
      linhaDeItens(cx + 1.5, 2, topo() - 70);
      var xIni = cx * TILE;
      vao(g, seguro);
      if (sobre) sobrepor(sobre, xIni, cx * TILE, topo());
      chao(3);
    },
    estrela: function (seguro, sobre) {
      chao(1);
      var um = ano === 1 && !desafio;
      var g = um ? 4 : 5;
      var y = topo() - 24;
      var acesa = (um ? 3.2 : 2.4) / Math.max(1, vel), apagada = 1.4;
      var trechos = um ? [[1, 2]] : [[0.9, 1.2], [2.9, 1.2]];
      trechos.forEach(function (tr, k) {
        var desloc = (!seguro && (ano === 3 || desafio) && k === 1) ? 0.25 : 0;
        f.plataformas.push({ x: (cx + tr[0]) * TILE, y: y, w: tr[1] * TILE, h: 18, solida: true, estrela: { acesa: acesa, apagada: apagada, desloc: desloc } });
        item(cx + tr[0] + tr[1] / 2, y - 40);
      });
      var xIni = cx * TILE;
      vao(g, seguro);
      if (sobre) sobrepor(sobre, xIni, cx * TILE, topo());
      chao(3);
    }
  };

  // Primeira vez de um obstáculo: bandeira, trecho seguro, placa com balão explicando
  function apresentar(tipo) {
    chao(2);
    bandeira();
    chao(2);
    var placa = { tipo: tipo, x: cx * TILE - TILE / 2, y: topo() };
    var antes = f.obstaculos.length;
    OBST[tipo](true);
    for (var k = antes; k < f.obstaculos.length; k++) f.obstaculos[k].aviso = true;
    placa.xFim = cx * TILE;
    f.placas.push(placa);
    chao(2);
  }

  // Obstáculos misturados (depois que todos já foram apresentados)
  function misturado(n) {
    var tipos = plano.tipos;
    var base = tipos[n % tipos.length];
    if (plano.combinar) {
      var opcoesSobre = tipos.filter(function (t) { return Obstaculos.podeSobrepor(t, base); });
      if (opcoesSobre.length) { OBST[base](false, opcoesSobre[n % opcoesSobre.length]); return; }
      OBST[base](false);
      OBST[tipos[(n + 1) % tipos.length]](false);
      return;
    }
    OBST[base](false);
  }

  // Ordem: peças do caminho, com as apresentações no começo e as misturas depois
  var sequencia = [];
  var N = pecas.length, k = plano.tipos.length, m = plano.extras;
  var lugarApresentacao = {}, lugarMistura = {};
  plano.tipos.forEach(function (t, q) {
    var pos = Math.max(1, Math.round((q + 1) * (0.55 * N) / (k + 1)));
    (lugarApresentacao[pos] = lugarApresentacao[pos] || []).push(t);
  });
  for (var q = 0; q < m; q++) {
    var pos = Math.round(0.55 * N + (q + 1) * (0.45 * N) / (m + 1));
    (lugarMistura[pos] = lugarMistura[pos] || []).push(q);
  }
  pecas.forEach(function (p, idx) {
    (lugarApresentacao[idx] || []).forEach(function (t) { sequencia.push({ apresentar: t }); });
    (lugarMistura[idx] || []).forEach(function (n) { sequencia.push({ misturado: n }); });
    sequencia.push({ peca: p });
  });
  (lugarMistura[N] || []).forEach(function (n) { sequencia.push({ misturado: n }); });

  // Começo
  chao(7);
  linhaDeItens(3, 3, topo() - 44);
  f.inicio = { x: 2 * TILE, y: topo() };

  // Bandeiras extras espalhadas (mais bandeiras nos anos e modos mais difíceis)
  var nBandeiras = d.bandeiras + (desafio ? 1 : 0);
  var marcas = [];
  for (var b = 1; b <= nBandeiras; b++) marcas.push(Math.floor(b * sequencia.length / (nBandeiras + 1)));

  sequencia.forEach(function (s, idx) {
    if (marcas.indexOf(idx) >= 0 && !s.apresentar) {
      chao(1);
      bandeira();
      chao(3);
    }
    if (s.apresentar) apresentar(s.apresentar);
    else if (s.misturado != null) misturado(s.misturado);
    else PECAS[s.peca]();
  });

  // Final com o portal
  chao(4);
  f.portal = { x: (cx + 3) * TILE, y: topo() };
  chao(10);
  f.largura = cx * TILE;

  // Tudo o que é sólido (chão, caixas e cercas)
  f.segmentos.forEach(function (s) {
    f.solidos.push({ x: s.x, y: s.y, w: s.w, h: ALTURA_JOGO - s.y + 400 });
  });
  f.caixas.forEach(function (c) { f.solidos.push(c); });

  // Enfeites do cenário (flores, árvores...), longe dos obstáculos
  if (decoracoes && decoracoes.length) {
    var ocupado = function (x) {
      return f.obstaculos.some(function (o) {
        var a = o.de != null ? o.de : (o.x != null ? o.x : o.px - 150);
        var z = o.ate != null ? o.ate : (o.w ? o.x + o.w : a + 300);
        return x > a - 30 && x < z + 30;
      }) || f.placas.some(function (pl) { return Math.abs(x - pl.x) < 40; });
    };
    f.segmentos.forEach(function (s) {
      for (var x = s.x + TILE * 0.5; x < s.x + s.w - TILE * 0.5; x += TILE) {
        if (rng() < 0.4 && !ocupado(x)) {
          f.decoracoes.push({ x: x + rng() * 20 - 10, y: s.y, tipo: decoracoes[Math.floor(rng() * decoracoes.length)], v: rng() });
        }
      }
    });
  }

  f.totalItens = f.itens.length;
  f.metaItens = Math.ceil(f.totalItens * 2 / 3);
  return f;
}
