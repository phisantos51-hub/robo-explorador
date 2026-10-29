/*
 * Robô Explorador — obstáculos de cada ambiente.
 *
 * Nenhum obstáculo tira vida: ao tocar num obstáculo o robô tropeça ou se molha
 * (uma animação engraçada) e volta para a última bandeira, sem perder os itens.
 * Cada obstáculo aparece primeiro sozinho, num trecho seguro, com um balão explicando.
 */
var Obstaculos = (function () {
  'use strict';

  var CONTORNO = '#1b1b1b';

  /*
   * reacao: o que acontece ao tocar ('tropecou' volta para a bandeira).
   * aereo / queda: podem ser combinados por cima de outros obstáculos (3º ano e Modo Desafio).
   * vao: obstáculo que atravessa um buraco.
   */
  var CATALOGO = {
    espinhos: { nome: 'Espinhos da roseira', reacao: 'tropecou', balao: 'Espinhos da roseira! Pule por cima deles.' },
    abelha: { nome: 'Abelha', reacao: 'tropecou', aereo: true, balao: 'A abelha voa de um lado para o outro. Pule por cima dela, ou passe quando ela parar para descansar!' },
    lama: { nome: 'Poça de lama', balao: 'Lama! O robô fica mais lento. Continue andando.' },
    tronco: { nome: 'Tronco rolando', reacao: 'tropecou', balao: 'Troncos rolando! Pule quando um tronco chegar perto.' },
    galho: { nome: 'Galho fraco', vao: true, balao: 'Galho fraco! Ele quebra logo depois que você pisa. Passe rápido!' },
    cipo: { nome: 'Cipó', vao: true, balao: 'Cipó! Pule para se agarrar. Pule de novo para soltar do outro lado.' },
    pedra: { nome: 'Pedras que afundam', vao: true, balao: 'Pedras que afundam! Pise quando estiverem em cima da água.' },
    troncoBoia: { nome: 'Tronco boiando', vao: true, balao: 'Tronco boiando! Suba nele e espere chegar do outro lado.' },
    correnteza: { nome: 'Correnteza', balao: 'Correnteza! A água empurra o robô para trás. Continue andando.' },
    cerca: { nome: 'Cerca', balao: 'Cerca! Pule por cima.' },
    galinha: { nome: 'Galinha', reacao: 'tropecou', balao: 'Galinha correndo! Pule por cima dela.' },
    feno: { nome: 'Feno caindo', reacao: 'tropecou', queda: true, balao: 'Feno caindo! Olhe a sombra no chão e passe depois que ele cair.' },
    estrela: { nome: 'Plataformas de estrela', vao: true, balao: 'Plataformas de estrela! Só dá para pisar quando estão acesas.' },
    morcego: { nome: 'Morcego', reacao: 'tropecou', aereo: true, balao: 'Morcego voando! Passe quando ele subir ou quando parar para descansar.' },
    meteoro: { nome: 'Pedrinhas de meteoro', reacao: 'tropecou', queda: true, balao: 'Pedrinhas de meteoro! Olhe o brilho no chão e espere cair.' }
  };

  var POR_AMBIENTE = {
    jardim: ['lama', 'espinhos', 'abelha'],
    floresta: ['tronco', 'galho', 'cipo'],
    rio: ['correnteza', 'troncoBoia', 'pedra'],
    fazenda: ['cerca', 'galinha', 'feno'],
    noite: ['estrela', 'morcego', 'meteoro']
  };

  // 1º ano: só dois obstáculos simples, um de cada, devagar e com aviso.
  var SIMPLES_ANO1 = {
    jardim: ['lama', 'abelha'],
    floresta: ['tronco', 'galho'],
    rio: ['correnteza', 'troncoBoia'],
    fazenda: ['cerca', 'galinha'],
    noite: ['estrela', 'morcego']
  };

  /* Quais obstáculos e quantos aparecem numa fase */
  function plano(ano, ambiente, desafio) {
    var tipos = (ano === 1 && !desafio) ? SIMPLES_ANO1[ambiente] : POR_AMBIENTE[ambiente];
    var extras = { 1: 0, 2: 3, 3: 3 }[ano] + (desafio ? 2 : 0);
    return { tipos: tipos.slice(), extras: extras, combinar: ano === 3 || (desafio && ano === 2) };
  }

  /* Velocidade dos obstáculos: devagar no 1º ano, mais rápido no Modo Desafio, devagar no modo calmo */
  function fatorVelocidade(ano, desafio, calmo) {
    var f = { 1: 0.6, 2: 0.85, 3: 1 }[ano];
    if (desafio) f *= 1.4;
    if (calmo) f *= 0.65;
    return f;
  }

  function podeSobrepor(tipo, base) {
    var c = CATALOGO[tipo];
    if (tipo === base || !(c.aereo || c.queda)) return false;
    // coisas que caem precisam de chão embaixo, e não caem logo depois de uma cerca (onde o robô aterrissa)
    if (c.queda && (CATALOGO[base].vao || base === 'cerca')) return false;
    return true;
  }

  /* ================= Movimento ================= */
  function patrulhar(o, dt) {
    // paradaEsquerda: o bicho espera um pouco no lado de onde o robô chega (por cima dele),
    // dando tempo para o robô passar
    if (o.parado > 0) { o.parado -= dt; return; }
    o.x += o.vel * o.sentido * dt;
    if (o.x > o.ate) { o.x = o.ate; o.sentido = -1; }
    if (o.x < o.de) { o.x = o.de; o.sentido = 1; o.parado = o.paradaEsquerda || 0; }
  }

  // Ciclo das coisas que caem: espera (sombra) -> queda -> no chão -> some
  function faseQueda(o, t) {
    var c = o.espera + 1.1;
    var tt = ((t + o.atraso) % c + c) % c;
    if (tt < o.espera) return { fase: 'espera', p: tt / o.espera };
    tt -= o.espera;
    if (tt < 0.5) return { fase: 'cai', p: tt / 0.5 };
    return { fase: 'chao', p: (tt - 0.5) / 0.6 };
  }

  function pontaCipo(o) {
    return { x: o.px + Math.sin(o.ang) * o.comp, y: o.py + Math.cos(o.ang) * o.comp };
  }

  /* Move obstáculos e plataformas especiais. Chamado antes do robô se mexer. */
  function mover(g, dt) {
    var f = g.fase, r = g.robo;
    f.obstaculos.forEach(function (o) {
      o.t = (o.t || 0) + dt;
      switch (o.tipo) {
        case 'abelha':
        case 'galinha':
        case 'morcego':
          patrulhar(o, dt);
          break;
        case 'tronco':
          if (o.espera > 0) {
            o.espera -= dt;
            if (o.espera <= 0) o.x = o.ate;
          } else {
            o.x -= o.vel * dt;
            o.giro -= o.vel * dt / o.raio;
            if (o.x < o.de) o.espera = 0.9;
          }
          break;
        case 'cipo':
          o.ang = o.amp * Math.sin(o.t * Math.PI * 2 / o.periodo);
          break;
      }
    });

    f.plataformas.forEach(function (p) {
      if (p.galho) {
        var gl = p.galho;
        gl.t += dt;
        if (gl.estado === 'ok' && r.sobre === p) { gl.estado = 'tremendo'; gl.t = 0; }
        else if (gl.estado === 'tremendo' && gl.t > gl.tempo) { gl.estado = 'caindo'; gl.t = 0; p.solida = false; gl.vy = 0; }
        else if (gl.estado === 'caindo') {
          gl.vy += 1400 * dt; p.y += gl.vy * dt;
          if (p.y > ALTURA_JOGO + 80) { gl.estado = 'sumido'; gl.t = 0; }
        } else if (gl.estado === 'sumido' && gl.t > 2.2) {
          gl.estado = 'ok'; p.y = p.y0; p.solida = true;
        }
      } else if (p.pedra) {
        var pd = p.pedra;
        var ph = ((g.t / pd.ciclo) + pd.desloc) % 1;
        var desce;
        if (ph < 0.55) desce = 0;
        else if (ph < 0.67) desce = (ph - 0.55) / 0.12;
        else if (ph < 0.88) desce = 1;
        else desce = 1 - (ph - 0.88) / 0.12;
        var novoY = p.y0 + desce * pd.prof;
        p.dy = novoY - p.y;
        p.y = novoY;
        p.solida = desce < 0.5;
        pd.alerta = ph > 0.42 && ph < 0.55;
      } else if (p.estrela) {
        var es = p.estrela;
        var per = es.acesa + es.apagada;
        var fase = (g.t + es.desloc * per) % per;
        p.solida = fase < es.acesa;
        es.alerta = p.solida && fase > es.acesa - 0.7;
      }
    });

    // Robô pendurado no cipó acompanha a ponta
    if (r.cipo) {
      var pt = pontaCipo(r.cipo);
      r.x = pt.x - r.w / 2;
      r.y = pt.y - 4;
      r.vx = r.vy = 0;
    }
  }

  /* Efeitos do chão no robô: lama deixa mais lento, correnteza empurra */
  function efeitos(g) {
    var r = g.robo, ef = { vel: 1, pulo: 1, empurra: 0 };
    if (!r.noChao) return ef;
    var meio = r.x + r.w / 2, pe = r.y + r.h;
    g.fase.obstaculos.forEach(function (o) {
      if (o.tipo !== 'lama' && o.tipo !== 'correnteza') return;
      if (meio < o.x || meio > o.x + o.w || Math.abs(pe - o.y) > 4) return;
      if (o.tipo === 'lama') { ef.vel = 0.45; ef.pulo = 0.85; }
      else ef.empurra = -o.forca;
    });
    return ef;
  }

  // Abelha e morcego descansando (e logo que acordam) não atrapalham: é a hora de passar
  function descansando(o) {
    if (o.paradaEsquerda > 0 && (o.parado > 0 || (o.sentido > 0 && o.x < o.de + 30))) return true;
    // Fora do Modo Desafio, abelha e morcego indo embora (para a direita) não atrapalham quem vem atrás
    return !o.desafio && (o.tipo === 'abelha' || o.tipo === 'morcego') && o.sentido > 0;
  }

  function caixaPerigo(o, t) {
    if (descansando(o)) return null;
    switch (o.tipo) {
      case 'espinhos': return { x: o.x, y: o.y - 14, w: o.w, h: 14 };
      case 'abelha': return { x: o.x - 13, y: o.y - 10 + Math.sin(o.t * 6) * 4, w: 26, h: 20 };
      case 'galinha': return { x: o.x - 15, y: o.y - 28, w: 30, h: 28 };
      case 'morcego': return { x: o.x - 16, y: yMorcego(o) - 9, w: 32, h: 18 };
      case 'tronco':
        if (o.espera > 0) return null;
        return { x: o.x - o.raio + 3, y: o.y - o.raio * 2 + 3, w: o.raio * 2 - 6, h: o.raio * 2 - 3 };
      case 'feno':
      case 'meteoro':
        var q = faseQueda(o, t);
        if (q.fase !== 'cai') return null;
        var pos = posicaoQueda(o, q.p);
        return o.tipo === 'feno' ? { x: pos.x - 22, y: pos.y - 34, w: 44, h: 34 } : { x: pos.x - 12, y: pos.y - 12, w: 24, h: 24 };
    }
    return null;
  }

  function yMorcego(o) { return o.yBase + Math.sin(o.t * 1.6 * o.ritmo) * o.amp; }

  function posicaoQueda(o, p) {
    var e = p * p;
    if (o.tipo === 'feno') return { x: o.x, y: -40 + (o.yChao + 40) * e };
    // o meteoro vem do alto à direita, para não atingir quem está esperando à esquerda
    return { x: o.x + 140 * (1 - e), y: -30 + (o.yChao - 12 + 30) * e };
  }

  function sobrepoe(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  /*
   * Depois que o robô se mexeu: agarra no cipó e verifica se tocou num obstáculo.
   * Devolve o tipo do obstáculo tocado (ou null).
   */
  function verificar(g, dt) {
    var r = g.robo, f = g.fase;
    if (r.esperaCipo > 0) r.esperaCipo -= dt;
    if (!r.cipo && !(r.esperaCipo > 0)) {
      f.obstaculos.forEach(function (o) {
        if (o.tipo !== 'cipo' || r.cipo) return;
        var pt = pontaCipo(o);
        if (sobrepoe({ x: r.x, y: r.y, w: r.w, h: r.h }, { x: pt.x - 24, y: pt.y - 24, w: 48, h: 48 })) {
          r.cipo = o;
          r.noChao = false;
        }
      });
    }
    if (g.piscar > 0) return null;
    var caixa = { x: r.x + 5, y: r.y + 6, w: r.w - 10, h: r.h - 8 };
    for (var i = 0; i < f.obstaculos.length; i++) {
      var o = f.obstaculos[i];
      if (!CATALOGO[o.tipo].reacao) continue;
      var c = caixaPerigo(o, g.t);
      if (c && sobrepoe(caixa, c)) return o.tipo;
    }
    return null;
  }

  /* ================= Desenhos ================= */
  function retRedondo(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function desenharAbelha(ctx, x, y, dir, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir, 1);
    var asa = Math.abs(Math.sin(t * 30)) * 6;
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.strokeStyle = CONTORNO; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(-3, -12, 7, 4 + asa / 2, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(5, -12, 7, 4 + asa / 2, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffd600';
    ctx.beginPath(); ctx.ellipse(0, 0, 15, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = CONTORNO;
    ctx.fillRect(-7, -12, 5, 24); ctx.fillRect(2, -12, 5, 24);
    ctx.restore();
    ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(10, -3, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = CONTORNO;
    ctx.beginPath(); ctx.arc(11, -3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(9, 4, 3, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.restore();
  }

  function desenharMorcego(ctx, x, y, dir, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir, 1);
    var bate = Math.sin(t * 14) * 8;
    ctx.fillStyle = '#9575cd'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5;
    [-1, 1].forEach(function (lado) {
      ctx.beginPath();
      ctx.moveTo(lado * 6, -2);
      ctx.quadraticCurveTo(lado * 18, -14 - bate, lado * 28, -4 - bate);
      ctx.quadraticCurveTo(lado * 22, 0, lado * 24, 6);
      ctx.quadraticCurveTo(lado * 14, 2, lado * 6, 6);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    });
    ctx.fillStyle = '#7e57c2';
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-7, -6); ctx.lineTo(-5, -15); ctx.lineTo(-1, -8); ctx.moveTo(7, -6); ctx.lineTo(5, -15); ctx.lineTo(1, -8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-3.5, -1, 3, 0, Math.PI * 2); ctx.arc(3.5, -1, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = CONTORNO;
    ctx.beginPath(); ctx.arc(-3, -1, 1.5, 0, Math.PI * 2); ctx.arc(4, -1, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function desenharGalinha(ctx, x, y, dir, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir, 1);
    var passo = Math.sin(t * 18) * 5;
    ctx.strokeStyle = '#f57f17'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-4, -8); ctx.lineTo(-4 + passo, 0); ctx.moveTo(4, -8); ctx.lineTo(4 - passo, 0); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = CONTORNO; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(-2, -17, 15, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(11, -28, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e53935';
    ctx.beginPath(); ctx.arc(9, -37, 3.5, 0, Math.PI * 2); ctx.arc(13, -37, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffb300';
    ctx.beginPath(); ctx.moveTo(18, -29); ctx.lineTo(25, -27); ctx.lineTo(18, -24); ctx.closePath(); ctx.fill();
    ctx.fillStyle = CONTORNO;
    ctx.beginPath(); ctx.arc(13, -30, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(-4, -17, 6, 0.3, Math.PI - 0.3); ctx.stroke();
    ctx.restore();
  }

  function desenharTronco(ctx, x, y, raio, giro) {
    ctx.save();
    ctx.translate(x, y - raio);
    ctx.fillStyle = '#a1662f'; ctx.strokeStyle = CONTORNO; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, raio, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#6d4220'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, raio * 0.6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, raio * 0.25, 0, Math.PI * 2); ctx.stroke();
    ctx.rotate(giro);
    ctx.beginPath(); ctx.moveTo(0, -raio * 0.6); ctx.lineTo(0, -raio); ctx.stroke();
    ctx.restore();
  }

  function desenharFeno(ctx, x, y) {
    ctx.fillStyle = '#f9c74f'; ctx.strokeStyle = CONTORNO; ctx.lineWidth = 3;
    retRedondo(ctx, x - 22, y - 34, 44, 34, 6); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#c99a2e'; ctx.lineWidth = 2;
    for (var i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x - 20, y - 17 + i * 9); ctx.lineTo(x + 20, y - 17 + i * 9); ctx.stroke(); }
    ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x - 8, y - 34); ctx.lineTo(x - 8, y); ctx.moveTo(x + 8, y - 34); ctx.lineTo(x + 8, y); ctx.stroke();
  }

  function desenharMeteoro(ctx, x, y, t) {
    var g = ctx.createLinearGradient(x + 50, y - 36, x, y);
    g.addColorStop(0, 'rgba(255,213,79,0)');
    g.addColorStop(1, 'rgba(255,213,79,0.9)');
    ctx.strokeStyle = g; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + 50, y - 36); ctx.lineTo(x, y); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = '#ff8a65'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#bf360c';
    ctx.beginPath(); ctx.arc(x - 3, y - 2, 3, 0, Math.PI * 2); ctx.arc(x + 4, y + 3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff59d';
    for (var i = 0; i < 3; i++) {
      var a = t * 9 + i * 2.1;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * 16, y + Math.sin(a) * 16, 2.2, 0, Math.PI * 2); ctx.fill();
    }
  }

  function desenharEspinhos(ctx, o) {
    ctx.strokeStyle = '#2e7d32'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(o.x - 2, o.y - 6); ctx.lineTo(o.x + o.w + 2, o.y - 6); ctx.stroke();
    ctx.fillStyle = '#5d4037'; ctx.strokeStyle = CONTORNO; ctx.lineWidth = 1.5;
    for (var x = o.x + 2; x < o.x + o.w - 4; x += 10) {
      ctx.beginPath(); ctx.moveTo(x, o.y - 6); ctx.lineTo(x + 4, o.y - 17); ctx.lineTo(x + 8, o.y - 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    [o.x - 2, o.x + o.w + 2].forEach(function (fx) {
      ctx.fillStyle = '#e91e63';
      ctx.beginPath(); ctx.arc(fx, o.y - 14, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ad1457'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(fx, o.y - 14, 4, 0, Math.PI * 1.5); ctx.stroke();
    });
  }

  function desenharLama(ctx, o, t) {
    ctx.fillStyle = '#5d4037';
    ctx.beginPath(); ctx.ellipse(o.x + o.w / 2, o.y + 3, o.w / 2 + 4, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = CONTORNO; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#8d6e63';
    for (var i = 0; i < 4; i++) {
      var bx = o.x + (i + 0.5) * o.w / 4;
      var r = 2 + Math.abs(Math.sin(t * 2 + i)) * 3;
      ctx.beginPath(); ctx.arc(bx, o.y + 1, r, 0, Math.PI * 2); ctx.fill();
    }
  }

  function desenharCorrenteza(ctx, o, t, calmo) {
    ctx.fillStyle = 'rgba(41, 121, 255, 0.55)';
    ctx.fillRect(o.x, o.y - 10, o.w, 14);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    var passo = 40, desl = calmo ? 0 : (t * 50) % passo;
    for (var x = o.x + o.w - desl; x > o.x + 10; x -= passo) {
      ctx.beginPath(); ctx.moveTo(x, o.y - 7); ctx.lineTo(x - 8, o.y - 3); ctx.lineTo(x, o.y + 1); ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }

  function desenharCipo(ctx, o) {
    var pt = pontaCipo(o);
    ctx.strokeStyle = '#33691e'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(o.px, o.py); ctx.lineTo(pt.x, pt.y); ctx.stroke();
    ctx.strokeStyle = '#7cb342'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(o.px, o.py); ctx.lineTo(pt.x, pt.y); ctx.stroke();
    ctx.fillStyle = '#558b2f';
    for (var k = 1; k < 5; k++) {
      var lx = o.px + (pt.x - o.px) * k / 5, ly = o.py + (pt.y - o.py) * k / 5;
      ctx.beginPath(); ctx.ellipse(lx + (k % 2 ? 7 : -7), ly, 7, 3.5, k % 2 ? 0.5 : -0.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#33691e'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(pt.x, pt.y + 4, 8, 0, Math.PI * 2); ctx.stroke();
    // galho de onde o cipó pendura
    ctx.fillStyle = '#5d4037'; ctx.strokeStyle = CONTORNO; ctx.lineWidth = 3;
    retRedondo(ctx, o.px - 60, o.py - 10, 120, 14, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath(); ctx.arc(o.px - 50, o.py - 14, 16, 0, Math.PI * 2); ctx.arc(o.px + 50, o.py - 14, 16, 0, Math.PI * 2); ctx.fill();
  }

  function desenharPlataformaEspecial(ctx, p, t, calmo) {
    if (p.galho) {
      var gl = p.galho;
      if (gl.estado === 'sumido') return;
      var treme = gl.estado === 'tremendo' && !calmo ? Math.sin(t * 60) * 2 : 0;
      ctx.save();
      ctx.translate(treme, 0);
      if (gl.estado === 'caindo') {
        ctx.translate(p.x + p.w / 2, p.y);
        ctx.rotate(Math.min(0.5, gl.t * 0.8));
        ctx.translate(-p.x - p.w / 2, -p.y);
      }
      ctx.fillStyle = '#8d5524'; ctx.strokeStyle = CONTORNO; ctx.lineWidth = 3;
      retRedondo(ctx, p.x, p.y, p.w, p.h, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#7cb342';
      ctx.beginPath(); ctx.ellipse(p.x + 10, p.y - 2, 8, 4, -0.5, 0, Math.PI * 2); ctx.ellipse(p.x + p.w - 12, p.y - 3, 8, 4, 0.5, 0, Math.PI * 2); ctx.fill();
      if (gl.estado !== 'ok') {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5;
        var mx = p.x + p.w / 2;
        ctx.beginPath(); ctx.moveTo(mx - 6, p.y + 2); ctx.lineTo(mx + 2, p.y + 8); ctx.lineTo(mx - 3, p.y + p.h - 2); ctx.stroke();
      }
      ctx.restore();
    } else if (p.pedra) {
      if (p.y > p.y0 + p.pedra.prof - 2) {
        ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y0 + p.pedra.prof - 22, p.w / 2, 4, 0, 0, Math.PI * 2); ctx.stroke();
        return;
      }
      ctx.fillStyle = p.pedra.alerta && !calmo && Math.floor(t * 6) % 2 ? '#b0bec5' : '#90a4ae';
      ctx.strokeStyle = CONTORNO; ctx.lineWidth = 3;
      retRedondo(ctx, p.x, p.y, p.w, 24, 11); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#cfd8dc';
      ctx.beginPath(); ctx.ellipse(p.x + 14, p.y + 7, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
      if (p.pedra.alerta) {
        ctx.fillStyle = '#90caf9';
        ctx.beginPath(); ctx.arc(p.x + p.w / 2, p.y - 8, 4, 0, Math.PI * 2); ctx.fill();
      }
    } else if (p.estrela) {
      var es = p.estrela;
      if (!p.solida) {
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2;
        retRedondo(ctx, p.x, p.y, p.w, p.h, 8); ctx.stroke();
        ctx.setLineDash([]);
        return;
      }
      var piscando = es.alerta && (calmo ? true : Math.floor(t * 8) % 2 === 0);
      ctx.fillStyle = piscando ? 'rgba(255, 241, 118, 0.55)' : '#fff176';
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
      ctx.shadowColor = '#fff59d'; ctx.shadowBlur = 16;
      retRedondo(ctx, p.x, p.y, p.w, p.h, 8); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#f9a825';
      for (var sx = p.x + 12; sx < p.x + p.w - 6; sx += 18) estrelinha(ctx, sx, p.y + p.h / 2, 5);
    } else if (p.aparencia === 'tronco') {
      ctx.fillStyle = '#a1662f'; ctx.strokeStyle = CONTORNO; ctx.lineWidth = 3;
      retRedondo(ctx, p.x, p.y, p.w, p.h + 4, 11); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#6d4220'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(p.x + 14, p.y + 8); ctx.lineTo(p.x + p.w - 14, p.y + 8); ctx.stroke();
      ctx.fillStyle = '#d7a86e';
      ctx.beginPath(); ctx.ellipse(p.x + p.w - 6, p.y + (p.h + 4) / 2, 5, (p.h + 4) / 2 - 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + p.h + 6, p.w / 2 + 6, 3, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function estrelinha(ctx, x, y, r) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var rr = i % 2 ? r * 0.45 : r;
      var a = -Math.PI / 2 + i * Math.PI / 5;
      ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill();
  }

  function desenharCerca(ctx, c) {
    ctx.fillStyle = '#d7a86e'; ctx.strokeStyle = CONTORNO; ctx.lineWidth = 2.5;
    [c.x + 4, c.x + c.w - 12].forEach(function (x) {
      ctx.beginPath(); ctx.moveTo(x, c.y + c.h); ctx.lineTo(x, c.y + 6); ctx.lineTo(x + 4, c.y); ctx.lineTo(x + 8, c.y + 6); ctx.lineTo(x + 8, c.y + c.h); ctx.closePath(); ctx.fill(); ctx.stroke();
    });
    for (var y = c.y + 12; y < c.y + c.h - 6; y += 20) {
      ctx.fillRect(c.x, y, c.w, 8); ctx.strokeRect(c.x, y, c.w, 8);
    }
  }

  /* "Zzz" em cima do bicho que está descansando */
  function zzz(ctx, o, y, t) {
    if (!(o.parado > 0)) return;
    ctx.font = 'bold 18px Verdana, Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff'; ctx.fillStyle = '#1565c0';
    var sobe = (t * 12) % 10;
    ctx.strokeText('z z', o.x + 14, y - sobe); ctx.fillText('z z', o.x + 14, y - sobe);
  }

  /* Seta que pisca devagar mostrando por onde o obstáculo vem */
  function seta(ctx, x, y, angulo, t, calmo) {
    ctx.save();
    ctx.globalAlpha = calmo ? 0.75 : 0.45 + 0.45 * (0.5 + 0.5 * Math.sin(t * 4));
    ctx.translate(x, y);
    ctx.rotate(angulo);
    ctx.fillStyle = '#ffeb3b'; ctx.strokeStyle = CONTORNO; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(18, 0); ctx.lineTo(0, -14); ctx.lineTo(0, -6); ctx.lineTo(-16, -6);
    ctx.lineTo(-16, 6); ctx.lineTo(0, 6); ctx.lineTo(0, 14); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function desenhar(ctx, g, calmo) {
    var f = g.fase, t = g.t, x0 = g.cam - 150, x1 = g.cam + LARGURA_JOGO + 150;
    var r = g.robo;
    function visivel(a, b) { return b > x0 && a < x1; }

    f.caixas.forEach(function (c) { if (c.aparencia === 'cerca' && visivel(c.x, c.x + c.w)) desenharCerca(ctx, c); });
    f.plataformas.forEach(function (p) { if (visivel(p.x, p.x + p.w)) desenharPlataformaEspecial(ctx, p, t, calmo); });

    f.obstaculos.forEach(function (o) {
      var a = o.x != null ? o.x : o.px;
      var largura = o.w || 300;
      if (!visivel((o.de != null ? o.de : a) - 160, (o.ate != null ? o.ate : a + largura) + 160)) return;
      switch (o.tipo) {
        case 'espinhos': desenharEspinhos(ctx, o); break;
        case 'lama': desenharLama(ctx, o, t); break;
        case 'correnteza': desenharCorrenteza(ctx, o, t, calmo); break;
        case 'abelha': desenharAbelha(ctx, o.x, o.y + Math.sin(o.t * 6) * 4, o.sentido, t); zzz(ctx, o, o.y - 20, t); break;
        case 'galinha': desenharGalinha(ctx, o.x, o.y, o.sentido, t); break;
        case 'morcego': desenharMorcego(ctx, o.x, yMorcego(o), o.sentido, t); zzz(ctx, o, yMorcego(o) - 22, t); break;
        case 'tronco':
          if (o.espera <= 0) desenharTronco(ctx, o.x, o.y, o.raio, o.giro);
          break;
        case 'cipo': desenharCipo(ctx, o); break;
        case 'feno':
        case 'meteoro':
          var q = faseQueda(o, t);
          if (q.fase === 'espera' || q.fase === 'cai') {
            var cresce = q.fase === 'espera' ? q.p : 1;
            if (o.tipo === 'feno') {
              ctx.fillStyle = 'rgba(0,0,0,' + (0.15 + 0.3 * cresce) + ')';
              ctx.beginPath(); ctx.ellipse(o.x, o.yChao, 8 + 18 * cresce, 4 + 3 * cresce, 0, 0, Math.PI * 2); ctx.fill();
            } else {
              var brilho = calmo ? 0.6 : 0.4 + 0.4 * Math.abs(Math.sin(t * 5));
              ctx.fillStyle = 'rgba(255, 213, 79,' + brilho + ')';
              ctx.beginPath(); ctx.ellipse(o.x, o.yChao, 10 + 14 * cresce, 4 + 3 * cresce, 0, 0, Math.PI * 2); ctx.fill();
            }
          }
          if (q.fase === 'cai') {
            var pos = posicaoQueda(o, q.p);
            if (o.tipo === 'feno') desenharFeno(ctx, pos.x, pos.y); else desenharMeteoro(ctx, pos.x, pos.y, t);
          } else if (q.fase === 'chao') {
            ctx.globalAlpha = Math.max(0, 1 - q.p);
            if (o.tipo === 'feno') desenharFeno(ctx, o.x, o.yChao);
            else { ctx.fillStyle = '#fff59d'; for (var k = 0; k < 6; k++) estrelinha(ctx, o.x + Math.cos(k) * 18 * (1 + q.p), o.yChao - 10 - Math.sin(k) * 12 * (1 + q.p), 5); }
            ctx.globalAlpha = 1;
          }
          break;
      }

      // Avisos: seta piscando (1º ano e primeira vez de cada obstáculo)
      if (o.aviso && r.x < (o.ate != null ? o.ate : o.x + (o.w || 0)) + 40) {
        if (o.tipo === 'abelha' || o.tipo === 'galinha' || o.tipo === 'morcego') {
          var ay = o.tipo === 'galinha' ? o.y - 60 : (o.tipo === 'morcego' ? o.yBase - o.amp - 34 : o.y - 36);
          seta(ctx, o.x + o.sentido * 34, ay, o.sentido > 0 ? 0 : Math.PI, t, calmo);
        } else if (o.tipo === 'tronco') {
          seta(ctx, o.ate - 20, o.y - 70, Math.PI, t, calmo);
        } else if (o.tipo === 'feno' || o.tipo === 'meteoro') {
          seta(ctx, o.x, o.yChao - 120, Math.PI / 2, t, calmo);
        }
      }
    });
  }

  /* Placas com "!" e balões explicando cada obstáculo novo */
  function desenharPlacas(ctx, g, calmo, maiusculas) {
    var r = g.robo, meio = r.x + r.w / 2;
    g.fase.placas.forEach(function (pl) {
      // placa
      ctx.fillStyle = '#6d4c41'; ctx.strokeStyle = CONTORNO; ctx.lineWidth = 2.5;
      ctx.fillRect(pl.x - 3, pl.y - 52, 6, 52); ctx.strokeRect(pl.x - 3, pl.y - 52, 6, 52);
      ctx.fillStyle = '#ffeb3b';
      retRedondo(ctx, pl.x - 18, pl.y - 78, 36, 30, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = CONTORNO;
      ctx.font = 'bold 24px Verdana, Arial, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('!', pl.x, pl.y - 62);

      if (meio < pl.x - 430 || meio > pl.xFim) return;
      var alpha = Math.min(1, (meio - (pl.x - 430)) / 80);
      var texto = CATALOGO[pl.tipo].balao;
      if (maiusculas) texto = texto.toUpperCase();
      ctx.font = 'bold 19px Verdana, Arial, sans-serif';
      var linhas = quebrarTexto(ctx, texto, 250);
      var w = 350, h = Math.max(92, 24 + linhas.length * 25);
      // o balão fica à esquerda da placa, para não cobrir o obstáculo (que vem à direita)
      var bx = Math.max(g.cam + 10, Math.min(pl.x - w + 50, g.cam + LARGURA_JOGO - w - 10));
      var by = 96;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = CONTORNO; ctx.lineWidth = 3;
      retRedondo(ctx, bx, by, w, h, 16); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pl.x - 12, by + h - 1); ctx.lineTo(pl.x, pl.y - 82); ctx.lineTo(pl.x + 12, by + h - 1);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(pl.x - 10, by + h - 4, 20, 6);
      desenharIcone(ctx, pl.tipo, bx + 46, by + h / 2, 0.95, g.t);
      ctx.fillStyle = CONTORNO; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      linhas.forEach(function (l, i) {
        ctx.fillText(l, bx + 88, by + h / 2 + (i - (linhas.length - 1) / 2) * 25);
      });
      ctx.globalAlpha = 1;
    });
  }

  function quebrarTexto(ctx, texto, largura) {
    var palavras = texto.split(' '), linhas = [], atual = '';
    palavras.forEach(function (p) {
      var teste = atual ? atual + ' ' + p : p;
      if (ctx.measureText(teste).width > largura && atual) { linhas.push(atual); atual = p; } else atual = teste;
    });
    if (atual) linhas.push(atual);
    return linhas;
  }

  /* Desenho pequeno de cada obstáculo (para balões, tela antes da fase e "Como jogar") */
  function desenharIcone(ctx, tipo, x, y, e, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(e, e);
    switch (tipo) {
      case 'espinhos': desenharEspinhos(ctx, { x: -26, y: 14, w: 52 }); break;
      case 'abelha': desenharAbelha(ctx, 0, 4, 1, t || 0); break;
      case 'lama': desenharLama(ctx, { x: -28, y: 4, w: 56 }, t || 0); break;
      case 'tronco': desenharTronco(ctx, 0, 20, 20, 0.6); break;
      case 'galho': desenharPlataformaEspecial(ctx, { x: -30, y: -6, w: 60, h: 14, galho: { estado: 'ok' } }, 0, true); break;
      case 'cipo': desenharCipo(ctx, { px: 0, py: -22, comp: 38, ang: 0.3 }); break;
      case 'pedra': desenharPlataformaEspecial(ctx, { x: -24, y: -10, w: 48, y0: -10, pedra: { prof: 40 } }, 0, true); break;
      case 'troncoBoia': desenharPlataformaEspecial(ctx, { x: -30, y: -10, w: 60, h: 16, aparencia: 'tronco' }, 0, true); break;
      case 'correnteza':
        ctx.fillStyle = 'rgba(41, 121, 255, 0.85)'; retRedondo(ctx, -30, -10, 60, 22, 8); ctx.fill();
        desenharCorrenteza(ctx, { x: -30, y: 4, w: 60 }, 0, true); break;
      case 'cerca': desenharCerca(ctx, { x: -22, y: -24, w: 44, h: 46 }); break;
      case 'galinha': desenharGalinha(ctx, 0, 22, 1, 0); break;
      case 'feno': desenharFeno(ctx, 0, 18); break;
      case 'estrela': desenharPlataformaEspecial(ctx, { x: -30, y: -9, w: 60, h: 18, solida: true, estrela: {} }, 0, true); break;
      case 'morcego': desenharMorcego(ctx, 0, 0, 1, 0.3); break;
      case 'meteoro': desenharMeteoro(ctx, -8, 6, 0); break;
    }
    ctx.restore();
  }

  var cacheIcones = {};
  function icone(tipo, tamanho) {
    var chave = tipo + tamanho;
    if (cacheIcones[chave]) return cacheIcones[chave];
    var c = document.createElement('canvas');
    c.width = c.height = tamanho;
    var ctx = c.getContext('2d');
    desenharIcone(ctx, tipo, tamanho / 2, tamanho / 2, tamanho / 62, 0);
    try { cacheIcones[chave] = c.toDataURL(); } catch (e) { cacheIcones[chave] = ''; }
    return cacheIcones[chave];
  }

  /* Animação engraçada quando o robô tropeça ou se molha */
  function desenharRoboOps(ctx, r, ops, t, calmo, desenharRobo) {
    var p = Math.min(1, ops.t / 0.6);
    var cx = r.x + r.w / 2, base = r.y + r.h;
    ctx.save();
    if (ops.reacao === 'molhou') {
      desenharRobo({});
      ctx.fillStyle = '#42a5f5';
      for (var i = 0; i < 6; i++) {
        var dx = (i - 2.5) * 9, dy = ((ops.t * 120 + i * 17) % 50);
        ctx.beginPath(); ctx.arc(cx + dx, r.y - 4 + dy, 3.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = 'rgba(66,165,245,0.5)';
      ctx.beginPath(); ctx.ellipse(cx, base, 26 * p, 5, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      // tropeçou: o robô cai sentadinho de lado e vê estrelinhas
      if (!calmo) {
        ctx.translate(cx, base);
        ctx.rotate(-r.dir * 1.2 * p);
        ctx.translate(-cx, -base);
      }
      desenharRobo({});
      ctx.restore();
      ctx.save();
      ctx.fillStyle = '#ffeb3b'; ctx.strokeStyle = CONTORNO; ctx.lineWidth = 1.5;
      var hx = cx - r.dir * 30 * p, hy = r.y + (calmo ? -10 : 20 * p - 6);
      for (var k = 0; k < 3; k++) {
        var a = (calmo ? 0 : t * 5) + k * Math.PI * 2 / 3;
        var sx = hx + Math.cos(a) * 20, sy = hy + Math.sin(a) * 7;
        estrelinha(ctx, sx, sy, 7); ctx.stroke();
      }
    }
    ctx.restore();
  }

  return {
    CATALOGO: CATALOGO,
    plano: plano,
    fatorVelocidade: fatorVelocidade,
    podeSobrepor: podeSobrepor,
    mover: mover,
    efeitos: efeitos,
    verificar: verificar,
    desenhar: desenhar,
    desenharPlacas: desenharPlacas,
    desenharRoboOps: desenharRoboOps,
    icone: icone
  };
})();
