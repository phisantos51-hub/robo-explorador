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
 */
var DIFICULDADE = {
  1: {
    pecas: ['plano', 'buraco', 'caixa', 'plataforma', 'degrau', 'plano', 'buraco', 'plataforma', 'degrau', 'caixa', 'buraco'],
    buraco: [1, 2], degrau: 1, alturaPlataforma: 2, alturaCaixa: 1
  },
  2: {
    pecas: ['plano', 'buraco', 'caixa', 'plataforma', 'degrau', 'ponte', 'buraco', 'plataforma', 'degrau', 'caixa', 'buraco', 'ponte', 'degrau'],
    buraco: [2, 3], degrau: 2, alturaPlataforma: 2.5, alturaCaixa: 1
  },
  3: {
    pecas: ['buraco', 'caixa', 'plataforma', 'degrau', 'ponte', 'movel', 'buraco', 'plataforma', 'degrau', 'caixa', 'buraco', 'movel', 'ponte', 'degrau'],
    buraco: [2, 3], degrau: 2, alturaPlataforma: 2.5, alturaCaixa: 2
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

/* Monta o cenário de uma fase. Sempre o mesmo cenário para o mesmo ano e fase. */
function construirFase(ano, indice, decoracoes) {
  var d = DIFICULDADE[ano];
  var rng = criarSorteio(ano * 1000 + indice * 37 + 11);
  var pecas = d.pecas.slice();
  for (var i = pecas.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = pecas[i]; pecas[i] = pecas[j]; pecas[j] = tmp;
  }

  var f = {
    segmentos: [], caixas: [], plataformas: [], itens: [],
    bandeiras: [], buracos: [], decoracoes: [], solidos: []
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
  function buraco(largura) {
    f.buracos.push({ x: cx * TILE, w: largura * TILE });
    cx += largura;
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
      var ini = (cx - 0.5) * TILE, fim = (cx + g + 0.5) * TILE;
      var alturas = [70, 115, 70];
      for (var k = 0; k < 3; k++) {
        f.itens.push({ x: ini + (fim - ini) * k / 2, y: topo() - alturas[k], pego: false });
      }
      buraco(g);
      chao(3);
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

  // Começo
  chao(7);
  linhaDeItens(3, 3, topo() - 44);
  f.inicio = { x: 2 * TILE, y: topo() };

  var marcas = [Math.floor(pecas.length / 3), Math.floor(2 * pecas.length / 3)];
  pecas.forEach(function (p, i) {
    if (marcas.indexOf(i) >= 0) {
      chao(1);
      f.bandeiras.push({ x: cx * TILE + TILE / 2, y: topo(), ativa: false });
      chao(3);
    }
    PECAS[p]();
  });

  // Final com o portal
  chao(4);
  f.portal = { x: (cx + 3) * TILE, y: topo() };
  chao(10);
  f.largura = cx * TILE;

  // Tudo o que é sólido (chão e caixas)
  f.segmentos.forEach(function (s) {
    f.solidos.push({ x: s.x, y: s.y, w: s.w, h: ALTURA_JOGO - s.y + 400 });
  });
  f.caixas.forEach(function (c) { f.solidos.push(c); });

  // Enfeites do cenário (flores, árvores...), sem atrapalhar o caminho
  if (decoracoes && decoracoes.length) {
    f.segmentos.forEach(function (s) {
      for (var x = s.x + TILE * 0.5; x < s.x + s.w - TILE * 0.5; x += TILE) {
        if (rng() < 0.4) {
          f.decoracoes.push({ x: x + rng() * 20 - 10, y: s.y, tipo: decoracoes[Math.floor(rng() * decoracoes.length)], v: rng() });
        }
      }
    });
  }

  f.totalItens = f.itens.length;
  f.metaItens = Math.ceil(f.totalItens * 2 / 3);
  return f;
}
