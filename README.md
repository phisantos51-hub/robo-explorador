# 🤖 Robô Explorador

Jogo de plataforma de **Ciências** para o **Ciclo de Alfabetização** (1º, 2º e 3º ano do Ensino Fundamental), pensado a partir dos temas de Ciências Naturais do Currículo da Cidade de São Paulo.

O robô percorre fases na natureza (jardim, floresta, rio, fazenda e céu noturno), pula obstáculos e coleta sementes, gotas de água, folhas e estrelas. No fim de cada fase, o **Portal da Pergunta** só abre quando a criança responde de 2 a 3 perguntas sobre o tema da fase, clicando com o mouse na resposta.

- Feito só com HTML, CSS e JavaScript. Não precisa instalar nada.
- Não depende de som: todo retorno é visual. O som começa **desligado** e pode ser ligado num botão.
- Não tem anúncios, links externos nem coleta de dados. O progresso fica salvo só no navegador do computador.
- Depois de aberto uma vez, continua funcionando sem internet.

## Temas de cada ano

Cada ano tem 5 fases: uma para cada tema e uma "Grande revisão" no final, com perguntas de todos os temas do ano.

| Ano | Fase 1 | Fase 2 | Fase 3 | Fase 4 |
| --- | --- | --- | --- | --- |
| **1º ano** | Corpo e os cinco sentidos (jardim) | Hábitos de higiene (rio) | Dia e noite (céu noturno) | Materiais dos objetos (fazenda) |
| **2º ano** | Seres vivos e não vivos (rio) | Plantas: partes e o que precisam (jardim) | Animais: onde vivem, o que comem, como se locomovem (floresta) | Luz e sombra (céu noturno) |
| **3º ano** | Ciclo de vida dos animais (fazenda) | Som, audição e visão (floresta) | Tipos de solo (jardim) | Terra, Sol e Lua (céu noturno) |

**Dificuldade:** o 1º ano tem poucos buracos, todos pequenos, e as perguntas aparecem em LETRA MAIÚSCULA. No 2º ano há buracos um pouco maiores, pontes e plataformas que se movem. No 3º ano há saltos mais longos. Em nenhum ano existe "fim de jogo": se o robô cair num buraco ou tocar num obstáculo, ele volta para a última bandeira.

## Obstáculos

Cada ambiente tem obstáculos ligados à natureza daquele lugar:

| Ambiente | Obstáculos |
| --- | --- |
| Jardim | espinhos de roseira, abelhas que voam de um lado para o outro, poças de lama que deixam o robô mais lento |
| Floresta | troncos que rolam, galhos que quebram pouco depois de pisar, cipós para se balançar sobre buracos |
| Rio | pedras que afundam e voltam, troncos boiando que levam o robô, correnteza que empurra para trás |
| Fazenda | cercas para pular, galinhas correndo, feno que cai do alto (com sombra no chão avisando) |
| Céu noturno | plataformas que só aparecem quando a estrela acende, morcegos voando, pedrinhas de meteoro (com brilho no chão avisando) |

- **Não há fim de jogo.** Ao tocar num obstáculo, o robô tropeça (ou se molha) com uma animação engraçada e volta para a última bandeira, sem perder os itens já coletados.
- **Primeira vez é sempre sozinha.** Cada obstáculo aparece primeiro num trecho seguro, logo depois de uma bandeira, com uma placa **!** e um balão explicando o que ele faz. Quando o obstáculo atravessa um buraco, esse primeiro buraco é raso: quem cair só precisa subir de volta.
- **1º ano:** apenas 2 obstáculos por fase, um de cada tipo, devagar e com uma seta piscando suavemente que mostra de onde ele vem.
- **2º ano:** os 3 obstáculos do ambiente, repetidos ao longo da fase, e plataformas que se mexem.
- **3º ano:** obstáculos combinados (por exemplo, abelha voando sobre espinhos), saltos mais longos e trechos em que é preciso esperar o momento certo.
- **Bandeiras:** quanto mais difícil a fase, mais bandeiras de salvamento ela tem.
- **Menos movimento:** se o computador estiver configurado para reduzir animações (opção de acessibilidade do Windows ou do navegador), os obstáculos ficam mais lentos e o robô não gira ao tropeçar.

Algumas perguntas do portal falam dos obstáculos (por exemplo, "Por que a abelha visita as flores?"). Elas estão no fim de cada tema em `perguntas.js`.

## Modo Desafio

Na tela de escolha de fases há o botão **🔥 Modo Desafio**. Ligado, ele deixa os obstáculos mais rápidos e mais numerosos em qualquer ano (no 1º ano, aparecem também os obstáculos dos anos seguintes). O jogo lembra a escolha naquele computador. Para voltar ao normal, clique no botão de novo.

## Estrelas

Cada fase dá até 3 estrelas:

1. ⭐ Chegar ao portal.
2. ⭐ Pegar pelo menos 2 de cada 3 itens da fase (a meta aparece no alto da tela).
3. ⭐ Acertar todas as perguntas na primeira tentativa.

Se errar uma pergunta, aparece uma explicação curta com desenhos e a criança tenta de novo.

## Controles

- **Setas ← →**: andar
- **Seta ↑** ou **barra de espaço**: pular
- **P** ou o botão **⏸ Pausar**: pausar (o jogo também pausa sozinho se a janela perder o foco)
- **Mouse**: responder às perguntas

## Área do professor

Na tela inicial, no canto de baixo à direita, fica o botão **Área do professor**. Ele pede o resultado de uma conta simples de soma e oferece:

- **Liberar todas as fases**: abre todas as fases dos três anos neste computador.
- **Apagar progresso**: apaga as estrelas e volta a bloquear as fases. O jogo pede confirmação antes de apagar.
- **Perguntas carregadas**: mostra quantas perguntas existem em cada tema e avisa se alguma tem erro de digitação.

## Como acrescentar perguntas

Todas as perguntas estão no arquivo **`perguntas.js`**. O começo desse arquivo explica, passo a passo, como copiar uma pergunta e trocar os textos e os desenhos (emojis). Dá para editar direto no site do GitHub: abra o arquivo, clique no lápis ✏️, faça a mudança e clique em **Commit changes**.

## Arquivos

```
index.html        telas do jogo
perguntas.js      todas as perguntas (é aqui que se acrescentam perguntas)
css/estilo.css    cores, tamanhos e botões
js/fases.js       anos, temas de cada fase e montagem dos cenários
js/obstaculos.js  obstáculos de cada ambiente, balões explicativos e Modo Desafio
js/desenho.js     desenhos do robô, dos cenários e dos itens
js/jogo.js        regras do jogo, portal, estrelas e área do professor
sw.js             guarda os arquivos para funcionar sem internet
```
