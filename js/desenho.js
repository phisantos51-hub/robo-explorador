/*
 * Robô Explorador — desenhos do jogo (cenários, robô, itens, bandeiras e portal).
 * Tudo é desenhado com código: não há imagens para baixar.
 */

var AMBIENTES = {
  jardim: {
    nome: 'Jardim', emoji: '🌻', item: 'semente', nomeItens: 'sementes',
    ceu: ['#6cc8ff', '#d9f3ff'], morroLonge: '#9fd987', morroPerto: '#6cbf55',
    grama: '#2e9d3a', terra: '#8b5a2b', terraEscura: '#6b4220',
    enfeites: ['flor', 'flor', 'flor2', 'arbusto'], sol: true
  },
  floresta: {
    nome: 'Floresta', emoji: '🌳', item: 'folha', nomeItens: 'folhas',
    ceu: ['#86cfe8', '#e2f5e6'], morroLonge: '#5c9e62', morroPerto: '#3a7d43',
    grama: '#2b8a36', terra: '#6d4c2f', terraEscura: '#4e3420',
    enfeites: ['arvore', 'cogumelo', 'arbusto', 'arvore'], arvoresFundo: true
  },
  rio: {
    nome: 'Rio', emoji: '🏞️', item: 'gota', nomeItens: 'gotas de água',
    ceu: ['#5ebcf5', '#d4effe'], morroLonge: '#8cc9a0', morroPerto: '#5aae74',
    grama: '#3a9e48', terra: '#9a6b3c', terraEscura: '#744d26',
    enfeites: ['junco', 'junco', 'flor', 'pedra'], agua: true, sol: true
  },
  fazenda: {
    nome: 'Fazenda', emoji: '🚜', item: 'semente', nomeItens: 'sementes',
    ceu: ['#ffc76b', '#fff2cf'], morroLonge: '#c9de7e', morroPerto: '#9cc552',
    grama: '#5f9e2f', terra: '#a0652d', terraEscura: '#7a4a1e',
    enfeites: ['cerca', 'feno', 'flor2', 'cerca'], celeiro: true, sol: true
  },
  noite: {
    nome: 'Céu noturno', emoji: '🌙', item: 'estrela', nomeItens: 'estrelas',
    ceu: ['#0a1238', '#2b4096'], morroLonge: '#1f2f68', morroPerto: '#18264f',
    grama: '#3fae6a', terra: '#4a3570', terraEscura: '#35254f',
    enfeites: ['arbusto', 'vagalume', 'flor2'], noite: true
  }
};

var Desenho = (function () {
  var CONTORNO = '#1b1b1b';

  function retRedondo(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Estrelas do céu noturno (posições fixas)
  var estrelasCeu = [];
  (function () {
    var s = 12345;
    function r() { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return s / 4294967296; }
    for (var i = 0; i < 70; i++) estrelasCeu.push({ x: r() * 1400, y: r() * 300, r: 1 + r() * 2, f: r() * 6 });
  })();

  function morro(ctx, deslocamento, base, amplitude, cor, periodo) {
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.moveTo(0, ALTURA_JOGO);
    for (var x = 0; x <= LARGURA_JOGO; x += 16) {
      var X = x + deslocamento;
      ctx.lineTo(x, base + Math.sin(X / periodo) * amplitude + Math.sin(X / (periodo * 0.37)) * amplitude * 0.35);
    }
    ctx.lineTo(LARGURA_JOGO, ALTURA_JOGO);
    ctx.closePath();
    ctx.fill();
  }

  function nuvem(ctx, x, y, e) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 22 * e, 0, Math.PI * 2);
    ctx.arc(x + 26 * e, y - 12 * e, 28 * e, 0, Math.PI * 2);
    ctx.arc(x + 56 * e, y, 22 * e, 0, Math.PI * 2);
    ctx.rect(x, y, 56 * e, 22 * e);
    ctx.fill();
  }

  function fundo(ctx, nomeAmb, cam, t) {
    var a = AMBIENTES[nomeAmb];
    var g = ctx.createLinearGradient(0, 0, 0, ALTURA_JOGO);
    g.addColorStop(0, a.ceu[0]);
    g.addColorStop(1, a.ceu[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, LARGURA_JOGO, ALTURA_JOGO);

    if (a.noite) {
      estrelasCeu.forEach(function (s) {
        var x = ((s.x - cam * 0.05) % 1400 + 1400) % 1400 - 200;
        ctx.globalAlpha = 0.55 + 0.45 * Math.sin(t * 2 + s.f);
        ctx.fillStyle = '#fffbe0';
        ctx.beginPath(); ctx.arc(x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      // Lua
      ctx.fillStyle = '#fff6c8';
      ctx.beginPath(); ctx.arc(790, 95, 42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8dca0';
      [[775, 85, 8], [805, 110, 6], [802, 76, 4]].forEach(function (c) {
        ctx.beginPath(); ctx.arc(c[0], c[1], c[2], 0, Math.PI * 2); ctx.fill();
      });
    } else {
      if (a.sol) {
        ctx.save();
        ctx.translate(850, 85);
        ctx.rotate(t * 0.2);
        ctx.strokeStyle = '#ffb300';
        ctx.lineWidth = 5;
        for (var i = 0; i < 10; i++) {
          ctx.rotate(Math.PI / 5);
          ctx.beginPath(); ctx.moveTo(52, 0); ctx.lineTo(68, 0); ctx.stroke();
        }
        ctx.restore();
        ctx.fillStyle = '#ffd54f';
        ctx.beginPath(); ctx.arc(850, 85, 42, 0, Math.PI * 2); ctx.fill();
      }
      for (var n = 0; n < 5; n++) {
        var base = n * 330 + 60;
        var x = ((base - cam * 0.15 + t * 6) % 1650 + 1650) % 1650 - 200;
        nuvem(ctx, x, 70 + (n % 3) * 45, 0.8 + (n % 2) * 0.3);
      }
    }

    morro(ctx, cam * 0.2, 300, 40, a.morroLonge, 170);

    if (a.celeiro) {
      for (var b = 0; b < 3; b++) {
        var bx = ((b * 700 + 300 - cam * 0.3) % 2100 + 2100) % 2100 - 200;
        celeiro(ctx, bx, 330);
      }
    }
    if (a.arvoresFundo) {
      for (var k = 0; k < 14; k++) {
        var tx = ((k * 110 - cam * 0.4) % 1540 + 1540) % 1540 - 120;
        var alt = 90 + (k * 37 % 50);
        ctx.fillStyle = '#4b3423';
        ctx.fillRect(tx - 6, 380 - alt * 0.4, 12, alt * 0.4 + 40);
        ctx.fillStyle = k % 2 ? '#2f6d38' : '#3c7f45';
        ctx.beginPath(); ctx.arc(tx, 380 - alt * 0.5, alt * 0.38, 0, Math.PI * 2); ctx.fill();
      }
    }
    morro(ctx, cam * 0.45, 380, 30, a.morroPerto, 110);
    if (a.agua) {
      ctx.fillStyle = '#4aa3df';
      ctx.fillRect(0, 410, LARGURA_JOGO, 30);
      ctx.fillStyle = '#9fd4f5';
      for (var w = 0; w < 12; w++) {
        var wx = ((w * 90 - cam * 0.5 + t * 20) % 1080 + 1080) % 1080 - 60;
        ctx.fillRect(wx, 420, 30, 3);
      }
    }
  }

  function celeiro(ctx, x, y) {
    ctx.fillStyle = '#c62828';
    ctx.fillRect(x, y, 90, 60);
    ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 45, y - 34); ctx.lineTo(x + 98, y); ctx.closePath();
    ctx.fillStyle = '#8e1c1c'; ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 33, y + 22, 24, 38);
    ctx.strokeStyle = '#c62828'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x + 33, y + 22); ctx.lineTo(x + 57, y + 60); ctx.moveTo(x + 57, y + 22); ctx.lineTo(x + 33, y + 60); ctx.stroke();
  }

  /* ---------- Enfeites no chão ---------- */
  function enfeite(ctx, d, t) {
    var x = d.x, y = d.y;
    switch (d.tipo) {
      case 'flor':
      case 'flor2':
        ctx.strokeStyle = '#2e7d32'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 22); ctx.stroke();
        var cores = ['#e91e63', '#ff9800', '#9c27b0', '#f44336', '#ffeb3b'];
        ctx.fillStyle = cores[Math.floor(d.v * cores.length)];
        for (var i = 0; i < 5; i++) {
          var ang = i * Math.PI * 2 / 5;
          ctx.beginPath(); ctx.arc(x + Math.cos(ang) * 6, y - 24 + Math.sin(ang) * 6, 5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath(); ctx.arc(x, y - 24, 4, 0, Math.PI * 2); ctx.fill();
        break;
      case 'arbusto':
        ctx.fillStyle = '#1f7a2c';
        ctx.beginPath();
        ctx.arc(x - 12, y - 8, 12, 0, Math.PI * 2);
        ctx.arc(x + 4, y - 14, 15, 0, Math.PI * 2);
        ctx.arc(x + 18, y - 7, 11, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'arvore':
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(x - 7, y - 70, 14, 70);
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.arc(x, y - 88, 30, 0, Math.PI * 2);
        ctx.arc(x - 22, y - 70, 20, 0, Math.PI * 2);
        ctx.arc(x + 22, y - 70, 20, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'cogumelo':
        ctx.fillStyle = '#fff3e0';
        ctx.fillRect(x - 4, y - 14, 8, 14);
        ctx.fillStyle = '#e53935';
        ctx.beginPath(); ctx.arc(x, y - 14, 12, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(x - 5, y - 19, 2.5, 0, Math.PI * 2); ctx.arc(x + 4, y - 21, 2, 0, Math.PI * 2); ctx.fill();
        break;
      case 'junco':
        ctx.strokeStyle = '#33691e'; ctx.lineWidth = 3;
        for (var j = -1; j <= 1; j++) {
          ctx.beginPath(); ctx.moveTo(x + j * 6, y); ctx.lineTo(x + j * 9, y - 34 - j * 4); ctx.stroke();
        }
        ctx.fillStyle = '#6d4c41';
        ctx.fillRect(x - 3, y - 44, 6, 14);
        break;
      case 'pedra':
        ctx.fillStyle = '#90a4ae';
        ctx.beginPath(); ctx.ellipse(x, y - 6, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
        break;
      case 'cerca':
        ctx.fillStyle = '#d7a86e';
        ctx.fillRect(x - 22, y - 28, 6, 28);
        ctx.fillRect(x + 16, y - 28, 6, 28);
        ctx.fillRect(x - 24, y - 24, 48, 5);
        ctx.fillRect(x - 24, y - 12, 48, 5);
        break;
      case 'feno':
        ctx.fillStyle = '#f9c74f';
        retRedondo(ctx, x - 18, y - 24, 36, 24, 6); ctx.fill();
        ctx.strokeStyle = '#c99a2e'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - 18, y - 12); ctx.lineTo(x + 18, y - 12); ctx.stroke();
        break;
      case 'vagalume':
        var a = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + d.v * 10));
        ctx.fillStyle = 'rgba(255, 245, 120,' + a + ')';
        ctx.beginPath(); ctx.arc(x + Math.sin(t + d.v * 6) * 10, y - 40 - d.v * 40, 4, 0, Math.PI * 2); ctx.fill();
        break;
    }
  }

  /* ---------- Chão, caixas e plataformas ---------- */
  function cenario(ctx, f, nomeAmb, cam, t) {
    var a = AMBIENTES[nomeAmb];
    var x0 = cam - 120, x1 = cam + LARGURA_JOGO + 120;

    if (a.agua) {
      ctx.fillStyle = '#1565c0';
      ctx.fillRect(cam, 470, LARGURA_JOGO, 70);
      ctx.fillStyle = '#90caf9';
      for (var w = Math.floor(cam / 60) * 60; w < cam + LARGURA_JOGO; w += 60) {
        ctx.fillRect(w + Math.sin(t * 2 + w) * 8, 478, 26, 4);
      }
    } else {
      f.buracos.forEach(function (b) {
        if (b.x + b.w < x0 || b.x > x1) return;
        var g = ctx.createLinearGradient(0, 440, 0, ALTURA_JOGO);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = g;
        ctx.fillRect(b.x, 440, b.w, 100);
      });
    }

    // Árvores (ficam atrás do robô)
    f.decoracoes.forEach(function (d) {
      if (d.tipo === 'arvore' && d.x > x0 && d.x < x1) enfeite(ctx, d, t);
    });

    f.segmentos.forEach(function (s) {
      if (s.x + s.w < x0 || s.x > x1) return;
      ctx.fillStyle = a.terra;
      ctx.fillRect(s.x, s.y, s.w, ALTURA_JOGO - s.y);
      ctx.fillStyle = a.terraEscura;
      for (var px = s.x + 14; px < s.x + s.w - 8; px += 36) {
        for (var py = s.y + 30; py < ALTURA_JOGO; py += 30) {
          ctx.fillRect(px + ((py / 30) % 2) * 14, py, 8, 5);
        }
      }
      ctx.fillStyle = a.grama;
      ctx.fillRect(s.x, s.y, s.w, 14);
      for (var gx = s.x + 6; gx < s.x + s.w; gx += 12) {
        ctx.beginPath(); ctx.arc(gx, s.y + 14, 6, 0, Math.PI); ctx.fill();
      }
      ctx.strokeStyle = CONTORNO; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s.x, ALTURA_JOGO); ctx.lineTo(s.x, s.y); ctx.lineTo(s.x + s.w, s.y); ctx.lineTo(s.x + s.w, ALTURA_JOGO);
      ctx.stroke();
    });

    f.decoracoes.forEach(function (d) {
      if (d.tipo !== 'arvore' && d.x > x0 && d.x < x1) enfeite(ctx, d, t);
    });

    f.caixas.forEach(function (c) {
      if (c.x + c.w < x0 || c.x > x1) return;
      ctx.fillStyle = '#c68642';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = '#7a4a1e'; ctx.lineWidth = 4;
      for (var cy = c.y; cy < c.y + c.h; cy += TILE) {
        ctx.strokeRect(c.x + 4, cy + 4, c.w - 8, TILE - 8);
        ctx.beginPath(); ctx.moveTo(c.x + 6, cy + 6); ctx.lineTo(c.x + c.w - 6, cy + TILE - 6);
        ctx.moveTo(c.x + c.w - 6, cy + 6); ctx.lineTo(c.x + 6, cy + TILE - 6); ctx.stroke();
      }
      ctx.strokeStyle = CONTORNO; ctx.lineWidth = 3;
      ctx.strokeRect(c.x, c.y, c.w, c.h);
    });

    f.plataformas.forEach(function (p) {
      if (p.x + p.w < x0 || p.x > x1) return;
      var movel = !!p.movel;
      ctx.fillStyle = movel ? '#ffca28' : '#a1662f';
      retRedondo(ctx, p.x, p.y, p.w, p.h, 6); ctx.fill();
      ctx.strokeStyle = CONTORNO; ctx.lineWidth = 3; ctx.stroke();
      if (movel) {
        ctx.fillStyle = CONTORNO;
        seta(ctx, p.x + 12, p.y + p.h / 2, -1);
        seta(ctx, p.x + p.w - 12, p.y + p.h / 2, 1);
      } else {
        ctx.fillStyle = a.grama;
        ctx.fillRect(p.x + 3, p.y + 2, p.w - 6, 5);
      }
    });
  }

  function seta(ctx, x, y, dir) {
    ctx.beginPath();
    ctx.moveTo(x + 6 * dir, y);
    ctx.lineTo(x - 4 * dir, y - 6);
    ctx.lineTo(x - 4 * dir, y + 6);
    ctx.closePath();
    ctx.fill();
  }

  /* ---------- Itens para coletar ---------- */
  function formaItem(ctx, tipo) {
    ctx.beginPath();
    switch (tipo) {
      case 'semente':
        ctx.ellipse(0, 0, 10, 15, 0.5, 0, Math.PI * 2);
        break;
      case 'gota':
        ctx.moveTo(0, -18);
        ctx.bezierCurveTo(6, -8, 13, -1, 13, 6);
        ctx.arc(0, 6, 13, 0, Math.PI);
        ctx.bezierCurveTo(-13, -1, -6, -8, 0, -18);
        break;
      case 'folha':
        ctx.moveTo(-15, 12);
        ctx.quadraticCurveTo(-16, -14, 14, -14);
        ctx.quadraticCurveTo(14, 12, -15, 12);
        break;
      case 'estrela':
        for (var i = 0; i < 10; i++) {
          var r = i % 2 ? 7.5 : 17;
          var ang = -Math.PI / 2 + i * Math.PI / 5;
          ctx[i ? 'lineTo' : 'moveTo'](Math.cos(ang) * r, Math.sin(ang) * r);
        }
        break;
    }
    ctx.closePath();
  }

  var CORES_ITEM = {
    semente: ['#8d5a2b', '#5d3a1a'],
    gota: ['#1e88e5', '#0d47a1'],
    folha: ['#7cc242', '#2e6b12'],
    estrela: ['#ffe234', '#c77700']
  };

  function item(ctx, tipo, x, y, escala) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(escala || 1, escala || 1);
    formaItem(ctx, tipo);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 7; ctx.stroke();
    ctx.fillStyle = CORES_ITEM[tipo][0]; ctx.fill();
    ctx.strokeStyle = CORES_ITEM[tipo][1]; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    if (tipo === 'semente') {
      ctx.beginPath(); ctx.ellipse(-3, -4, 3, 6, 0.5, 0, Math.PI * 2); ctx.fill();
    } else if (tipo === 'gota') {
      ctx.beginPath(); ctx.ellipse(-5, 4, 3, 5, 0.3, 0, Math.PI * 2); ctx.fill();
    } else if (tipo === 'folha') {
      ctx.strokeStyle = CORES_ITEM.folha[1]; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-12, 10); ctx.lineTo(10, -10); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(-4, -4, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- Bandeira (ponto de salvamento) ---------- */
  function bandeira(ctx, b, t) {
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(b.x - 3, b.y - 96, 6, 96);
    ctx.strokeStyle = CONTORNO; ctx.lineWidth = 2;
    ctx.strokeRect(b.x - 3, b.y - 96, 6, 96);
    var onda = Math.sin(t * 5) * 4;
    ctx.beginPath();
    ctx.moveTo(b.x + 3, b.y - 94);
    ctx.quadraticCurveTo(b.x + 26, b.y - 90 + onda, b.x + 48, b.y - 80);
    ctx.quadraticCurveTo(b.x + 26, b.y - 70 - onda, b.x + 3, b.y - 62);
    ctx.closePath();
    ctx.fillStyle = b.ativa ? '#2e7d32' : '#e53935';
    ctx.fill();
    ctx.lineWidth = 3; ctx.stroke();
    if (b.ativa) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(b.x + 12, b.y - 79); ctx.lineTo(b.x + 19, b.y - 72); ctx.lineTo(b.x + 31, b.y - 86); ctx.stroke();
      ctx.lineCap = 'butt';
    }
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath(); ctx.arc(b.x, b.y - 98, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = CONTORNO; ctx.lineWidth = 2; ctx.stroke();
  }

  /* ---------- Portal da Pergunta ---------- */
  function portal(ctx, p, t, aberto) {
    var x = p.x, y = p.y;
    // Arco de pedra
    ctx.fillStyle = '#78909c';
    retRedondo(ctx, x - 60, y - 160, 120, 160, 50); ctx.fill();
    ctx.strokeStyle = CONTORNO; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = '#546e7a'; ctx.lineWidth = 2;
    for (var i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(x - 60, y - 30 - i * 32); ctx.lineTo(x - 44, y - 30 - i * 32);
      ctx.moveTo(x + 44, y - 30 - i * 32); ctx.lineTo(x + 60, y - 30 - i * 32); ctx.stroke();
    }
    // Abertura
    ctx.save();
    retRedondo(ctx, x - 42, y - 140, 84, 140, 40);
    ctx.clip();
    var g = ctx.createRadialGradient(x, y - 70, 5, x, y - 70, 90);
    if (aberto) {
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#fff59d'); g.addColorStop(1, '#ffca28');
    } else {
      g.addColorStop(0, '#b39ddb'); g.addColorStop(0.6, '#7e57c2'); g.addColorStop(1, '#311b92');
    }
    ctx.fillStyle = g;
    ctx.fillRect(x - 42, y - 140, 84, 140);
    ctx.strokeStyle = aberto ? 'rgba(255,255,255,0.8)' : 'rgba(128, 222, 234, 0.8)';
    ctx.lineWidth = 4;
    for (var k = 0; k < 3; k++) {
      var a0 = t * (2 + k) + k * 2;
      ctx.beginPath(); ctx.arc(x, y - 70, 16 + k * 14, a0, a0 + Math.PI * 1.2); ctx.stroke();
    }
    ctx.restore();
    // Placa com "?"
    ctx.fillStyle = aberto ? '#43a047' : '#ff7043';
    ctx.beginPath(); ctx.arc(x, y - 172, 24, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = CONTORNO; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px Verdana, Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(aberto ? '✔' : '?', x, y - 170);
  }

  /* ---------- Robô ---------- */
  function robo(ctx, p, t, o) {
    o = o || {};
    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h);
    var e = o.escala == null ? 1 : o.escala;
    ctx.scale(e, e);
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    var dir = p.dir || 1;
    var passo = o.andando ? Math.sin(t * 16) * 4 : 0;
    ctx.lineWidth = 3; ctx.strokeStyle = CONTORNO; ctx.lineJoin = 'round';

    // Pernas
    ctx.fillStyle = '#455a64';
    retRedondo(ctx, -12, -14 - Math.max(0, passo), 9, 14 + Math.max(0, passo) - (o.noAr ? 3 : 0), 3); ctx.fill(); ctx.stroke();
    retRedondo(ctx, 3, -14 - Math.max(0, -passo), 9, 14 + Math.max(0, -passo) - (o.noAr ? 3 : 0), 3); ctx.fill(); ctx.stroke();
    // Braços
    ctx.fillStyle = '#ffb74d';
    var braco = o.noAr ? -10 : passo;
    retRedondo(ctx, -24, -32 + braco * 0.5, 8, 16, 4); ctx.fill(); ctx.stroke();
    retRedondo(ctx, 16, -32 - braco * 0.5, 8, 16, 4); ctx.fill(); ctx.stroke();
    // Corpo
    ctx.fillStyle = '#ff9800';
    retRedondo(ctx, -18, -36, 36, 24, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath(); ctx.arc(0, -24, 5, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2; ctx.stroke();
    // Cabeça
    ctx.lineWidth = 3;
    ctx.fillStyle = '#eceff1';
    retRedondo(ctx, -17, -60, 34, 25, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#263238';
    retRedondo(ctx, -13, -56, 26, 16, 5); ctx.fill();
    var piscando = (t % 3.2) < 0.12;
    ctx.fillStyle = '#4dd0e1';
    var olhoH = piscando ? 2 : 8;
    ctx.fillRect(-8 + dir * 2, -52 + (8 - olhoH) / 2, 5, olhoH);
    ctx.fillRect(3 + dir * 2, -52 + (8 - olhoH) / 2, 5, olhoH);
    // Antena
    ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(0, -68); ctx.stroke();
    ctx.fillStyle = (t % 1) < 0.5 ? '#ff5252' : '#ffeb3b';
    ctx.beginPath(); ctx.arc(0, -71, 5, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }

  /* ---------- Ícones para a tela (imagens geradas na hora) ---------- */
  var cacheIcones = {};
  function iconeItem(tipo, tamanho) {
    var chave = tipo + tamanho;
    if (cacheIcones[chave]) return cacheIcones[chave];
    var c = document.createElement('canvas');
    c.width = c.height = tamanho;
    var ctx = c.getContext('2d');
    item(ctx, tipo, tamanho / 2, tamanho / 2, tamanho / 44);
    try { cacheIcones[chave] = c.toDataURL(); } catch (e) { cacheIcones[chave] = ''; }
    return cacheIcones[chave];
  }

  function iconeRobo(tamanho) {
    var chave = 'robo' + tamanho;
    if (cacheIcones[chave]) return cacheIcones[chave];
    var c = document.createElement('canvas');
    c.width = c.height = tamanho;
    var ctx = c.getContext('2d');
    var e = tamanho / 84;
    ctx.scale(e, e);
    robo(ctx, { x: 25, y: 8, w: 34, h: 72, dir: 1 }, 0.6, {});
    try { cacheIcones[chave] = c.toDataURL(); } catch (er) { cacheIcones[chave] = ''; }
    return cacheIcones[chave];
  }

  return {
    fundo: fundo, cenario: cenario, item: item, bandeira: bandeira,
    portal: portal, robo: robo, iconeItem: iconeItem, iconeRobo: iconeRobo
  };
})();
