/*
 * ROBÔ EXPLORADOR — BANCO DE PERGUNTAS
 * ====================================
 *
 * Este é o único arquivo que você precisa abrir para mudar ou acrescentar perguntas.
 * As perguntas estão separadas por ano e por tema. Cada tema é uma lista entre [ e ].
 *
 * COMO ACRESCENTAR UMA PERGUNTA NOVA
 * ----------------------------------
 * 1. Encontre o tema desejado (por exemplo, 'ano2-plantas').
 * 2. Copie um bloco inteiro de pergunta, desde a chave { até a chave } seguida de vírgula.
 * 3. Cole logo abaixo de outra pergunta do mesmo tema e troque os textos.
 * 4. Salve o arquivo e recarregue o jogo no navegador (tecla F5).
 *
 * Modelo para copiar:
 *
 *   {
 *     pergunta: 'Com que parte do corpo sentimos o cheiro?',
 *     imagem: '🌸',
 *     respostas: [
 *       { texto: 'Nariz', imagem: '👃', certa: true },
 *       { texto: 'Orelha', imagem: '👂' },
 *       { texto: 'Mão', imagem: '✋' }
 *     ],
 *     explicacao: 'Sentimos o cheiro com o nariz. É o olfato.',
 *     imagemExplicacao: '👃🌸'
 *   },
 *
 * O que é cada parte:
 *   pergunta          — o texto da pergunta. Use frases curtas.
 *   imagem            — (opcional) um desenho (emoji) grande que aparece junto da pergunta.
 *   respostas         — 2 ou 3 alternativas. Cada uma tem um texto e um desenho (emoji).
 *                       Escreva   certa: true   em UMA alternativa só (a resposta certa).
 *                       A ordem não importa: o jogo embaralha as alternativas.
 *   explicacao        — frase curta que aparece quando a criança erra (e quando acerta).
 *   imagemExplicacao  — (opcional) desenhos (emojis) que ilustram a explicação.
 *
 * Cuidados para não dar erro:
 *   - Todo texto fica entre aspas simples: 'assim'. Se o texto tiver apóstrofo, use \' (ex.: 'pau d\'água').
 *   - Não esqueça as vírgulas entre as partes e entre uma pergunta e outra.
 *   - No 1º ano, escreva tudo em LETRA MAIÚSCULA (o jogo também mostra em maiúsculas).
 *   - Para colocar emojis: no Windows, aperte a tecla Windows + . (ponto); no celular, use o teclado de emojis.
 *   - Se algo der errado, o jogo avisa na tela inicial. Na "Área do professor" aparece
 *     quantas perguntas foram carregadas em cada tema e quais têm problema.
 *
 * Quantas perguntas aparecem em cada portal: 2 no 1º ano e 3 no 2º e 3º anos.
 * O jogo sorteia as perguntas do tema, então quanto mais perguntas, mais variado fica.
 * A última fase de cada ano ("Grande revisão") sorteia perguntas de todos os temas do ano.
 */

var PERGUNTAS = {

  /* ===================== 1º ANO ===================== */

  // Partes do corpo e os cinco sentidos
  'ano1-sentidos': [
    {
      pergunta: 'COM O QUE SENTIMOS O CHEIRO DA FLOR?',
      imagem: '🌸',
      respostas: [
        { texto: 'NARIZ', imagem: '👃', certa: true },
        { texto: 'ORELHA', imagem: '👂' },
        { texto: 'MÃO', imagem: '✋' }
      ],
      explicacao: 'SENTIMOS O CHEIRO COM O NARIZ. É O OLFATO.',
      imagemExplicacao: '👃 🌸'
    },
    {
      pergunta: 'COM O QUE OUVIMOS A MÚSICA?',
      imagem: '🎵',
      respostas: [
        { texto: 'ORELHAS', imagem: '👂', certa: true },
        { texto: 'OLHOS', imagem: '👀' },
        { texto: 'PÉS', imagem: '🦶' }
      ],
      explicacao: 'OUVIMOS COM AS ORELHAS. É A AUDIÇÃO.',
      imagemExplicacao: '👂 🎵'
    },
    {
      pergunta: 'COM O QUE VEMOS AS CORES?',
      imagem: '🌈',
      respostas: [
        { texto: 'OLHOS', imagem: '👀', certa: true },
        { texto: 'NARIZ', imagem: '👃' }
      ],
      explicacao: 'VEMOS COM OS OLHOS. É A VISÃO.',
      imagemExplicacao: '👀 🌈'
    },
    {
      pergunta: 'COM O QUE SENTIMOS O GOSTO DA FRUTA?',
      imagem: '🍓',
      respostas: [
        { texto: 'LÍNGUA', imagem: '👅', certa: true },
        { texto: 'ORELHA', imagem: '👂' },
        { texto: 'MÃO', imagem: '✋' }
      ],
      explicacao: 'A LÍNGUA SENTE O GOSTO: DOCE, SALGADO, AZEDO. É O PALADAR.',
      imagemExplicacao: '👅 🍓'
    },
    {
      pergunta: 'COMO SABEMOS QUE O SORVETE É GELADO?',
      imagem: '🍦',
      respostas: [
        { texto: 'TOCANDO', imagem: '✋', certa: true },
        { texto: 'OLHANDO', imagem: '👀' }
      ],
      explicacao: 'A PELE SENTE O FRIO E O QUENTE. É O TATO.',
      imagemExplicacao: '✋ 🍦'
    },
    {
      pergunta: 'O QUE USAMOS PARA ANDAR E PULAR?',
      imagem: '🏃',
      respostas: [
        { texto: 'PERNAS', imagem: '🦵', certa: true },
        { texto: 'BRAÇOS', imagem: '💪' }
      ],
      explicacao: 'USAMOS AS PERNAS E OS PÉS PARA ANDAR, CORRER E PULAR.',
      imagemExplicacao: '🦵 🦶'
    },
    {
      pergunta: 'QUANTOS SÃO OS SENTIDOS?',
      imagem: '👀 👂 👃 👅 ✋',
      respostas: [
        { texto: 'CINCO', imagem: '🖐️', certa: true },
        { texto: 'DOIS', imagem: '✌️' }
      ],
      explicacao: 'SÃO CINCO: VISÃO, AUDIÇÃO, OLFATO, PALADAR E TATO.',
      imagemExplicacao: '👀 👂 👃 👅 ✋'
    }
  ],

  // Hábitos de higiene
  'ano1-higiene': [
    {
      pergunta: 'O QUE USAMOS PARA LAVAR AS MÃOS?',
      imagem: '🙌',
      respostas: [
        { texto: 'ÁGUA E SABÃO', imagem: '🧼', certa: true },
        { texto: 'SUCO', imagem: '🧃' },
        { texto: 'TERRA', imagem: '🟫' }
      ],
      explicacao: 'ÁGUA E SABÃO TIRAM A SUJEIRA E OS MICRÓBIOS DAS MÃOS.',
      imagemExplicacao: '🧼 💧 🙌'
    },
    {
      pergunta: 'QUANDO LAVAMOS AS MÃOS?',
      imagem: '🧼',
      respostas: [
        { texto: 'ANTES DE COMER', imagem: '🍽️', certa: true },
        { texto: 'SÓ NO ANIVERSÁRIO', imagem: '🎂' }
      ],
      explicacao: 'LAVE AS MÃOS ANTES DE COMER E DEPOIS DE IR AO BANHEIRO.',
      imagemExplicacao: '🧼 🙌 🍽️'
    },
    {
      pergunta: 'O QUE FAZEMOS DEPOIS DE COMER?',
      imagem: '🍝',
      respostas: [
        { texto: 'ESCOVAR OS DENTES', imagem: '🦷', certa: true },
        { texto: 'CALÇAR O TÊNIS', imagem: '👟' }
      ],
      explicacao: 'ESCOVAR OS DENTES DEPOIS DE COMER DEIXA OS DENTES LIMPOS E FORTES.',
      imagemExplicacao: '🦷 ✨'
    },
    {
      pergunta: 'O QUE DEIXA O CORPO LIMPO?',
      imagem: '🧒',
      respostas: [
        { texto: 'TOMAR BANHO', imagem: '🛁', certa: true },
        { texto: 'VER TV', imagem: '📺' }
      ],
      explicacao: 'O BANHO TIRA O SUOR E A SUJEIRA DO CORPO.',
      imagemExplicacao: '🛁 🧼'
    },
    {
      pergunta: 'VAI ESPIRRAR. O QUE FAZEMOS?',
      imagem: '🤧',
      respostas: [
        { texto: 'COBRIR COM O BRAÇO', imagem: '💪', certa: true },
        { texto: 'ESPIRRAR NO AMIGO', imagem: '🗣️' }
      ],
      explicacao: 'COBRIMOS A BOCA E O NARIZ COM O BRAÇO PARA NÃO ESPALHAR MICRÓBIOS.',
      imagemExplicacao: '🤧 💪'
    },
    {
      pergunta: 'O QUE FAZEMOS COM A FRUTA ANTES DE COMER?',
      imagem: '🍎',
      respostas: [
        { texto: 'LAVAR', imagem: '💧', certa: true },
        { texto: 'JOGAR NO CHÃO', imagem: '⬇️' }
      ],
      explicacao: 'LAVAMOS AS FRUTAS PARA TIRAR A SUJEIRA.',
      imagemExplicacao: '🍎 💧'
    },
    {
      pergunta: 'A ESCOVA DE DENTES É SÓ SUA?',
      imagem: '🦷',
      respostas: [
        { texto: 'SIM', imagem: '👍', certa: true },
        { texto: 'NÃO', imagem: '👎' }
      ],
      explicacao: 'CADA PESSOA TEM A SUA ESCOVA. NÃO EMPRESTE A SUA!',
      imagemExplicacao: '🦷 👍'
    }
  ],

  // Dia e noite: o que fazemos e o que vemos no céu
  'ano1-dia-noite': [
    {
      pergunta: 'O QUE VEMOS NO CÉU DE DIA?',
      imagem: '🏙️',
      respostas: [
        { texto: 'O SOL', imagem: '☀️', certa: true },
        { texto: 'MUITAS ESTRELAS', imagem: '✨' }
      ],
      explicacao: 'DE DIA O SOL ILUMINA O CÉU. A LUZ DO SOL NÃO DEIXA A GENTE VER AS ESTRELAS.',
      imagemExplicacao: '☀️ 🏙️'
    },
    {
      pergunta: 'O QUE VEMOS NO CÉU À NOITE?',
      imagem: '🌃',
      respostas: [
        { texto: 'LUA E ESTRELAS', imagem: '🌙', certa: true },
        { texto: 'ARCO-ÍRIS', imagem: '🌈' }
      ],
      explicacao: 'À NOITE PODEMOS VER A LUA E AS ESTRELAS.',
      imagemExplicacao: '🌙 ⭐ ✨'
    },
    {
      pergunta: 'QUANDO É HORA DE DORMIR?',
      imagem: '😴',
      respostas: [
        { texto: 'À NOITE', imagem: '🌙', certa: true },
        { texto: 'NO MEIO DO DIA', imagem: '☀️' }
      ],
      explicacao: 'À NOITE O CORPO DESCANSA. DORMIR BEM AJUDA A CRESCER.',
      imagemExplicacao: '🌙 😴 🛏️'
    },
    {
      pergunta: 'A CORUJA ACORDA DE DIA OU À NOITE?',
      imagem: '🦉',
      respostas: [
        { texto: 'À NOITE', imagem: '🌙', certa: true },
        { texto: 'DE DIA', imagem: '☀️' }
      ],
      explicacao: 'A CORUJA DORME DE DIA E PROCURA ALIMENTO À NOITE.',
      imagemExplicacao: '🦉 🌙'
    },
    {
      pergunta: 'O QUE PROTEGE DO SOL FORTE?',
      imagem: '☀️',
      respostas: [
        { texto: 'BONÉ E SOMBRA', imagem: '🧢', certa: true },
        { texto: 'CASACO DE FRIO', imagem: '🧥' }
      ],
      explicacao: 'BONÉ, PROTETOR SOLAR E SOMBRA PROTEGEM A PELE DO SOL FORTE.',
      imagemExplicacao: '🧢 🌳 ☀️'
    },
    {
      pergunta: 'O CÉU ESTÁ CLARO E O SOL APARECEU. É DIA OU NOITE?',
      imagem: '🌅',
      respostas: [
        { texto: 'DIA', imagem: '☀️', certa: true },
        { texto: 'NOITE', imagem: '🌙' }
      ],
      explicacao: 'QUANDO O SOL APARECE, O CÉU FICA CLARO. É DIA!',
      imagemExplicacao: '🌅 ☀️'
    }
  ],

  // Materiais de que são feitos os objetos do dia a dia
  'ano1-materiais': [
    {
      pergunta: 'QUAL É FEITO DE MADEIRA?',
      respostas: [
        { texto: 'LÁPIS', imagem: '✏️', certa: true },
        { texto: 'CHAVE', imagem: '🔑' },
        { texto: 'CAMISETA', imagem: '👕' }
      ],
      explicacao: 'O LÁPIS É FEITO DE MADEIRA. A MADEIRA VEM DAS ÁRVORES.',
      imagemExplicacao: '🌳 ➜ ✏️'
    },
    {
      pergunta: 'QUAL É FEITO DE METAL?',
      respostas: [
        { texto: 'CHAVE', imagem: '🔑', certa: true },
        { texto: 'PAPEL', imagem: '📄' },
        { texto: 'MEIA', imagem: '🧦' }
      ],
      explicacao: 'A CHAVE É DE METAL. O METAL É DURO E BRILHANTE.',
      imagemExplicacao: '🔑 🔩'
    },
    {
      pergunta: 'QUAL É FEITO DE TECIDO?',
      respostas: [
        { texto: 'CAMISETA', imagem: '👕', certa: true },
        { texto: 'COLHER', imagem: '🥄' }
      ],
      explicacao: 'AS ROUPAS SÃO FEITAS DE TECIDO. O TECIDO É MACIO E DOBRA.',
      imagemExplicacao: '👕 🧦 👗'
    },
    {
      pergunta: 'DE QUE É FEITO O CADERNO?',
      imagem: '📒',
      respostas: [
        { texto: 'PAPEL', imagem: '📄', certa: true },
        { texto: 'METAL', imagem: '🔩' }
      ],
      explicacao: 'O CADERNO É DE PAPEL. O PAPEL É FEITO COM A MADEIRA DAS ÁRVORES.',
      imagemExplicacao: '🌳 ➜ 📄 ➜ 📒'
    },
    {
      pergunta: 'QUAL PODE QUEBRAR SE CAIR NO CHÃO?',
      respostas: [
        { texto: 'COPO DE VIDRO', imagem: '🥛', certa: true },
        { texto: 'URSINHO', imagem: '🧸' },
        { texto: 'CAMISETA', imagem: '👕' }
      ],
      explicacao: 'O VIDRO É DURO, MAS QUEBRA FÁCIL. CUIDADO!',
      imagemExplicacao: '🥛 ⚠️'
    },
    {
      pergunta: 'QUAL ESTICA E VOLTA AO NORMAL?',
      respostas: [
        { texto: 'BALÃO DE BORRACHA', imagem: '🎈', certa: true },
        { texto: 'LÁPIS', imagem: '✏️' }
      ],
      explicacao: 'A BORRACHA ESTICA E DEPOIS VOLTA AO NORMAL.',
      imagemExplicacao: '🎈 ↔️'
    }
  ],

  /* ===================== 2º ANO ===================== */

  // Seres vivos e não vivos
  'ano2-vivos': [
    {
      pergunta: 'Qual destes é um ser vivo?',
      respostas: [
        { texto: 'Peixe', imagem: '🐟', certa: true },
        { texto: 'Bola', imagem: '⚽' },
        { texto: 'Carro', imagem: '🚗' }
      ],
      explicacao: 'O peixe é um ser vivo: nasce, cresce, se alimenta e se reproduz.',
      imagemExplicacao: '🐟 🍽️ 📈'
    },
    {
      pergunta: 'Qual destes NÃO é um ser vivo?',
      respostas: [
        { texto: 'Ursinho', imagem: '🧸', certa: true },
        { texto: 'Árvore', imagem: '🌳' },
        { texto: 'Pássaro', imagem: '🐦' }
      ],
      explicacao: 'O ursinho não nasce, não se alimenta e não cresce. É um objeto.',
      imagemExplicacao: '🧸 ❌ 🍽️'
    },
    {
      pergunta: 'A planta é um ser vivo?',
      imagem: '🌱',
      respostas: [
        { texto: 'Sim', imagem: '👍', certa: true },
        { texto: 'Não', imagem: '👎' }
      ],
      explicacao: 'A planta nasce, cresce, precisa de água e de luz e produz sementes.',
      imagemExplicacao: '🌰 ➜ 🌱 ➜ 🌻'
    },
    {
      pergunta: 'O que todo ser vivo faz?',
      respostas: [
        { texto: 'Nasce e cresce', imagem: '🐣', certa: true },
        { texto: 'Funciona com pilha', imagem: '🔋' }
      ],
      explicacao: 'Os seres vivos nascem, crescem, se reproduzem e morrem.',
      imagemExplicacao: '🥚 ➜ 🐣 ➜ 🐔'
    },
    {
      pergunta: 'A água do rio é um ser vivo?',
      imagem: '💧',
      respostas: [
        { texto: 'Não', imagem: '👎', certa: true },
        { texto: 'Sim', imagem: '👍' }
      ],
      explicacao: 'A água não nasce nem cresce. Ela não é viva, mas todos os seres vivos precisam dela!',
      imagemExplicacao: '💧 ➜ 🐟 🌳 🧒'
    },
    {
      pergunta: 'Qual destes é um ser vivo?',
      respostas: [
        { texto: 'Cogumelo', imagem: '🍄', certa: true },
        { texto: 'Sol', imagem: '☀️' },
        { texto: 'Guarda-chuva', imagem: '🌂' }
      ],
      explicacao: 'O cogumelo é um ser vivo (um fungo). Ele nasce e cresce.',
      imagemExplicacao: '🍄 📈'
    },
    {
      pergunta: 'O Sol é um ser vivo?',
      imagem: '☀️',
      respostas: [
        { texto: 'Não', imagem: '👎', certa: true },
        { texto: 'Sim', imagem: '👍' }
      ],
      explicacao: 'O Sol é uma estrela. Ele não é vivo, mas dá luz e calor aos seres vivos.',
      imagemExplicacao: '☀️ ➜ 🌻'
    }
  ],

  // Plantas: partes e o que precisam para viver (água, luz, ar, solo)
  'ano2-plantas': [
    {
      pergunta: 'Qual parte da planta fica na terra e puxa a água?',
      imagem: '🌱',
      respostas: [
        { texto: 'Raiz', imagem: '🥕', certa: true },
        { texto: 'Flor', imagem: '🌸' },
        { texto: 'Folha', imagem: '🍃' }
      ],
      explicacao: 'A raiz segura a planta no solo e puxa a água. A cenoura é uma raiz!',
      imagemExplicacao: '🥕 💧'
    },
    {
      pergunta: 'De onde nasce uma planta nova?',
      respostas: [
        { texto: 'Semente', imagem: '🌰', certa: true },
        { texto: 'Tijolo', imagem: '🧱' }
      ],
      explicacao: 'A semente, com água e solo, germina e vira uma planta nova.',
      imagemExplicacao: '🌰 ➜ 🌱 ➜ 🌿'
    },
    {
      pergunta: 'Do que a planta precisa para viver?',
      imagem: '🌻',
      respostas: [
        { texto: 'Água e luz', imagem: '💧☀️', certa: true },
        { texto: 'Doce e escuro', imagem: '🍬🌑' }
      ],
      explicacao: 'As plantas precisam de água, luz, ar e solo.',
      imagemExplicacao: '💧 ☀️ 💨 🟫'
    },
    {
      pergunta: 'Uma planta ficou dias sem luz. Como ela fica?',
      imagem: '📦',
      respostas: [
        { texto: 'Fraca', imagem: '🥀', certa: true },
        { texto: 'Mais forte', imagem: '🌻' }
      ],
      explicacao: 'Sem luz, a planta não produz seu alimento e fica fraca e amarelada.',
      imagemExplicacao: '🌑 ➜ 🥀'
    },
    {
      pergunta: 'Qual parte da planta vira fruto?',
      respostas: [
        { texto: 'Flor', imagem: '🌸', certa: true },
        { texto: 'Raiz', imagem: '🥕' }
      ],
      explicacao: 'A flor vira fruto. Dentro do fruto ficam as sementes.',
      imagemExplicacao: '🌸 ➜ 🍎'
    },
    {
      pergunta: 'Qual parte leva a água da raiz até as folhas?',
      respostas: [
        { texto: 'Caule', imagem: '🌳', certa: true },
        { texto: 'Flor', imagem: '🌸' }
      ],
      explicacao: 'O caule sustenta a planta e leva a água até as folhas. O tronco da árvore é um caule.',
      imagemExplicacao: '🥕 ➜ 🌳 ➜ 🍃'
    },
    {
      pergunta: 'Onde a semente cresce melhor?',
      imagem: '🌰',
      respostas: [
        { texto: 'Na terra molhada, com luz', imagem: '🌱', certa: true },
        { texto: 'Numa caixa fechada', imagem: '📦' }
      ],
      explicacao: 'No solo a raiz encontra água. Na caixa fechada falta luz e terra.',
      imagemExplicacao: '🟫 💧 ☀️'
    }
  ],

  // Animais: onde vivem, o que comem, como se locomovem
  'ano2-animais': [
    {
      pergunta: 'Onde vive o peixe?',
      imagem: '🐟',
      respostas: [
        { texto: 'Na água', imagem: '🌊', certa: true },
        { texto: 'Na árvore', imagem: '🌳' }
      ],
      explicacao: 'O peixe vive na água e respira pelas brânquias.',
      imagemExplicacao: '🐟 🌊'
    },
    {
      pergunta: 'Qual animal se locomove rastejando?',
      respostas: [
        { texto: 'Cobra', imagem: '🐍', certa: true },
        { texto: 'Pássaro', imagem: '🐦' },
        { texto: 'Cavalo', imagem: '🐎' }
      ],
      explicacao: 'A cobra não tem pernas: ela rasteja, arrastando o corpo no chão.',
      imagemExplicacao: '🐍 〰️'
    },
    {
      pergunta: 'Qual animal voa?',
      respostas: [
        { texto: 'Borboleta', imagem: '🦋', certa: true },
        { texto: 'Tartaruga', imagem: '🐢' },
        { texto: 'Vaca', imagem: '🐄' }
      ],
      explicacao: 'A borboleta voa batendo as asas.',
      imagemExplicacao: '🦋 ☁️'
    },
    {
      pergunta: 'O que a vaca come?',
      imagem: '🐄',
      respostas: [
        { texto: 'Capim', imagem: '🌿', certa: true },
        { texto: 'Carne', imagem: '🍖' }
      ],
      explicacao: 'A vaca come capim e outras plantas. Ela é herbívora.',
      imagemExplicacao: '🐄 🌿'
    },
    {
      pergunta: 'Qual animal come outros animais?',
      respostas: [
        { texto: 'Leão', imagem: '🦁', certa: true },
        { texto: 'Coelho', imagem: '🐰' },
        { texto: 'Ovelha', imagem: '🐑' }
      ],
      explicacao: 'O leão caça outros animais para se alimentar. Ele é carnívoro.',
      imagemExplicacao: '🦁 🍖'
    },
    {
      pergunta: 'Qual animal vive na água e na terra?',
      respostas: [
        { texto: 'Sapo', imagem: '🐸', certa: true },
        { texto: 'Galinha', imagem: '🐔' }
      ],
      explicacao: 'O sapo nasce na água e, quando cresce, vive na terra, perto da água.',
      imagemExplicacao: '🐸 🌊 🌿'
    },
    {
      pergunta: 'Qual animal nada?',
      respostas: [
        { texto: 'Golfinho', imagem: '🐬', certa: true },
        { texto: 'Esquilo', imagem: '🐿️' }
      ],
      explicacao: 'O golfinho vive no mar e nada com as nadadeiras e a cauda.',
      imagemExplicacao: '🐬 🌊'
    },
    {
      pergunta: 'Onde vive o macaco?',
      imagem: '🐒',
      respostas: [
        { texto: 'Nas árvores da floresta', imagem: '🌳', certa: true },
        { texto: 'No fundo do mar', imagem: '🌊' }
      ],
      explicacao: 'O macaco vive na floresta e sobe nas árvores para comer frutas.',
      imagemExplicacao: '🐒 🌳 🍌'
    }
  ],

  // Luz e sombra
  'ano2-luz-sombra': [
    {
      pergunta: 'Do que precisamos para formar uma sombra?',
      respostas: [
        { texto: 'Luz', imagem: '🔦', certa: true },
        { texto: 'Água', imagem: '💧' }
      ],
      explicacao: 'A sombra aparece quando um objeto bloqueia a luz. Sem luz, não há sombra.',
      imagemExplicacao: '🔦 ➜ 🧸 ⬛'
    },
    {
      pergunta: 'A lanterna ilumina a árvore. Onde fica a sombra?',
      respostas: [
        { texto: 'Do outro lado da árvore', imagem: '🔦🌳⬛', certa: true },
        { texto: 'Entre a lanterna e a árvore', imagem: '🔦⬛🌳' }
      ],
      explicacao: 'A sombra fica do lado oposto à luz, porque a árvore bloqueia a luz.',
      imagemExplicacao: '🔦 ➜ 🌳 ⬛'
    },
    {
      pergunta: 'De dia, qual luz forma a nossa sombra no pátio?',
      respostas: [
        { texto: 'A luz do Sol', imagem: '☀️', certa: true },
        { texto: 'As nuvens', imagem: '☁️' }
      ],
      explicacao: 'De dia, a luz do Sol forma as sombras.',
      imagemExplicacao: '☀️ ➜ 🧒 ⬛'
    },
    {
      pergunta: 'Ao meio-dia o Sol está bem alto. Como fica a sombra?',
      imagem: '☀️',
      respostas: [
        { texto: 'Curtinha', imagem: '🌳▪️', certa: true },
        { texto: 'Bem comprida', imagem: '🌳▬▬▬' }
      ],
      explicacao: 'Com o Sol bem alto, a sombra fica pequena. De manhã cedo e no fim da tarde, ela fica comprida.',
      imagemExplicacao: '☀️ ⬇️ 🌳'
    },
    {
      pergunta: 'Qual destes produz luz?',
      respostas: [
        { texto: 'Lâmpada acesa', imagem: '💡', certa: true },
        { texto: 'Livro', imagem: '📕' },
        { texto: 'Ursinho', imagem: '🧸' }
      ],
      explicacao: 'Lâmpada, Sol, fogo e lanterna produzem luz.',
      imagemExplicacao: '💡 ☀️ 🔥 🔦'
    },
    {
      pergunta: 'Num quarto todo escuro, conseguimos ver as coisas?',
      imagem: '🌑',
      respostas: [
        { texto: 'Não', imagem: '👎', certa: true },
        { texto: 'Sim', imagem: '👍' }
      ],
      explicacao: 'Para enxergar, precisamos de luz. A luz bate nos objetos e chega aos nossos olhos.',
      imagemExplicacao: '💡 ➜ 🧸 ➜ 👀'
    },
    {
      pergunta: 'Aproximei o brinquedo da lanterna. A sombra na parede fica...',
      imagem: '🔦🧸',
      respostas: [
        { texto: 'Maior', imagem: '⬛', certa: true },
        { texto: 'Menor', imagem: '▪️' }
      ],
      explicacao: 'Quanto mais perto da luz, maior fica a sombra.',
      imagemExplicacao: '🔦🧸 ➜ ⬛'
    }
  ],

  /* ===================== 3º ANO ===================== */

  // Características e ciclo de vida dos animais
  'ano3-ciclo-vida': [
    {
      pergunta: 'Antes de virar borboleta, ela era...',
      imagem: '🦋',
      respostas: [
        { texto: 'Lagarta', imagem: '🐛', certa: true },
        { texto: 'Abelha', imagem: '🐝' },
        { texto: 'Formiga', imagem: '🐜' }
      ],
      explicacao: 'A borboleta nasce do ovo como lagarta, faz um casulo e depois vira borboleta.',
      imagemExplicacao: '🥚 ➜ 🐛 ➜ 🦋'
    },
    {
      pergunta: 'Quando o sapo nasce, ele é um...',
      imagem: '🐸',
      respostas: [
        { texto: 'Girino (parece um peixinho)', imagem: '🐟', certa: true },
        { texto: 'Pintinho', imagem: '🐣' }
      ],
      explicacao: 'O sapo nasce na água como girino. Depois crescem as pernas e a cauda some.',
      imagemExplicacao: '🥚 ➜ 🐟 ➜ 🐸'
    },
    {
      pergunta: 'Qual filhote nasce de um ovo?',
      respostas: [
        { texto: 'Pintinho', imagem: '🐣', certa: true },
        { texto: 'Cachorrinho', imagem: '🐶' },
        { texto: 'Gatinho', imagem: '🐱' }
      ],
      explicacao: 'As aves nascem de ovos. O cachorro e o gato se desenvolvem na barriga da mãe.',
      imagemExplicacao: '🥚 ➜ 🐣'
    },
    {
      pergunta: 'Qual filhote mama leite da mãe?',
      respostas: [
        { texto: 'Bezerro (filhote da vaca)', imagem: '🐄', certa: true },
        { texto: 'Peixinho', imagem: '🐟' }
      ],
      explicacao: 'Os mamíferos, como a vaca, o cachorro e o ser humano, mamam quando são filhotes.',
      imagemExplicacao: '🐄 🍼'
    },
    {
      pergunta: 'O corpo da galinha é coberto de...',
      imagem: '🐔',
      respostas: [
        { texto: 'Penas', imagem: '🐔', certa: true },
        { texto: 'Escamas', imagem: '🐟' },
        { texto: 'Pelos', imagem: '🐑' }
      ],
      explicacao: 'As aves têm penas. Os peixes têm escamas. Os mamíferos têm pelos.',
      imagemExplicacao: '🐔 🐟 🐑'
    },
    {
      pergunta: 'Qual é a ordem certa da vida da galinha?',
      respostas: [
        { texto: 'Ovo, pintinho, galinha', imagem: '🥚➜🐣➜🐔', certa: true },
        { texto: 'Galinha, pintinho, ovo', imagem: '🐔➜🐣➜🥚' }
      ],
      explicacao: 'Primeiro o ovo, depois o pintinho, que cresce e vira galinha. A galinha bota novos ovos.',
      imagemExplicacao: '🥚 ➜ 🐣 ➜ 🐔'
    },
    {
      pergunta: 'O que acontece na vida de todos os animais?',
      respostas: [
        { texto: 'Nascem, crescem e se reproduzem', imagem: '🐣➜🐔', certa: true },
        { texto: 'Ficam sempre do mesmo tamanho', imagem: '📏' }
      ],
      explicacao: 'Todo animal nasce, cresce, pode se reproduzir e morre. É o ciclo de vida.',
      imagemExplicacao: '🐣 ➜ 🐔 ➜ 🥚'
    }
  ],

  // O som e os cuidados com a audição e a visão
  'ano3-som-visao': [
    {
      pergunta: 'O som acontece quando algo...',
      imagem: '🥁',
      respostas: [
        { texto: 'Vibra (treme)', imagem: '〰️', certa: true },
        { texto: 'Fica parado', imagem: '🧱' }
      ],
      explicacao: 'O som acontece quando algo vibra: a pele do tambor, a corda do violão, a nossa garganta.',
      imagemExplicacao: '🥁 〰️ 👂'
    },
    {
      pergunta: 'Qual atitude protege a nossa audição?',
      respostas: [
        { texto: 'Fone com volume baixo', imagem: '🔉', certa: true },
        { texto: 'Fone no volume máximo', imagem: '🔊' }
      ],
      explicacao: 'Sons muito altos podem machucar a orelha. Use fone com volume baixo e por pouco tempo.',
      imagemExplicacao: '🎧 🔉 👂'
    },
    {
      pergunta: 'Qual destes sons é o mais fraco?',
      respostas: [
        { texto: 'Cochicho', imagem: '🤫', certa: true },
        { texto: 'Sirene', imagem: '🚒' },
        { texto: 'Tambor', imagem: '🥁' }
      ],
      explicacao: 'O cochicho é um som fraco. A sirene e o tambor fazem sons fortes.',
      imagemExplicacao: '🤫 🔈'
    },
    {
      pergunta: 'Como proteger os olhos do Sol?',
      imagem: '☀️',
      respostas: [
        { texto: 'Nunca olhar direto para o Sol', imagem: '🕶️', certa: true },
        { texto: 'Olhar direto para o Sol', imagem: '👀' }
      ],
      explicacao: 'Nunca olhe direto para o Sol: a luz forte machuca os olhos.',
      imagemExplicacao: '☀️ 🚫 👀'
    },
    {
      pergunta: 'Para ler e usar o computador, é bom...',
      respostas: [
        { texto: 'Ter boa luz e fazer pausas', imagem: '💡', certa: true },
        { texto: 'Ler no escuro, bem de perto', imagem: '🌑' }
      ],
      explicacao: 'Boa luz, distância certa e pausas para descansar ajudam a cuidar da visão.',
      imagemExplicacao: '💡 📖 👀'
    },
    {
      pergunta: 'Um colega não enxerga bem a lousa. O que é bom fazer?',
      respostas: [
        { texto: 'Ir ao médico dos olhos', imagem: '👓', certa: true },
        { texto: 'Não fazer nada', imagem: '🙈' }
      ],
      explicacao: 'O médico dos olhos (oftalmologista) examina a visão e pode indicar óculos.',
      imagemExplicacao: '👨‍⚕️ 👓'
    },
    {
      pergunta: 'Ponha a mão na garganta e fale. O que você sente?',
      imagem: '🗣️',
      respostas: [
        { texto: 'Uma tremidinha (vibração)', imagem: '〰️', certa: true },
        { texto: 'Nada', imagem: '⭕' }
      ],
      explicacao: 'Quando falamos, as cordas vocais vibram. Por isso a garganta treme.',
      imagemExplicacao: '🗣️ 〰️'
    }
  ],

  // Tipos de solo e sua importância
  'ano3-solo': [
    {
      pergunta: 'Em qual solo a água passa mais depressa?',
      imagem: '💧',
      respostas: [
        { texto: 'Arenoso (areia)', imagem: '🏖️', certa: true },
        { texto: 'Argiloso (barro)', imagem: '🏺' }
      ],
      explicacao: 'O solo arenoso tem grãos soltos: a água passa rápido. O argiloso segura a água.',
      imagemExplicacao: '🏖️ 💧 ⬇️'
    },
    {
      pergunta: 'Qual solo serve para fazer tijolo e vaso?',
      respostas: [
        { texto: 'Argiloso (barro)', imagem: '🏺', certa: true },
        { texto: 'Arenoso (areia)', imagem: '🏖️' }
      ],
      explicacao: 'A argila molhada pode ser moldada. Depois de queimada, fica dura: vira tijolo, telha e vaso.',
      imagemExplicacao: '🏺 🧱'
    },
    {
      pergunta: 'Qual solo é melhor para plantar?',
      imagem: '🌱',
      respostas: [
        { texto: 'Humoso (terra escura)', imagem: '🟫', certa: true },
        { texto: 'Arenoso (areia)', imagem: '🏖️' }
      ],
      explicacao: 'O solo humoso tem húmus, que vem de folhas e restos de seres vivos. É rico em nutrientes.',
      imagemExplicacao: '🍂 ➜ 🟫 ➜ 🌱'
    },
    {
      pergunta: 'O que forma o húmus do solo?',
      respostas: [
        { texto: 'Folhas e restos de seres vivos', imagem: '🍂', certa: true },
        { texto: 'Copos de plástico', imagem: '🥤' }
      ],
      explicacao: 'Folhas, frutas e restos de seres vivos se decompõem e viram húmus.',
      imagemExplicacao: '🍂 🍎 ➜ 🟫'
    },
    {
      pergunta: 'Por que o solo é importante?',
      respostas: [
        { texto: 'Nele crescem as plantas que comemos', imagem: '🌽', certa: true },
        { texto: 'Ele não serve para nada', imagem: '🚫' }
      ],
      explicacao: 'O solo sustenta as plantas, guarda água e é a casa de muitos animais.',
      imagemExplicacao: '🟫 🌽 🐜'
    },
    {
      pergunta: 'Chuva forte num solo sem plantas. O que acontece?',
      imagem: '🌧️',
      respostas: [
        { texto: 'A água leva a terra embora', imagem: '🌊', certa: true },
        { texto: 'Nascem árvores na hora', imagem: '🌳' }
      ],
      explicacao: 'As raízes seguram o solo. Sem plantas, a chuva carrega a terra. Isso se chama erosão.',
      imagemExplicacao: '🌧️ ➜ 🟫 ➜ 🌊'
    },
    {
      pergunta: 'Onde devemos jogar o lixo?',
      respostas: [
        { texto: 'Na lixeira', imagem: '🗑️', certa: true },
        { texto: 'No chão do jardim', imagem: '🌱' }
      ],
      explicacao: 'Lixo no chão suja o solo e a água. Use a lixeira e separe o reciclável.',
      imagemExplicacao: '🗑️ ♻️'
    }
  ],

  // A Terra, o Sol e a Lua
  'ano3-terra-sol-lua': [
    {
      pergunta: 'Qual é a forma da Terra?',
      respostas: [
        { texto: 'Arredondada, como uma bola', imagem: '🌍', certa: true },
        { texto: 'Achatada, como um papel', imagem: '📄' }
      ],
      explicacao: 'A Terra é arredondada, quase como uma bola. Vista do espaço, parece azul.',
      imagemExplicacao: '🌍 ⚽'
    },
    {
      pergunta: 'Por que existe o dia e a noite?',
      respostas: [
        { texto: 'A Terra gira', imagem: '🌍🔄', certa: true },
        { texto: 'O Sol se apaga', imagem: '☀️💤' }
      ],
      explicacao: 'A Terra gira. O lado virado para o Sol tem dia. O outro lado tem noite.',
      imagemExplicacao: '☀️ ➜ 🌍 🔄'
    },
    {
      pergunta: 'O Sol é...',
      imagem: '☀️',
      respostas: [
        { texto: 'Uma estrela', imagem: '⭐', certa: true },
        { texto: 'Um planeta', imagem: '🌍' },
        { texto: 'Uma lua', imagem: '🌙' }
      ],
      explicacao: 'O Sol é uma estrela: tem luz própria. É a estrela mais perto da Terra.',
      imagemExplicacao: '☀️ = ⭐'
    },
    {
      pergunta: 'A Lua tem luz própria?',
      imagem: '🌕',
      respostas: [
        { texto: 'Não. Ela reflete a luz do Sol', imagem: '☀️➜🌕', certa: true },
        { texto: 'Sim, como uma lâmpada', imagem: '💡' }
      ],
      explicacao: 'A Lua não tem luz própria. Ela brilha porque reflete a luz do Sol.',
      imagemExplicacao: '☀️ ➜ 🌕 ➜ 👀'
    },
    {
      pergunta: 'Qual figura mostra a Lua cheia?',
      respostas: [
        { texto: 'Lua cheia', imagem: '🌕', certa: true },
        { texto: '', imagem: '🌑' },
        { texto: '', imagem: '🌓' }
      ],
      explicacao: 'Na Lua cheia vemos a Lua toda iluminada. Na Lua nova quase não a vemos.',
      imagemExplicacao: '🌑 🌓 🌕 🌗'
    },
    {
      pergunta: 'Quem gira em volta da Terra?',
      imagem: '🌍',
      respostas: [
        { texto: 'A Lua', imagem: '🌙', certa: true },
        { texto: 'O Sol', imagem: '☀️' }
      ],
      explicacao: 'A Lua gira em volta da Terra. A Terra gira em volta do Sol.',
      imagemExplicacao: '🌙 ➜ 🌍 ➜ ☀️'
    },
    {
      pergunta: 'A maior parte da Terra é coberta de...',
      imagem: '🌍',
      respostas: [
        { texto: 'Água', imagem: '🌊', certa: true },
        { texto: 'Montanhas', imagem: '⛰️' }
      ],
      explicacao: 'A maior parte da Terra é coberta de água. Por isso ela parece azul vista do espaço.',
      imagemExplicacao: '🌍 🌊'
    }
  ]
};
