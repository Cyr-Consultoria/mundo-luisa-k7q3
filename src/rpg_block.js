/* ==================================================================
   MOTOR RPG — Mundo da Luísa  ·  v2
   Pixel art 16-bit top-down · 5 capítulos · 3 níveis de dificuldade
   ================================================================== */
const RPG = (() => {
  const TS=16, VW=240, VH=160, CH_W=16, CH_H=24;

  const CH = { luisa:{down:0,up:2,left:4,right:6}, mel:8, tobias:10, vovo:12, sombra:14 };
  const T = { grama:0,grama2:1,caminho:2,arvore:3,arbusto:4,agua:5,agua2:6,parede:7,janela:8,porta:9,
    telE:10,telM:11,telD:12,caixote:13,cerca:14,flor:15,sino:16,bola:17,novelo:18,estrela:19,brilho:20,
    chaoFlo:21,arvEsc:22,vagOff:23,vagOn:24, areia:25,ponte:26,ponteQ:27,pedra:28,
    chaoMont:29,rocha:30,svOff:31,svOn:32, pisoCas:33,paredeCas:34,portaCas:35,portaCasA:36,tocha:37,cristal:38 };

  const LEGENDA = {'.':T.grama,',':T.grama2,'=':T.caminho,'T':T.arvore,'a':T.arbusto,'~':T.agua,
    'P':T.parede,'J':T.janela,'D':T.porta,'1':T.telE,'2':T.telM,'3':T.telD,'#':T.cerca,'f':T.flor,
    'g':T.chaoFlo,'F':T.arvEsc,'s':T.areia,'b':T.ponte,'B':T.ponteQ,'r':T.pedra,
    'm':T.chaoMont,'R':T.rocha,'c':T.pisoCas,'W':T.paredeCas,'O':T.portaCas,'o':T.portaCasA,'X':T.tocha};
  const SOLIDOS = new Set(['T','~','P','J','#','1','2','3','F','B','r','R','W','O','X']);
  const ANIMADOS = {'~':[T.agua,T.agua2],'B':[T.ponteQ,T.agua2]};

  /* ================== DIFICULDADE ================== */
  const DIF = {
    facil:  {nome:'Fácil',   seta:true,  baloes:true,  dicas:99, obj:true,  vel:760, extra:0, grid:3, ordemCores:true},
    medio:  {nome:'Médio',   seta:false, baloes:true,  dicas:3,  obj:true,  vel:560, extra:0, grid:3, ordemCores:false},
    dificil:{nome:'Difícil', seta:false, baloes:false, dicas:0,  obj:false, vel:420, extra:1, grid:4, ordemCores:false}
  };
  let dif = 'facil', dicasRestantes = 99;
  const D = () => DIF[dif];

  /* ================== ATLAS ================== */
  let atlas=null, pronto=false;
  function carregarAtlas(cb){ atlas=new Image(); atlas.onload=()=>{pronto=true;cb&&cb()}; atlas.src=ATLAS_URL; }

  /* ================== CAPÍTULOS ================== */
  const CAP1 = {
    id:'aurora-1', n:1, titulo:'Vila Girassol', subtitulo:'Capítulo 1 · a Cor da Alegria',
    emoji:'🌻', cor:'#FFD84D',
    resumo:'O Reino de Aurora perdeu as cores. Ninguém vem salvar — a Luísa é que vai.',
    objetivo:'Ache as 3 coisas que a vila perdeu',
    mapa:[
      'TTTTTTTTTTTTTTTTTTTT','T..,.f.....TT..,...T','T.111.......f......T','T.PJP...aa.........T',
      'T.PDP......,.......T','T....,.............T','T..a...........a...T','T==================T',
      'T....=.......=.....T','T.,..=..,....=..a..T','T.111=.......=.....T','T.PJP=..........f..T',
      'T.PDP=..a..........T','T....=.............T','T..f.=....TT....,..T','TTTTTTTTTTTTTTTTTTTT'],
    inicio:{x:9,y:8}, caixote:{x:6,y:3}, alvoCaixote:{x:5,y:2}, entrega:{x:9,y:7},
    entregaTxt:'Leve tudo pro meio da rua e aperte A',
    metas:[
      {id:'sino', nome:'sino', icone:'🔔', x:3,y:2, tile:T.sino, acao:'pegar', noAlto:true,
       dica:'O sino está no telhado — preciso do caixote pra alcançar.',
       fala:'Peguei o sino! Agora a praça pode tocar de novo.'},
      {id:'bola', nome:'bola', icone:'⚽', x:8,y:12, tile:T.bola, acao:'pegar',
       dica:'A bola do Tobias caiu no mato, lá embaixo da rua.',
       fala:'A bola do Tobias! Ele vai ficar tão feliz.'},
      {id:'novelo', nome:'novelo', icone:'🧶', x:16,y:9, tile:T.novelo, acao:'pegar',
       dica:'O novelo da Mel rolou pro outro lado da vila, na direita.',
       fala:'O novelo da Mel. Ela vai fingir que não ligou.'}
    ],
    npcs:[
      {id:'mel',sprite:CH.mel,x:10,y:8,nome:'MEL',cor:'#F0B45A',falas:{
        inicio:['Miau. Tudo cinza.','Perdemos o sino, a bola do Tobias e o meu novelo.','Você é pequena demais pra isso.'],
        meio:['Tá… você achou um. Sorte.','Ainda faltam os outros.'],
        fim:['…tá bom. Você conseguiu.','Não vou dizer que eu duvidei. (miau)']}},
      {id:'tobias',sprite:CH.tobias,x:14,y:11,nome:'TOBIAS',cor:'#5AA8F0',falas:{
        inicio:['Minha bola sumiu no mato.','Eu tenho medo de ir lá pegar.'],
        meio:['Você tá indo mesmo? Sozinha?'],
        fim:['Você achou tudo! Você é a mais corajosa da vila.']}},
      {id:'vovo',sprite:CH.vovo,x:5,y:12,nome:'VOVÓ AURORA',cor:'#C4A0E8',falas:{
        inicio:['Essa coroa era minha, agora é sua.','Ela não te faz corajosa, minha flor.','Ela só lembra que você já é.'],
        meio:['Continue. Você está indo bem.'],
        fim:['Eu te dei a coroa. Quem trouxe a cor de volta foi você.']}}
    ],
    abertura:[['LUÍSA','A vila acordou sem cor.'],['LUÍSA','Todo mundo está esperando alguém aparecer pra resolver.'],
      ['LUÍSA','Então eu vou lá.']],
    final:[['LUÍSA','O sino, a bola e o novelo. Está tudo aqui.'],['LUÍSA','Vila Girassol… acorda!'],
      ['MEL','…miau. Você conseguiu mesmo.']]
  };

  const CAP2 = {
    id:'aurora-2', n:2, titulo:'Floresta Sussurrante', subtitulo:'Capítulo 2 · a Cor da Vida',
    emoji:'🌲', cor:'#7BD97B', escuro:true,
    resumo:'O Tobias se perdeu na floresta à noite. Mandaram esperar amanhecer. Ela não esperou.',
    objetivo:'Acenda os 3 vagalumes e ache o Tobias',
    mapa:[
      'FFFFFFFFFFFFFFFFFFFF',
      'FggggFFggggFFgggggFF',
      'FggFFggggFFggggFFggF',
      'FggggggggFggggggggFF',
      'FFFggggggggFFFgggggF',
      'FggggFFgggggggggggFF',
      'FggggggggggFFgggggFF',
      'FgFFgggggggggggFFggF',
      'FggggggFFgggggggFFgF',
      'FgggFgggggggFggggggF',
      'FFggggggFFggggggggFF',
      'FgggggggggggFFggggFF',
      'FggFFgggggggggggggFF',
      'FgggggggFFggggggggFF',
      'FgggFFggggggggFgggFF',
      'FFFFFFFFFFFFFFFFFFFF'
    ],
    inicio:{x:2,y:14}, entrega:null,
    metas:[
      {id:'v1', nome:'1º vagalume', icone:'✨', x:5,y:11, tile:T.vagOff, tileOn:T.vagOn, acao:'sequencia',
       cfg:{n:3}, dica:'O primeiro vagalume pisca 3 luzes. Repita na mesma ordem.',
       antes:'Este vagalume vai piscar. Preciso repetir na mesma ordem.',
       fala:'Acendeu! A floresta clareou um pouquinho.'},
      {id:'v2', nome:'2º vagalume', icone:'✨', x:14,y:6, tile:T.vagOff, tileOn:T.vagOn, acao:'sequencia',
       cfg:{n:4}, dica:'O segundo pisca 4 luzes. Olhe com atenção antes de tocar.',
       antes:'Esse aqui pisca mais vezes. Calma e atenção.',
       fala:'Mais luz! Já dá pra enxergar o caminho.'},
      {id:'v3', nome:'3º vagalume', icone:'✨', x:6,y:3, tile:T.vagOff, tileOn:T.vagOn, acao:'sequencia',
       cfg:{n:5}, dica:'O último pisca 5 luzes. Se errar, ele repete mais devagar.',
       antes:'O último. Cinco luzes. Eu consigo.',
       fala:'A floresta inteira acendeu!'},
      {id:'achar', nome:'achar o Tobias', icone:'🧒', x:16,y:12, tile:null, acao:'falar', exigeTudo:true,
       dica:'Com tudo aceso, o Tobias está no canto de baixo à direita da floresta.',
       fala:'Achei você!'}
    ],
    npcs:[
      {id:'mel',sprite:CH.mel,x:3,y:13,nome:'MEL',cor:'#F0B45A',falas:{
        inicio:['Miau! Tá escuro demais.','Vamos voltar. Sério.','…tá bom, eu vou junto. Mas reclamando.'],
        meio:['Cada luz que você acende, eu tenho menos medo.'],
        fim:['Você entrou no escuro pra buscar ele. Miau.']}},
      {id:'tobiasNpc',sprite:CH.tobias,x:16,y:12,nome:'TOBIAS',cor:'#5AA8F0',oculto:true,falas:{
        inicio:['(encolhido debaixo da árvore)'],meio:['(encolhido debaixo da árvore)'],
        fim:['Eu tava esperando alguém vir me buscar…']}}
    ],
    abertura:[['LUÍSA','A floresta engoliu o Tobias e ninguém quis entrar.'],
      ['MEL','Espera amanhecer, Luísa.','#F0B45A'],
      ['LUÍSA','Se eu esperar, ele passa a noite todinha com medo.'],
      ['LUÍSA','Os vagalumes acendem o caminho. É só repetir o que eles piscam.']],
    final:[['TOBIAS','Eu tava esperando alguém vir me buscar…'],
      ['LUÍSA','Eu vim.'],
      ['LUÍSA','Mas agora a gente sai daqui junto — eu não vou te carregar, você vai andar comigo.'],
      ['TOBIAS','…tá. Eu consigo andar.']]
  };

  const CAP3 = {
    id:'aurora-3', n:3, titulo:'Lago Espelho', subtitulo:'Capítulo 3 · a Cor da Calma',
    emoji:'💧', cor:'#35D6D0',
    resumo:'A ponte quebrou em nove pedaços e afundou. E o lago mostra o reflexo de quem olha.',
    objetivo:'Fale com o Reflexo e conserte a ponte',
    mapa:[
      'TTTTTTTTTTTTTTTTTTTT',
      'TsssssssssssssssrssT',
      'TsrssssssssssssssssT',
      'TssssssssssssrsssrsT',
      'T~~~~~~~BB~~~~~~~~~T',
      'T~~~~~~~BB~~~~~~~~~T',
      'T~~~~~~~BB~~~~~~~~~T',
      'T~~~~~~~BB~~~~~~~~~T',
      'TssssssssssssssssssT',
      'TssssrssssssssssrssT',
      'TssssssssssssssssssT',
      'T..,...............T',
      'T.,....,.....,.....T',
      'T........,.........T',
      'T..T...........T...T',
      'TTTTTTTTTTTTTTTTTTTT'
    ],
    inicio:{x:9,y:12}, entrega:{x:8,y:2}, entregaTxt:'Atravesse a ponte e chegue na outra margem',
    abre:{char:'B', meta:'ponte', tile:T.ponte},
    metas:[
      {id:'reflexo', nome:'o Reflexo', icone:'🪞', x:6,y:8, tile:T.estrela, acao:'escolha',
       dica:'O Reflexo brilha na beira do lago, à esquerda. Fale com ele.',
       fala:'Obrigada, Reflexo.'},
      {id:'ponte', nome:'consertar a ponte', icone:'🌉', x:8,y:8, tile:T.pedra, acao:'deslizante',
       dica:'Fique na beira do lago, embaixo da ponte quebrada, e aperte A.',
       antes:'As peças da ponte estão todas embaralhadas. Vou remontar.',
       fala:'A ponte voltou! Dá pra atravessar.'}
    ],
    npcs:[
      {id:'mel',sprite:CH.mel,x:11,y:9,nome:'MEL',cor:'#F0B45A',falas:{
        inicio:['Miau. Água. Eu odeio água.','A ponte caiu toda. Nove pedaços.'],
        meio:['Você tá mesmo montando isso?'],
        fim:['A ponte ficou até bonita. Miau.']}}
    ],
    abertura:[['LUÍSA','A ponte quebrou em nove pedaços.'],
      ['LUÍSA','Sem ponte, ninguém atravessa pro outro lado.'],
      ['LUÍSA','E esse lago… mostra a gente por dentro.']],
    final:[['LUÍSA','A ponte inteira de novo.'],['LUÍSA','O lago ficou azul — azul de calma, não de tristeza.'],
      ['MEL','Miau. Até eu atravesso agora.']]
  };

  const CAP4 = {
    id:'aurora-4', n:4, titulo:'Montanha do Vento', subtitulo:'Capítulo 4 · a Cor da Coragem',
    emoji:'⛰️', cor:'#FF5F5F', vento:true,
    resumo:'No topo há uma porta de pedra que só abre com a Canção de Aurora — a música da vovó.',
    objetivo:'Toque a Canção de Aurora nos 3 sinos de vento',
    mapa:[
      'RRRRRRRRRRRRRRRRRRRR',
      'RRRRRRRRmmmmRRRRRRRR',
      'RRmmmmmmmmmmmmmmmmRR',
      'RRmmmmRRRRRRRRRRRRRR',
      'RRmmmmRRRRRRRRRRRRRR',
      'RRmmmmmmmmmmmmmmmmRR',
      'RRRRRRRRRRRRRRmmmmRR',
      'RRRRRRRRRRRRRRmmmmRR',
      'RRRRRRRRRRRRRRmmmmRR',
      'RRmmmmmmmmmmmmmmmmRR',
      'RRmmmmRRRRRRRRRRRRRR',
      'RRmmmmRRRRRRRRRRRRRR',
      'RRmmmmRRRRRRRRRRRRRR',
      'RRmmmmmmmmmmmmmmmmRR',
      'RRmmmmmmmmmmmmmmmmRR',
      'RRRRRRRRRRRRRRRRRRRR'
    ],
    inicio:{x:9,y:14}, entrega:{x:9,y:1}, entregaTxt:'Suba até a porta de pedra, no topo',
    metas:[
      {id:'s1', nome:'1º sino', icone:'🎵', x:3,y:11, tile:T.svOff, tileOn:T.svOn, acao:'musical',
       cfg:{n:4}, dica:'O sino toca 4 notas. Repita tocando os sinos coloridos na mesma ordem.',
       antes:'A vovó cantava assim… quatro notas. Vou repetir.',
       fala:'Essa é a primeira parte da canção!'},
      {id:'s2', nome:'2º sino', icone:'🎵', x:15,y:7, tile:T.svOff, tileOn:T.svOn, acao:'musical',
       cfg:{n:5}, dica:'Agora são 5 notas. Cada sino tem uma cor e um som diferente.',
       antes:'Cinco notas agora. Ouvir antes de tocar.',
       fala:'Segunda parte! O vento está mais fraco.'},
      {id:'s3', nome:'3º sino', icone:'🎵', x:3,y:3, tile:T.svOff, tileOn:T.svOn, acao:'musical',
       cfg:{n:6}, dica:'A última parte tem 6 notas. Errar aqui não tira nada — ela repete.',
       antes:'A última parte. Seis notas. Coragem é ir com medo mesmo.',
       fala:'A Canção de Aurora inteira! A porta está abrindo!'}
    ],
    npcs:[
      {id:'mel',sprite:CH.mel,x:11,y:13,nome:'MEL',cor:'#F0B45A',falas:{
        inicio:['Miau… esse vento me empurra pra trás.','Eu tô com medo.'],
        meio:['Você também tá com medo. Eu vi.'],
        fim:['A gente subiu com medo e chegou igual.']}}
    ],
    abertura:[['LUÍSA','O vento aqui empurra pra trás.'],
      ['MEL','Eu tô com medo.','#F0B45A'],
      ['LUÍSA','Eu também. Vem cá, segura na minha mão.'],
      ['LUÍSA','A porta lá em cima só abre com a canção da vovó.']],
    final:[['LUÍSA','A porta de pedra abriu.'],
      ['LUÍSA','Vovó, eu lembrei da sua música inteirinha.'],
      ['MEL','Miau. Faltava só o castelo agora.']]
  };

  const CAP5 = {
    id:'aurora-5', n:5, titulo:'Castelo Cinzento', subtitulo:'Capítulo 5 · o encontro',
    emoji:'🏰', cor:'#A78BFA',
    resumo:'Três portas, três provas. E no salão, a Sombra do Medo — que tem a cara dela.',
    objetivo:'Passe pelas 3 portas e enfrente a Sombra',
    mapa:[
      'WWWWWWWWWWWWWWWWWWWW',
      'WcccccXcccccXccccccW',
      'WccccccccccccccccccW',
      'WcWWWccccccccccWWWcW',
      'WcWXccccccccccccXWcW',
      'WccccccccccccccccccW',
      'WccccccccccccccccccW',
      'WWWWOWWWWWOWWWWWOWWW',
      'WccccccccccccccccccW',
      'WccccccccccccccccccW',
      'WcWWWWccccccccWWWWcW',
      'WcWXccccccccccccXWcW',
      'WccccccccccccccccccW',
      'WccccccccccccccccccW',
      'WcccccXcccccXccccccW',
      'WWWWWWWWWWWWWWWWWWWW'
    ],
    inicio:{x:9,y:13}, entrega:{x:9,y:2}, entregaTxt:'Vá até o salão da Sombra, lá em cima',
    metas:[
      {id:'p1', nome:'porta da memória', icone:'🚪', x:4,y:7, tile:null, acao:'sequencia',
       cfg:{n:4}, dica:'A porta da esquerda pede a prova da memória: repita as luzes.',
       antes:'Essa porta lembra da floresta. Luzes na ordem certa.',
       fala:'A primeira porta abriu.'},
      {id:'p2', nome:'porta do encaixe', icone:'🚪', x:10,y:7, tile:null, acao:'deslizante',
       dica:'A porta do meio pede a prova do encaixe: monte a figura.',
       antes:'Essa lembra o lago. Preciso remontar a figura.',
       fala:'A segunda porta abriu.'},
      {id:'p3', nome:'porta da canção', icone:'🚪', x:16,y:7, tile:null, acao:'musical',
       cfg:{n:5}, dica:'A porta da direita pede a canção: repita as notas.',
       antes:'E essa lembra a montanha. A canção da vovó de novo.',
       fala:'A terceira porta abriu. O salão está livre.'},
      {id:'sombra', nome:'a Sombra', icone:'🌑', x:9,y:2, tile:null, acao:'final', exigeTudo:true,
       dica:'Acenda as quatro cores na ordem: Alegria, Vida, Calma, Coragem.', fala:'…'}
    ],
    npcs:[
      {id:'sombraNpc',sprite:CH.sombra,x:9,y:2,nome:'A SOMBRA',cor:'#D06B8C',falas:{
        inicio:['Você é pequena.','Você tem medo.','Então por que você continua vindo?'],
        meio:['Cada porta que você abre me deixa menor.'],
        fim:['…obrigada por não me apagar.']}}
    ],
    abertura:[['LUÍSA','O castelo é a última parada.'],
      ['LUÍSA','Três portas. Cada uma pede uma coisa que eu já aprendi.'],
      ['LUÍSA','E lá em cima… tem alguém me esperando.']],
    final:[['SOMBRA','Você é pequena.','#D06B8C'],['LUÍSA','Sou.'],
      ['SOMBRA','Você tem medo.','#D06B8C'],['LUÍSA','Tenho.'],
      ['SOMBRA','Então por que você continua vindo?','#D06B8C'],
      ['LUÍSA','Porque ter medo e ir mesmo assim é o que ser corajosa quer dizer.'],
      ['LUÍSA','Você não é minha inimiga. Você é a parte de mim que ficou sem cor.'],
      ['LUÍSA','Vem. Vamos ter cor juntas.']]
  };

  /* ==================================================================
     2ª AVENTURA — "Luísa e o Mapa que Faltava" (capítulos 6 a 10)
     Aurora recuperou as cores, mas está perdendo os nomes e as contas.
     A Sombra, agora companheira, vem junto.
     ================================================================== */

  const CAP6 = {
    id:'mapa-6', n:6, titulo:'Porto das Letras', subtitulo:'Capítulo 6 · o nome do farol',
    emoji:'🔤', cor:'#FF8A5B',
    resumo:'O farol perdeu o nome. Sem nome, os barcos não sabem que ali é casa.',
    objetivo:'Devolva as palavras que o mar levou',
    mapa:[
      'TTTTTTTTTTTTTTTTTTTT',
      'T~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~bb~~~~~~~~T',
      'T~~~r~~~~bb~~~r~~~~T',
      'T~~~~~~~~bb~~~~~~~~T',
      'TssssssssbbssssssssT',
      'TsssssssssssssssssrT',
      'Tsss123ssssssssssssT',
      'TsssPJPssssssssssssT',
      'TsssPDPssssssssssssT',
      'TssssssssssssssssssT',
      'TsssssrssssssssssssT',
      'TssssssssssssssssssT',
      'T,,,,,,,,,,,,,,,,,,T',
      'T..................T',
      'TTTTTTTTTTTTTTTTTTTT'
    ],
    inicio:{x:9,y:14}, entrega:{x:5,y:9},
    entregaTxt:'Leve o nome de volta pra porta do farol',
    metas:[
      {id:'mar', nome:'a palavra do mar', icone:'🌊', x:9,y:4, tile:T.brilho, acao:'palavra',
       cfg:{nivel:1}, dica:'Vá até a ponta do píer, lá em cima, e aperte A.',
       antes:'Tem uma palavra boiando aqui. Falta juntar as letras.',
       fala:'Essa eu devolvi pro mar.'},
      {id:'areia', nome:'a palavra da areia', icone:'🐚', x:15,y:11, tile:T.brilho, acao:'palavra',
       cfg:{nivel:2}, dica:'Está na areia, à direita de onde você começou.',
       antes:'Alguém escreveu na areia e a onda embaralhou.',
       fala:'Consertei antes da próxima onda.'},
      {id:'nome', nome:'o nome do farol', icone:'💡', x:5,y:10, tile:T.estrela, acao:'palavra',
       cfg:{nivel:3}, exigeTudo:true,
       dica:'Fique na frente da porta do farol e aperte A.',
       antes:'Agora o nome dele. Esse é o mais comprido.',
       fala:'O farol tem nome de novo!'}
    ],
    npcs:[
      {id:'mel',sprite:CH.mel,x:12,y:12,nome:'MEL',cor:'#F0B45A',falas:{
        inicio:['Miau. Areia entra na pata.','O farol apagou porque esqueceram como ele chama.'],
        meio:['Você tá juntando letra que nem quem junta concha.'],
        fim:['Acendeu. Miau. Dá pra ver de longe.']}},
      {id:'sombra',sprite:CH.sombra,x:7,y:13,nome:'SOMBRA',cor:'#D06B8C',falas:{
        inicio:['Eu vim junto. Você deixou.','Sem nome, a gente some. Eu sei disso melhor que ninguém.'],
        meio:['Continua. Eu seguro a lanterna.'],
        fim:['Você devolveu o nome dele. Igual fez com o meu.']}}
    ],
    abertura:[['LUÍSA','O farol está apagado.'],
      ['LUÍSA','A placa do nome caiu na água e as letras se soltaram.'],
      ['LUÍSA','Sem nome, os barcos não sabem que aqui é casa.']],
    final:[['LUÍSA','Pronto. Farol com nome, farol aceso.'],
      ['SOMBRA','Nome é o que faz a gente existir de longe.','#D06B8C'],
      ['LUÍSA','Então vamos devolver todos os que sumiram.']]
  };

  const CAP7 = {
    id:'mapa-7', n:7, titulo:'Feira dos Números', subtitulo:'Capítulo 7 · ninguém sabe quanto',
    emoji:'🔢', cor:'#4FA8E8',
    resumo:'A feira abriu, mas ninguém sabe contar. Nem quanto tem, nem quanto falta.',
    objetivo:'Faça as contas que a feira perdeu',
    mapa:[
      'TTTTTTTTTTTTTTTTTTTT',
      'T..................T',
      'T.123....123....123T',
      'T.PDP....PDP....PDPT',
      'T..................T',
      'T.================.T',
      'T..................T',
      'T....a......a......T',
      'T..................T',
      'T.================.T',
      'T..................T',
      'T.123....123....123T',
      'T.PDP....PDP....PDPT',
      'T..................T',
      'T..f....f....f....fT',
      'TTTTTTTTTTTTTTTTTTTT'
    ],
    inicio:{x:9,y:13}, entrega:{x:9,y:7},
    entregaTxt:'Volte pro meio da praça e conte pra todo mundo',
    metas:[
      {id:'banca1', nome:'a banca das frutas', icone:'🍎', x:3,y:4, tile:T.brilho, acao:'numero',
       cfg:{nivel:1,n:3}, dica:'Primeira banca de cima, à esquerda.',
       antes:'O moço não sabe quantas frutas ele tem. Vou contar com ele.',
       fala:'Agora ele sabe quantas são.'},
      {id:'banca2', nome:'a banca do pão', icone:'🍞', x:16,y:10, tile:T.brilho, acao:'numero',
       cfg:{nivel:2,n:3}, dica:'Banca de baixo, bem à direita.',
       antes:'Aqui precisa somar duas cestas.',
       fala:'Somei as duas cestas.'},
      {id:'troco', nome:'o troco justo', icone:'🪙', x:9,y:10, tile:T.estrela, acao:'escolha',
       exigeTudo:true,
       cfg:{ titulo:'🪙 A feirante pergunta', pergunta:'"Sobrou uma moeda. Fico com ela ou devolvo?"',
         a:{ rotulo:'Devolve', falas:[['FEIRANTE','Sobrou uma moeda. Fico com ela?','#8FE3FF'],
             ['LUÍSA','Devolve.'],['LUÍSA','Ela não é sua, mesmo que ninguém veja.'],
             ['FEIRANTE','…então a conta fecha de verdade.','#8FE3FF']] },
         b:{ rotulo:'Pergunta de quem é', falas:[['FEIRANTE','Sobrou uma moeda. Fico com ela?','#8FE3FF'],
             ['LUÍSA','Pergunta primeiro de quem é.'],['LUÍSA','Talvez alguém esteja procurando.'],
             ['FEIRANTE','…então a conta fecha de verdade.','#8FE3FF']] } },
       dica:'A feirante está no meio da praça, embaixo.',
       fala:'A conta fechou certa.'}
    ],
    npcs:[
      {id:'tobias',sprite:CH.tobias,x:6,y:6,nome:'TOBIAS',cor:'#7BD97B',falas:{
        inicio:['Luísa! Ninguém consegue dar troco.','Eu tentei contar nos dedos. Acabaram os dedos.'],
        meio:['Você conta rápido demais.'],
        fim:['A feira inteira voltou a funcionar!']}},
      {id:'mel',sprite:CH.mel,x:13,y:8,nome:'MEL',cor:'#F0B45A',falas:{
        inicio:['Miau. Aqui cheira a peixe e eu aprovo.','Contar é fácil: um peixe, outro peixe.'],
        meio:['Dois peixes já é muito peixe.'],
        fim:['Miau. Que ninguém conte os meus.']}}
    ],
    abertura:[['LUÍSA','A feira abriu, mas parou.'],
      ['LUÍSA','Ninguém sabe quanto tem, nem quanto falta, nem quanto devolver.'],
      ['LUÍSA','Números também são nomes — nome de quantidade.']],
    final:[['LUÍSA','A feira voltou a contar.'],
      ['TOBIAS','E o troco saiu certinho!','#7BD97B'],
      ['LUÍSA','Falta a caverna. Dizem que lá o eco guarda o que a gente esquece.']]
  };

  const CAP8 = {
    id:'mapa-8', n:8, titulo:'Caverna dos Ecos', subtitulo:'Capítulo 8 · o que ficou guardado',
    emoji:'🕯️', cor:'#9B7BD9', escuro:true,
    resumo:'A caverna repete tudo o que já foi dito. Inclusive o que Aurora esqueceu.',
    objetivo:'Acenda os 2 ecos e diga a palavra guardada',
    mapa:[
      'RRRRRRRRRRRRRRRRRRRR',
      'RmmmmmmmmmmmmmmmmmmR',
      'RmmRRRRmmmmmRRRRmmmR',
      'RmmRRRRmmmmmRRRRmmmR',
      'RmmmmmmmmmmmmmmmmmmR',
      'RmmmmmRRRRRRRRmmmmmR',
      'RmmmmmmmmmmmmmmmmmmR',
      'RRRRRRmmmmmmmmRRRRRR',
      'RmmmmmmmmmmmmmmmmmmR',
      'RmmmmRRRRmmRRRRmmmmR',
      'RmmmmmmmmmmmmmmmmmmR',
      'RmmmmmmmmmmmmmmmmmmR',
      'RmmmRRRRRRRRRRRRmmmR',
      'RmmmmmmmmmmmmmmmmmmR',
      'RmmmmmmmmmmmmmmmmmmR',
      'RRRRRRRRRRRRRRRRRRRR'
    ],
    inicio:{x:9,y:14}, entrega:{x:9,y:1},
    entregaTxt:'Suba até o fundo da caverna, lá em cima',
    metas:[
      {id:'eco1', nome:'1º eco', icone:'🕯️', x:3,y:4, tile:T.vagOff, tileOn:T.vagOn, acao:'sequencia',
       cfg:{n:3}, dica:'À esquerda, depois da primeira passagem estreita.',
       antes:'O eco pisca antes de repetir. Vou prestar atenção.',
       fala:'Primeiro eco aceso.'},
      {id:'eco2', nome:'2º eco', icone:'🕯️', x:16,y:10, tile:T.vagOff, tileOn:T.vagOn, acao:'sequencia',
       cfg:{n:4}, dica:'Lá embaixo à direita, passando pelo corredor do meio.',
       antes:'Esse repete mais coisa. Calma.',
       fala:'Segundo eco aceso.'},
      {id:'guardada', nome:'a palavra guardada', icone:'📢', x:9,y:8, tile:T.estrela, acao:'palavra',
       cfg:{nivel:3}, exigeTudo:true,
       dica:'No meio da caverna, entre os dois corredores.',
       antes:'Com os dois ecos acesos dá pra ouvir o que ficou guardado aqui.',
       fala:'A caverna disse de volta!'}
    ],
    npcs:[
      {id:'sombra',sprite:CH.sombra,x:12,y:13,nome:'SOMBRA',cor:'#D06B8C',falas:{
        inicio:['Escuro de novo. Você já passou por isso.','Dessa vez eu vim de propósito.'],
        meio:['O eco não inventa. Só devolve.'],
        fim:['Guardar não é esconder. É esperar alguém voltar buscar.']}}
    ],
    abertura:[['LUÍSA','Escuro. Mas eu já sei andar no escuro.'],
      ['LUÍSA','Essa caverna repete tudo o que já foi dito aqui dentro.'],
      ['LUÍSA','Então ela guardou o que Aurora esqueceu.']],
    final:[['LUÍSA','A caverna devolveu a palavra.'],
      ['SOMBRA','Ela estava aqui esse tempo todo. Só faltava quem viesse buscar.','#D06B8C'],
      ['LUÍSA','Falta um lugar. E esse eu conheço de cor.']]
  };

  const CAP9 = {
    id:'mapa-9', n:9, titulo:'Jardim da Vovó', subtitulo:'Capítulo 9 · o que não se esquece',
    emoji:'🌻', cor:'#F0B45A',
    resumo:'O jardim não perdeu nada. A vovó lembra de tudo — e é ela que ensina a lembrar.',
    objetivo:'Ajude a vovó a guardar as lembranças',
    mapa:[
      'TTTTTTTTTTTTTTTTTTTT',
      'T....ffff....ffff..T',
      'T..................T',
      'T.a....123....a....T',
      'T......PJP.........T',
      'T......PDP.........T',
      'T..................T',
      'T..===========.....T',
      'T..................T',
      'T.ff....a....ff....T',
      'T..................T',
      'T....a........a....T',
      'T..................T',
      'T.f..f..f..f..f..f.T',
      'T..................T',
      'TTTTTTTTTTTTTTTTTTTT'
    ],
    inicio:{x:9,y:14}, entrega:{x:8,y:5},
    entregaTxt:'Entre na casa da vovó',
    metas:[
      {id:'retrato', nome:'o retrato', icone:'🖼️', x:5,y:9, tile:T.estrela, acao:'deslizante',
       dica:'Perto das flores do meio, à esquerda.',
       antes:'O retrato caiu e se partiu. Vou montar de novo.',
       fala:'O retrato voltou inteiro.'},
      {id:'semente', nome:'a semente', icone:'🌱', x:9,y:7, tile:T.flor, acao:'pegar',
       dica:'No caminho de terra, no meio do jardim.',
       fala:'Uma semente. A vovó vai saber o que é.'},
      {id:'lembranca', nome:'a lembrança', icone:'💛', x:12,y:11, tile:T.brilho, acao:'escolha',
       exigeTudo:true,
       cfg:{ titulo:'💛 A vovó pergunta', pergunta:'"O que você quer guardar pra nunca esquecer?"',
         a:{ rotulo:'Um dia bom', falas:[['VOVÓ','O que você quer guardar pra nunca esquecer?','#FFD84D'],
             ['LUÍSA','Um dia bom.'],['LUÍSA','Pra lembrar que existe e vem de novo.'],
             ['VOVÓ','…então planta aqui. Lembrança boa dá flor.','#FFD84D']] },
         b:{ rotulo:'Um dia difícil', falas:[['VOVÓ','O que você quer guardar pra nunca esquecer?','#FFD84D'],
             ['LUÍSA','Um dia difícil.'],['LUÍSA','Pra lembrar que eu passei por ele.'],
             ['VOVÓ','…então planta aqui. Lembrança boa dá flor.','#FFD84D']] } },
       dica:'A vovó está perto do arbusto da direita, embaixo.',
       fala:'Guardei.'}
    ],
    npcs:[
      {id:'vovo',sprite:CH.vovo,x:6,y:6,nome:'VOVÓ',cor:'#FFD84D',falas:{
        inicio:['Você cresceu, menina.','Aqui não sumiu nada. Jardim guarda sozinho.'],
        meio:['Lembrar é regar. Todo dia um pouquinho.'],
        fim:['Leva a semente. Planta onde você for.']}},
      {id:'mel',sprite:CH.mel,x:14,y:13,nome:'MEL',cor:'#F0B45A',falas:{
        inicio:['Miau. Aqui é quentinho.','Eu durmo nesse canteiro desde sempre.'],
        meio:['Não pisa na minha flor.'],
        fim:['Miau. Volta sempre.']}}
    ],
    abertura:[['LUÍSA','O jardim da vovó.'],
      ['LUÍSA','Aqui não sumiu nome nenhum. Nem conta nenhuma.'],
      ['LUÍSA','Ela lembra de tudo. Eu vim aprender como.']],
    final:[['VOVÓ','Pronto. Guardado.','#FFD84D'],
      ['LUÍSA','E agora, vó?'],
      ['VOVÓ','Agora a torre. O relógio dela parou, e sem hora ninguém combina nada.','#FFD84D']]
  };

  const CAP10 = {
    id:'mapa-10', n:10, titulo:'Torre do Relógio', subtitulo:'Capítulo 10 · a hora de Aurora',
    emoji:'🕰️', cor:'#C77DFF',
    resumo:'O relógio da torre parou. Sem hora, ninguém combina de se encontrar.',
    objetivo:'Conserte as engrenagens e acerte a hora',
    mapa:[
      'WWWWWWWWWWWWWWWWWWWW',
      'WccccccccccccccccccW',
      'WcXccccccccccccccXcW',
      'WccccccccccccccccccW',
      'WWWWWccccccccccWWWWW',
      'WccccccccccccccccccW',
      'WcXccccccccccccccXcW',
      'WccccccccccccccccccW',
      'WWWWccccccccccccWWWW',
      'WccccccccccccccccccW',
      'WccccccccccccccccccW',
      'WcXccccccccccccccXcW',
      'WccccccccccccccccccW',
      'WWWWWWWWcccWWWWWWWWW',
      'WccccccccccccccccccW',
      'WWWWWWWWWWWWWWWWWWWW'
    ],
    inicio:{x:9,y:14},
    metas:[
      {id:'eng1', nome:'a 1ª engrenagem', icone:'⚙️', x:4,y:5, tile:T.brilho, acao:'numero',
       cfg:{nivel:2,n:3}, dica:'Suba pela passagem do meio e vá para a esquerda.',
       antes:'Cada engrenagem só encaixa se a conta bater.',
       fala:'Primeira engrenagem girando.'},
      {id:'eng2', nome:'a 2ª engrenagem', icone:'⚙️', x:15,y:9, tile:T.brilho, acao:'numero',
       cfg:{nivel:3,n:3}, dica:'No andar do meio, bem à direita.',
       antes:'Essa é maior. As contas também.',
       fala:'Segunda engrenagem girando.'},
      {id:'relogio', nome:'acertar a hora', icone:'🕰️', x:9,y:2, tile:T.cristal, acao:'numero',
       cfg:{nivel:3,n:4}, exigeTudo:true,
       dica:'Lá em cima, no cristal do relógio. Acerte a hora de Aurora.',
       antes:'Agora a hora. Se eu errar, eu conto de novo — ninguém me apaga por isso.',
       fala:'O relógio voltou a andar!'}
    ],
    npcs:[
      {id:'sombra',sprite:CH.sombra,x:12,y:14,nome:'SOMBRA',cor:'#D06B8C',falas:{
        inicio:['A torre é alta.','Eu subo com você. Não na sua frente, nem atrás. Do lado.'],
        meio:['Você errou uma conta e continuou. Isso é o mais difícil.'],
        fim:['Tá na hora. Literalmente.']}},
      {id:'tobias',sprite:CH.tobias,x:6,y:14,nome:'TOBIAS',cor:'#7BD97B',falas:{
        inicio:['Todo mundo tá esperando lá embaixo.','Sem hora ninguém sabe quando chega.'],
        meio:['Falta pouco, Luísa!'],
        fim:['Ouviu? O sino da torre!']}}
    ],
    abertura:[['LUÍSA','O relógio da torre parou.'],
      ['LUÍSA','Sem hora, ninguém combina de se encontrar.'],
      ['LUÍSA','E o que Aurora mais perdeu foi gente se encontrando.']],
    final:[['LUÍSA','Tique. Taque. Voltou.'],
      ['SOMBRA','Nome, conta e hora. Era isso que faltava no mapa.','#D06B8C'],
      ['LUÍSA','O mapa não faltava. Faltava alguém andar nele.'],
      ['LUÍSA','E fui eu.']]
  };

  const CAPS = [CAP1,CAP2,CAP3,CAP4,CAP5,CAP6,CAP7,CAP8,CAP9,CAP10];

  /* ================== ESTADO ================== */
  let cv,ctx,cap,cam={x:0,y:0},raf=null,rodando=false;
  let jog={x:0,y:0,dir:'down',andando:false};
  let caixote={x:0,y:0};
  let feitos=new Set(), entregue=false, falouCom=new Set();
  let dial=null, btn={up:0,down:0,left:0,right:0}, tempo=0, saturacao=0, empurraCd=0;
  let miniAberto=false, ventoT=0, rajada=false;

  const tileEm=(tx,ty)=>{ if(ty<0||ty>=cap.mapa.length) return '#';
    const l=cap.mapa[ty]; return (tx<0||tx>=l.length)?'#':l[tx]; };
  function portaDe(tx,ty){ const m=(cap.metas||[]).find(m=>m.x===tx&&m.y===ty); return m?m.id:'__'; }
  function solido(tx,ty){
    const c=tileEm(tx,ty);
    if(cap.caixote && caixote.x===tx && caixote.y===ty) return true;
    if(c==='O') return !feitos.has(portaDe(tx,ty));
    if(cap.abre && c===cap.abre.char && feitos.has(cap.abre.meta)) return false;
    return SOLIDOS.has(c);
  }
  const dTile=(i,x,y)=>ctx.drawImage(atlas,i*TS,CH_H,TS,TS,x,y,TS,TS);
  const dChar=(i,x,y)=>ctx.drawImage(atlas,i*CH_W,0,CH_W,CH_H,x,y,CH_W,CH_H);
  const chaoBase=()=> cap.escuro?T.chaoFlo : cap.vento?T.chaoMont :
    cap.id==='aurora-3'?T.areia : cap.id==='aurora-5'?T.pisoCas : T.grama;

  /* ================== DESENHO ================== */
  function desenhar(){
    ctx.imageSmoothingEnabled=false;
    const t0x=Math.floor(cam.x/TS), t0y=Math.floor(cam.y/TS);
    for(let ty=t0y;ty<=t0y+VH/TS+1;ty++)for(let tx=t0x;tx<=t0x+VW/TS+1;tx++){
      const c=tileEm(tx,ty); let idx=LEGENDA[c]; if(idx===undefined) idx=chaoBase();
      if(ANIMADOS[c]) idx=ANIMADOS[c][Math.floor(tempo/22)%2];
      if(c==='O' && feitos.has(portaDe(tx,ty))) idx=T.portaCasA;
      if(cap.abre && c===cap.abre.char && feitos.has(cap.abre.meta)) idx=cap.abre.tile;
      if(SOLIDOS.has(c)&&!ANIMADOS[c]&&c!=='W'&&c!=='O'&&c!=='X') dTile(chaoBase(),tx*TS-cam.x,ty*TS-cam.y);
      dTile(idx,tx*TS-cam.x,ty*TS-cam.y);
    }
    if(cap.caixote) dTile(T.caixote,caixote.x*TS-cam.x,caixote.y*TS-cam.y);

    (cap.metas||[]).forEach(m=>{
      const ok=feitos.has(m.id);
      const tile = ok ? (m.tileOn!==undefined?m.tileOn:null) : m.tile;
      if(tile===null||tile===undefined) return;
      const flut=ok?0:Math.sin(tempo/16+m.x)*1.2;
      dTile(tile,m.x*TS-cam.x,m.y*TS-cam.y+flut);
      if(!ok && Math.floor(tempo/20)%3===0) dTile(T.brilho,m.x*TS-cam.x,m.y*TS-cam.y-6);
    });

    const f=Math.floor(tempo/26)%2;
    (cap.npcs||[]).forEach(n=>{
      if(n.oculto && !prontoParaFinal()) return;
      dChar(n.sprite+f,n.x*TS-cam.x,n.y*TS-cam.y-8);
      if(D().baloes) balaoNpc(n);
    });

    const jf=jog.andando?Math.floor(tempo/9)%2:0;
    dChar(CH.luisa[jog.dir]+jf,Math.round(jog.x-cam.x),Math.round(jog.y-cam.y)-8);

    if(cap.escuro) escuridao();
    if(cap.vento&&rajada) ventoFx();
    if(D().seta) setaGuia();
    hud();
  }
  function escuridao(){
    // quantas metas "de acender" já foram feitas
    const acendiveis = cap.metas.filter(m=>!m.exigeTudo);
    const acesas = acendiveis.filter(m=>feitos.has(m.id)).length;
    if(acesas>=acendiveis.length) return;                 // tudo aceso: floresta clara
    const luz=44+acesas*52, jx=jog.x+8-cam.x, jy=jog.y+8-cam.y;
    const op=0.93-acesas*0.16;
    const g=ctx.createRadialGradient(jx,jy,luz*0.4,jx,jy,luz);
    g.addColorStop(0,'rgba(6,10,14,0)'); g.addColorStop(1,'rgba(6,10,14,'+op.toFixed(2)+')');
    ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
  }
  function ventoFx(){
    ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=1;
    for(let i=0;i<7;i++){
      const y=(tempo*3+i*29)%VH, x=((tempo*5+i*61)%(VW+40))-40;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+22,y+3); ctx.stroke();
    }
  }
  function alvoAtual(){
    if(entregue) return null;
    if(cap.caixote){
      const sino=cap.metas.find(m=>m.noAlto);
      const noLugar=caixote.x===cap.alvoCaixote.x&&caixote.y===cap.alvoCaixote.y;
      if(sino&&!feitos.has(sino.id)&&!noLugar) return {x:caixote.x,y:caixote.y};
    }
    const pend=(cap.metas||[]).filter(m=>!feitos.has(m.id)&&!(m.exigeTudo&&!prontoParaFinal()));
    if(pend.length){
      const jx=(jog.x+8)/TS, jy=(jog.y+8)/TS;
      pend.sort((a,b)=>Math.hypot(a.x-jx,a.y-jy)-Math.hypot(b.x-jx,b.y-jy));
      return {x:pend[0].x,y:pend[0].y};
    }
    return cap.entrega?{x:cap.entrega.x,y:cap.entrega.y}:null;
  }
  // BFS: próximo passo do caminho real até o alvo (evita apontar pra parede)
  let rotaCache={t:-999,alvo:'',passo:null};
  function proximoPasso(alvo){
    const jx=Math.floor((jog.x+8)/TS), jy=Math.floor((jog.y+8)/TS);
    const chave=alvo.x+','+alvo.y+'|'+jx+','+jy;
    if(tempo-rotaCache.t<12 && rotaCache.alvo===chave) return rotaCache.passo;
    const W=cap.mapa[0].length, H=cap.mapa.length;
    const de=new Map(), fila=[[jx,jy]]; de.set(jx+','+jy,null);
    let achou=null;
    for(let i=0;i<fila.length && !achou;i++){
      const [x,y]=fila[i];
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=x+dx, ny=y+dy, k=nx+','+ny;
        if(nx<0||ny<0||nx>=W||ny>=H||de.has(k)) continue;
        const alvoTile = (nx===alvo.x&&ny===alvo.y);
        const temNpc = (cap.npcs||[]).some(n=>(!n.oculto||prontoParaFinal()) && n.x===nx && n.y===ny);
        if((solido(nx,ny)||temNpc) && !alvoTile) continue;
        de.set(k,[x,y]); fila.push([nx,ny]);
        if(alvoTile){ achou=[nx,ny]; break; }
      }
    }
    let passo=null;
    if(achou){
      let cur=achou, ant=de.get(cur[0]+','+cur[1]);
      while(ant && !(ant[0]===jx&&ant[1]===jy)){ cur=ant; ant=de.get(cur[0]+','+cur[1]); }
      passo={x:cur[0],y:cur[1]};
    }
    rotaCache={t:tempo,alvo:chave,passo};
    return passo;
  }
  function setaGuia(){
    let a=alvoAtual(); if(!a) return;
    const passo=proximoPasso(a);
    const perto=Math.hypot(a.x-(jog.x+8)/TS, a.y-(jog.y+8)/TS)<2.2;
    if(passo && !perto) a=passo;                       // aponta o próximo passo do caminho
    const ax=a.x*TS+8-cam.x, ay=a.y*TS+8-cam.y, pulso=1+Math.sin(tempo/12)*.18;
    const dentro=ax>10&&ax<VW-10&&ay>18&&ay<VH-10;
    let px,py,ang;
    if(dentro){ px=ax; py=ay-14-Math.sin(tempo/12)*2; ang=Math.PI/2; }
    else{ const jx=jog.x+8-cam.x, jy=jog.y+8-cam.y; ang=Math.atan2(ay-jy,ax-jx);
      px=Math.max(12,Math.min(VW-12,jx+Math.cos(ang)*26));
      py=Math.max(22,Math.min(VH-12,jy+Math.sin(ang)*26)); }
    ctx.save(); ctx.translate(px,py); ctx.rotate(ang); ctx.scale(pulso,pulso);
    ctx.fillStyle='#FFD84D'; ctx.strokeStyle='#3B2340'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(6,0); ctx.lineTo(-4,-5); ctx.lineTo(-1,0); ctx.lineTo(-4,5);
    ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  function balaoNpc(n){
    if(falouCom.has(n.id)) return;
    const bx=n.x*TS+8-cam.x, by=n.y*TS-12-cam.y+Math.sin(tempo/14)*1.5;
    ctx.fillStyle='#fff'; ctx.strokeStyle='#3B2340'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.roundRect(bx-5,by-9,10,12,3); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#E5348A'; ctx.font='bold 9px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('!',bx,by-2); ctx.textAlign='left';
  }
  function hud(){
    ctx.fillStyle='rgba(20,14,32,.72)'; ctx.fillRect(0,0,VW,14);
    ctx.fillStyle='#FFECB4'; ctx.font='8px monospace'; ctx.textBaseline='middle';
    ctx.textAlign='left'; ctx.fillText(cap.titulo.toUpperCase(),4,7);
    ctx.textAlign='right'; ctx.fillText(feitos.size+'/'+cap.metas.length,VW-5,7); ctx.textAlign='left';
  }

  /* ================== DIÁLOGO ================== */
  const dlgEl=()=>document.getElementById('rpgDialogo');
  function falar(linhas,cb){ dial={linhas:linhas.slice(),i:0,cb}; mostrarLinha(); }
  function mostrarLinha(){
    const el=dlgEl();
    if(!dial||dial.i>=dial.linhas.length){ el.classList.remove('on'); const cb=dial&&dial.cb; dial=null; cb&&cb(); return; }
    const [nome,texto,cor]=dial.linhas[dial.i];
    const ehLuisa=nome==='LUÍSA';
    el.querySelector('.rpgNome').textContent=nome;
    el.querySelector('.rpgNome').style.color=ehLuisa?'#FFD84D':(cor||'#8FE3FF');
    el.querySelector('.rpgTexto').textContent=texto;
    el.querySelector('.rpgRetrato').style.display=ehLuisa?'block':'none';
    el.classList.add('on');
  }
  function avancarDialogo(){ if(dial){ dial.i++; mostrarLinha(); return true; } return false; }
  function aviso(t){ const e=document.getElementById('rpgAviso'); e.textContent=t; e.classList.add('on');
    setTimeout(()=>e.classList.remove('on'),2200); }

  /* ================== MINI-JOGOS ================== */
  const mini=()=>document.getElementById('rpgMini');
  function abrirMini(html){ miniAberto=true; const m=mini(); m.innerHTML=html; m.classList.add('on'); }
  function fecharMini(){ miniAberto=false; const m=mini(); if(m){ m.classList.remove('on'); m.innerHTML=''; } }

  const LUZES=[{c:'#FF5FA2',f:523},{c:'#FFD84D',f:659},{c:'#35D6D0',f:784},{c:'#A78BFA',f:988},{c:'#7BD97B',f:1175}];

  function jogoSequencia(meta,cb){
    const n=(meta.cfg&&meta.cfg.n||3)+D().extra, vel=D().vel;
    const seq=Array.from({length:n},()=>Math.floor(Math.random()*LUZES.length));
    let pos=0,bloq=true;
    abrirMini('<div class="miniBox"><div class="miniT">✨ Repita a ordem das luzes</div>'+
      '<div class="miniSub" id="mSub">Olhando…</div><div class="miniLuzes">'+
      LUZES.map((c,i)=>'<button class="lz" data-i="'+i+'" style="background:'+c.c+'"></button>').join('')+
      '</div><div class="miniAcoes"><button class="btn" id="mRep">🔁 Ver de novo</button>'+
      '<button class="btn" id="mSair">✖ Sair</button></div></div>');
    const els=[...mini().querySelectorAll('.lz')], sub=mini().querySelector('#mSub');
    const acende=i=>{ els[i].classList.add('on'); beep(LUZES[i].f,.22,'sine',.2);
      setTimeout(()=>els[i].classList.remove('on'),vel*0.55); };
    function tocar(){ bloq=true; pos=0; sub.textContent='Olhando…';
      seq.forEach((v,k)=>setTimeout(()=>acende(v),400+k*vel));
      setTimeout(()=>{bloq=false; sub.textContent='Agora é você!';},400+seq.length*vel); }
    els.forEach(el=>el.addEventListener('click',()=>{
      if(bloq) return; const i=+el.dataset.i; acende(i);
      if(seq[pos]===i){ pos++;
        if(pos===seq.length){ bloq=true; sub.textContent='Acertou! 🎉'; sOk(); confete(40);
          setTimeout(()=>{fecharMini(); cb(true);},700); }
      } else { bloq=true; sNo(); sub.textContent='Quase! Olha de novo…'; setTimeout(tocar,900); }
    }));
    mini().querySelector('#mRep').addEventListener('click',()=>{ if(!bloq) tocar(); });
    mini().querySelector('#mSair').addEventListener('click',()=>{ fecharMini(); cb(false); });
    setTimeout(tocar,300);
  }

  const NOTAS=[{c:'#FFD84D',f:523,n:'dó'},{c:'#7BD97B',f:587,n:'ré'},{c:'#35D6D0',f:659,n:'mi'},{c:'#FF8FC2',f:784,n:'sol'}];
  function jogoMusical(meta,cb){
    const n=(meta.cfg&&meta.cfg.n||4)+D().extra, vel=D().vel;
    const seq=Array.from({length:n},()=>Math.floor(Math.random()*NOTAS.length));
    let pos=0,bloq=true;
    abrirMini('<div class="miniBox"><div class="miniT">🎵 A Canção de Aurora</div>'+
      '<div class="miniSub" id="mSub">Ouvindo…</div><div class="miniLuzes">'+
      NOTAS.map((x,i)=>'<button class="lz sino" data-i="'+i+'" style="background:'+x.c+'"><span>'+x.n+'</span></button>').join('')+
      '</div><div class="miniAcoes"><button class="btn" id="mRep">🔁 Ouvir de novo</button>'+
      '<button class="btn" id="mSair">✖ Sair</button></div></div>');
    const bs=[...mini().querySelectorAll('.lz')], sub=mini().querySelector('#mSub');
    const toca=i=>{ bs[i].classList.add('on'); beep(NOTAS[i].f,.3,'triangle',.22);
      setTimeout(()=>bs[i].classList.remove('on'),vel*0.55); };
    function tocar(){ bloq=true; pos=0; sub.textContent='Ouvindo…';
      seq.forEach((v,k)=>setTimeout(()=>toca(v),400+k*vel));
      setTimeout(()=>{bloq=false; sub.textContent='Agora toque você!';},400+seq.length*vel); }
    bs.forEach(el=>el.addEventListener('click',()=>{
      if(bloq) return; const i=+el.dataset.i; toca(i);
      if(seq[pos]===i){ pos++;
        if(pos===seq.length){ bloq=true; sub.textContent='Perfeito! 🎶'; sWin(); confete(50);
          setTimeout(()=>{fecharMini(); cb(true);},800); }
      } else { bloq=true; sNo(); sub.textContent='Quase! Escuta de novo…'; setTimeout(tocar,900); }
    }));
    mini().querySelector('#mRep').addEventListener('click',()=>{ if(!bloq) tocar(); });
    mini().querySelector('#mSair').addEventListener('click',()=>{ fecharMini(); cb(false); });
    setTimeout(tocar,300);
  }

  function jogoDeslizante(meta,cb){
    const n=D().grid, tot=n*n, img=IMGS[Math.floor(Math.random()*IMGS.length)];
    let est=[...Array(tot).keys()], vazio=tot-1;
    const viz=i=>{const r=Math.floor(i/n),c=i%n,v=[];
      if(r>0)v.push(i-n); if(r<n-1)v.push(i+n); if(c>0)v.push(i-1); if(c<n-1)v.push(i+1); return v;};
    for(let k=0;k<n*n*22;k++){ const vs=viz(vazio), a=vs[Math.floor(Math.random()*vs.length)];
      [est[vazio],est[a]]=[est[a],est[vazio]]; vazio=a; }
    abrirMini('<div class="miniBox"><div class="miniT">🧩 Monte a figura</div>'+
      '<div class="miniSub" id="mSub">Toque numa peça do lado do buraco</div>'+
      '<div class="miniGrid" id="mGrid" style="--n:'+n+'"></div>'+
      '<div class="miniAcoes"><button class="btn" id="mSair">✖ Sair</button></div></div>');
    const grid=mini().querySelector('#mGrid'), sub=mini().querySelector('#mSub');
    function pinta(){
      grid.innerHTML='';
      est.forEach((peca,p)=>{
        const d=document.createElement('div'); d.className='pz';
        if(peca===tot-1) d.classList.add('vazio');
        else{
          d.style.backgroundImage="url('"+img+"')";
          d.style.backgroundSize=(n*100)+'% '+(n*100)+'%';
          d.style.backgroundPosition=((peca%n)/(n-1)*100)+'% '+(Math.floor(peca/n)/(n-1)*100)+'%';
        }
        d.addEventListener('click',()=>{
          const v=est.indexOf(tot-1);
          if(!viz(p).includes(v)){ sNo(); return; }
          [est[p],est[v]]=[est[v],est[p]]; beep(660,.07,'triangle'); pinta();
          if(est.every((x,i)=>x===i)){ sub.textContent='Montou! 🎉'; sWin(); confete(60);
            setTimeout(()=>{fecharMini(); cb(true);},800); }
        });
        grid.appendChild(d);
      });
    }
    pinta();
    mini().querySelector('#mSair').addEventListener('click',()=>{ fecharMini(); cb(false); });
  }

  /* Pergunta de duas respostas, ambas válidas. Sem cfg, cai no Reflexo do capítulo 3
     — era texto fixo aqui dentro, e por isso o `escolha` só servia naquele capítulo. */
  const ESCOLHA_REFLEXO = {
    titulo:'🪞 O Reflexo pergunta', pergunta:'"Você tem certeza que consegue?"',
    a:{ rotulo:'Não tenho', falas:[['REFLEXO','Você tem certeza que consegue?','#8FE3FF'],['LUÍSA','Não tenho.'],
        ['LUÍSA','Mas eu vou tentar do mesmo jeito.'],['REFLEXO','…então você já sabe o que precisa saber.','#8FE3FF']] },
    b:{ rotulo:'Tenho', falas:[['REFLEXO','Você tem certeza que consegue?','#8FE3FF'],['LUÍSA','Tenho.'],
        ['LUÍSA','E se eu não conseguir, eu tento outra vez.'],['REFLEXO','…então você já sabe o que precisa saber.','#8FE3FF']] }
  };
  function jogoEscolha(meta,cb){
    const c = (meta.cfg && meta.cfg.pergunta) ? meta.cfg : ESCOLHA_REFLEXO;
    abrirMini('<div class="miniBox"><div class="miniT">'+c.titulo+'</div>'+
      '<div class="miniSub">'+c.pergunta+'</div>'+
      '<div class="miniAcoes col"><button class="btn pri" data-r="0">'+c.a.rotulo+'</button>'+
      '<button class="btn pri" data-r="1">'+c.b.rotulo+'</button></div>'+
      '<p class="miniNota">As duas respostas estão certas.</p></div>');
    mini().querySelectorAll('[data-r]').forEach(b=>b.addEventListener('click',()=>{
      const r=+b.dataset.r; fecharMini(); sOk();
      falar((r===0?c.a:c.b).falas, ()=>cb(true));
    }));
  }

  /* Monta a Palavra dentro do capítulo. Reusa PAL_BANCO e PAL_EXTRAS dos jogos
     do menu — mesma lista, mesma regra de pista. Sair nunca pune: volta ao mapa. */
  function jogoPalavra(meta,cb){
    const nivel = (meta.cfg&&meta.cfg.nivel) || 2;
    const [palavra, emoji, ehFoto] = PAL_BANCO[nivel][Math.floor(Math.random()*PAL_BANCO[nivel].length)];
    /* No difícil do RPG entram 2 distratoras a mais que no jogo do menu. */
    const extras = PAL_EXTRAS_N[nivel] + (D().baloes ? 0 : 2);
    const letras = palavra.split('');
    const pool = PAL_EXTRAS.split('').filter(l=>!palavra.includes(l));
    for(let i=0;i<extras;i++) letras.push(pool[Math.floor(Math.random()*pool.length)]);

    const pista = ehFoto
      ? '<div class="palPista foto" style="width:84px;height:84px;margin-bottom:8px;background-image:url(\''+IMGS[Math.floor(Math.random()*IMGS.length)]+'\')"></div>'
      : '<div style="font-size:44px;line-height:1;margin-bottom:6px">'+emoji+'</div>';

    abrirMini('<div class="miniBox"><div class="miniT">🔤 '+(meta.nome||'Monte a palavra')+'</div>'+
      '<div class="miniSub" id="mSub">Toque nas letras na ordem certa</div>'+ pista +
      '<div class="palSlots" id="mSlots"></div><div class="palBanco" id="mBanco"></div>'+
      '<div class="miniAcoes"><button class="btn" id="mDica">💡 Dica</button>'+
      '<button class="btn" id="mSair">✖ Sair</button></div></div>');

    const slotsEl=mini().querySelector('#mSlots'), bancoEl=mini().querySelector('#mBanco'),
          sub=mini().querySelector('#mSub');
    let postas = Array(palavra.length).fill(null);

    function pinta(){
      slotsEl.className='palSlots'; slotsEl.innerHTML='';
      postas.forEach((it,i)=>{
        const d=document.createElement('div');
        d.className='palSlot'+(it?' cheio':'')+(it&&it.travado?' travado':'');
        d.textContent = it?it.letra:'';
        if(it&&!it.travado) d.addEventListener('click',()=>{ it.botao.classList.remove('usada');
          postas[i]=null; beep(420,.07); pinta(); });
        slotsEl.appendChild(d);
      });
    }
    shuffle(letras).forEach((l,i)=>{
      const b=document.createElement('button');
      b.className='palLetra'; b.textContent=l; b.style.setProperty('--i',i);
      b.addEventListener('click',()=>{
        if(b.classList.contains('usada')) return;
        const vaga=postas.indexOf(null); if(vaga<0) return;
        postas[vaga]={letra:l,botao:b}; b.classList.add('usada'); sFlip(); pinta();
        if(!postas.includes(null)) setTimeout(conferir,260);
      });
      bancoEl.appendChild(b);
    });
    pinta();

    function conferir(){
      if(postas.map(s=>s.letra).join('')===palavra){
        slotsEl.classList.add('ok'); sub.textContent='Isso! 🎉'; sOk(); confete(40);
        setTimeout(()=>{fecharMini(); cb(true);},800);
      } else {
        slotsEl.classList.add('erro'); sNo(); sub.textContent='Quase! Olha a figura de novo…';
        setTimeout(()=>{
          postas.forEach((it,i)=>{ if(it&&!it.travado){ it.botao.classList.remove('usada'); postas[i]=null; } });
          pinta(); sub.textContent='Toque nas letras na ordem certa';
        },520);
      }
    }
    /* A dica trava a próxima letra certa. Sem limite: ela nunca fica presa aqui. */
    mini().querySelector('#mDica').addEventListener('click',()=>{
      const i=postas.findIndex((s,k)=>!s||s.letra!==palavra[k]);
      if(i<0) return;
      if(postas[i]){ postas[i].botao.classList.remove('usada'); postas[i]=null; }
      const botao=[...bancoEl.querySelectorAll('.palLetra')]
        .find(b=>b.textContent===palavra[i] && !b.classList.contains('usada'));
      if(!botao) return;
      botao.classList.add('usada'); postas[i]={letra:palavra[i],botao,travado:true};
      beep(880,.09); pinta();
      if(!postas.includes(null)) setTimeout(conferir,260);
    });
    mini().querySelector('#mSair').addEventListener('click',()=>{ fecharMini(); cb(false); });
  }

  /* Conta com a Luísa dentro do capítulo: n contas certas seguidas concluem a meta.
     Errar não tira a opção certa nem zera o progresso. */
  function jogoNumero(meta,cb){
    const nivel=(meta.cfg&&meta.cfg.nivel)||1;
    const alvo=(meta.cfg&&meta.cfg.n||3)+D().extra;
    let feitas=0, resp=0, erros=0;

    abrirMini('<div class="miniBox"><div class="miniT">🔢 '+(meta.nome||'Faça a conta')+'</div>'+
      '<div class="miniSub" id="mSub">Acerte '+alvo+' contas</div>'+
      '<div class="numPergunta" id="mPerg"></div><div class="numApoio" id="mApoio"></div>'+
      '<div class="numOpcoes" id="mOpc"></div>'+
      '<div class="miniAcoes"><button class="btn" id="mSair">✖ Sair</button></div></div>');

    const perg=mini().querySelector('#mPerg'), apoio=mini().querySelector('#mApoio'),
          opc=mini().querySelector('#mOpc'), sub=mini().querySelector('#mSub');

    function nova(){
      erros=0; apoio.className='numApoio';
      const c = montaConta(nivel);          /* mesmo gerador do jogo do menu */
      resp = c.resp;
      perg.textContent = c.perg;
      apoio.innerHTML = c.apoio;
      opc.innerHTML='';
      opcoesPara(resp).forEach((v,i)=>{
        const b=document.createElement('button');
        b.className='numOpc'; b.textContent=v; b.style.setProperty('--i',i);
        b.addEventListener('click',()=>responder(b,v));
        opc.appendChild(b);
      });
      sub.textContent='Acertou '+feitas+' de '+alvo;
    }
    function responder(botao,valor){
      if(valor===resp){
        botao.classList.add('certa');
        opc.querySelectorAll('.numOpc').forEach(b=>b.style.pointerEvents='none');
        feitas++; sOk(); confete(30);
        if(feitas>=alvo){ sub.textContent='Todas certas! 🎉'; sWin();
          setTimeout(()=>{fecharMini(); cb(true);},800); }
        else setTimeout(nova,700);
      } else {
        botao.classList.add('errada'); sNo(); erros++;
        if(erros>=2){ apoio.classList.remove('pisca'); void apoio.offsetWidth; apoio.classList.add('pisca'); }
      }
    }
    nova();
    mini().querySelector('#mSair').addEventListener('click',()=>{ fecharMini(); cb(false); });
  }

  const CORES4=[{c:'#FFD84D',n:'Alegria',f:523},{c:'#7BD97B',n:'Vida',f:659},
                {c:'#35D6D0',n:'Calma',f:784},{c:'#FF5F5F',n:'Coragem',f:988}];
  function jogoFinal(meta,cb){
    let pos=0;
    const emb=[0,1,2,3].sort(()=>Math.random()-.5);
    abrirMini('<div class="miniBox"><div class="miniT">🌈 Acenda as quatro cores</div>'+
      '<div class="miniSub" id="mSub">'+(D().ordemCores
        ? 'Na ordem: Alegria → Vida → Calma → Coragem'
        : 'Na ordem em que você as conquistou')+'</div>'+
      '<div class="miniLuzes wrap">'+emb.map(i=>
        '<button class="lz cor4" data-i="'+i+'" style="background:'+CORES4[i].c+'"><span>'+CORES4[i].n+'</span></button>').join('')+
      '</div><div class="miniAcoes"><button class="btn" id="mSair">✖ Sair</button></div></div>');
    const sub=mini().querySelector('#mSub');
    mini().querySelectorAll('.cor4').forEach(b=>b.addEventListener('click',()=>{
      const i=+b.dataset.i;
      if(pos===i){ b.classList.add('ok'); beep(CORES4[i].f,.3,'sine',.22); pos++;
        if(pos===4){ sub.textContent='As quatro juntas viram luz! ✨'; sWin(); confete(180);
          setTimeout(()=>{fecharMini(); cb(true);},900); }
      } else { sNo(); sub.textContent='Essa não é a próxima. Comece de novo.';
        pos=0; mini().querySelectorAll('.cor4').forEach(x=>x.classList.remove('ok')); }
    }));
    mini().querySelector('#mSair').addEventListener('click',()=>{ fecharMini(); cb(false); });
  }

  /* ================== AÇÃO ================== */
  function alvoFrente(){
    const tx=Math.floor((jog.x+8)/TS)+(jog.dir==='left'?-1:jog.dir==='right'?1:0);
    const ty=Math.floor((jog.y+8)/TS)+(jog.dir==='up'?-1:jog.dir==='down'?1:0);
    return {tx,ty};
  }
  const prontoParaFinal=()=>(cap.metas||[]).filter(m=>!m.exigeTudo).every(m=>feitos.has(m.id));
  const todasFeitas=()=>(cap.metas||[]).every(m=>feitos.has(m.id));

  function agir(){
    if(miniAberto) return;
    if(avancarDialogo()) return;
    const {tx,ty}=alvoFrente();
    const px=Math.floor((jog.x+8)/TS), py=Math.floor((jog.y+8)/TS);
    const m=(cap.metas||[]).find(m=>!feitos.has(m.id)&&
      ((m.x===tx&&m.y===ty)||(m.x===px&&m.y===py)));
    if(m){
      if(m.exigeTudo && !prontoParaFinal()){ falar([['LUÍSA','Ainda não. Falta terminar as outras provas.']]); return; }
      return executarMeta(m);
    }
    if(cap.caixote){
      const alto=cap.metas.find(x=>x.noAlto&&!feitos.has(x.id));
      if(alto && caixote.x===cap.alvoCaixote.x && caixote.y===cap.alvoCaixote.y &&
         Math.abs(tx-caixote.x)<=1 && Math.abs(ty-caixote.y)<=1){
        falar([['LUÍSA','Subi no caixote…'],['LUÍSA',alto.fala]],()=>concluirMeta(alto)); return; }
    }
    const n=(cap.npcs||[]).find(n=>n.x===tx&&n.y===ty&&(!n.oculto||prontoParaFinal()));
    if(n){ const fase=entregue?'fim':(feitos.size>0?'meio':'inicio'); falouCom.add(n.id);
      falar(n.falas[fase].map(t=>[n.nome,t,n.cor])); beep(560,.07); return; }
    if(cap.entrega && todasFeitas() && !entregue &&
       Math.abs(tx-cap.entrega.x)<=1 && Math.abs(ty-cap.entrega.y)<=1){ concluir(); return; }
    if(todasFeitas() && !entregue && cap.entrega)
      falar([['LUÍSA',cap.entregaTxt||'Preciso ir até onde a seta mostra.']]);
  }

  function executarMeta(m){
    const seguir=ok=>{ if(ok) concluirMeta(m); };
    const roda=()=>{
      if(m.acao==='pegar'){
        if(m.noAlto){
          const ok=caixote.x===cap.alvoCaixote.x&&caixote.y===cap.alvoCaixote.y;
          if(!ok){ falar([['LUÍSA',m.dica],['LUÍSA','Se eu não alcanço, eu mudo de lugar. Cadê aquele caixote?']]); return; }
          falar([['LUÍSA','Subi no caixote…'],['LUÍSA',m.fala]],()=>concluirMeta(m)); return;
        }
        falar([['LUÍSA',m.fala]],()=>concluirMeta(m)); return;
      }
      if(m.acao==='falar'){ concluirMeta(m); return; }
      if(m.acao==='sequencia')  return jogoSequencia(m,seguir);
      if(m.acao==='musical')    return jogoMusical(m,seguir);
      if(m.acao==='deslizante') return jogoDeslizante(m,seguir);
      if(m.acao==='escolha')    return jogoEscolha(m,seguir);
      if(m.acao==='palavra')    return jogoPalavra(m,seguir);
      if(m.acao==='numero')     return jogoNumero(m,seguir);
      if(m.acao==='final')      return jogoFinal(m,seguir);
    };
    if(m.antes && m.acao!=='pegar') falar([['LUÍSA',m.antes]],roda); else roda();
  }

  function concluirMeta(m){
    feitos.add(m.id); sOk(); confete(30); salvar(); objetivoUI();
    saturacao=Math.min(1,.22+feitos.size*(0.78/cap.metas.length)); aplicarCor();
    if(m.fala && m.acao!=='pegar' && m.acao!=='escolha' && m.acao!=='final' && m.acao!=='falar')
      setTimeout(()=>{ if(!dial) falar([['LUÍSA',m.fala]]); },350);
    // liberou o alvo que exigia tudo? avisa e aponta
    const fin=(cap.metas||[]).find(x=>x.exigeTudo);
    if(fin && !feitos.has(fin.id) && prontoParaFinal()){
      setTimeout(()=>{ if(!dial){ aviso('Tudo aceso! '+fin.nome);
        falar([['LUÍSA','A floresta inteira acendeu!'],['LUÍSA',fin.dica||('Agora: '+fin.nome)]]); } },600);
    }
    if(todasFeitas()) setTimeout(()=>{ if(!dial){
      if(cap.entrega) falar([['LUÍSA',cap.entregaTxt||'Agora é só chegar no lugar certo.']]);
      else concluir(); } },700);
  }
  function concluir(){
    entregue=true; salvar(); objetivoUI();
    falar(cap.final.map(l=>[l[0],l[1],l[2]]),()=>{
      saturacao=1; aplicarCor(); sWin(); confete(170); marcarCapConcluido(cap.id);
      const prox=CAPS[cap.n];
      setTimeout(()=>{
        vencer('🌈','Capítulo '+cap.n+' completo!',
          prox ? cap.titulo+' voltou a ter cor. Vamos pro capítulo '+(cap.n+1)+'?'
               : 'Você trouxe a cor de volta pro Reino inteiro! 👑',
          ()=>{ if(prox) iniciar(prox,true); else voltarMenu(); });
        const bn=document.getElementById('winNovo'), bh=document.getElementById('winHome');
        if(bn) bn.textContent = prox ? '▶ '+prox.emoji+' '+prox.titulo : '🔄 Jogar de novo';
        if(bh) bh.textContent = '📜 Capítulos';
      },700);
    });
  }
  function aplicarCor(){
    cv.style.filter='saturate('+(0.22+0.78*saturacao).toFixed(2)+') brightness('+(0.90+0.10*saturacao).toFixed(2)+')';
  }

  /* ================== DICAS ================== */
  function dicaAtual(){
    if(entregue) return [['DICA','Capítulo completo!']];
    if(cap.caixote){
      const sino=cap.metas.find(m=>m.noAlto);
      const noLugar=caixote.x===cap.alvoCaixote.x&&caixote.y===cap.alvoCaixote.y;
      if(sino&&!feitos.has(sino.id)&&!noLugar)
        return [['DICA','O sino está no telhado e eu não alcanço.'],
                ['DICA','Encoste no caixote e continue andando: ele se mexe um quadradinho.'],
                ['DICA','Empurre até ele ficar do lado da casa do sino.'],
                ['DICA','Entalou? Aperte 🪄 Arrumar caixote.']];
      if(sino&&!feitos.has(sino.id)&&noLugar)
        return [['DICA','O caixote já está no lugar!'],['DICA','Fique do lado dele, olhe pro sino e aperte A.']];
    }
    if(todasFeitas()) return [['DICA',cap.entregaTxt||'Vá até onde a seta aponta e aperte A.']];
    const pend=cap.metas.filter(m=>!feitos.has(m.id)&&!(m.exigeTudo&&!prontoParaFinal()));
    return [['DICA',pend[0].dica||('Procure: '+pend[0].nome)],['DICA','Chegue pertinho e aperte A.']];
  }
  function pedirDica(){
    if(dial||miniAberto) return;
    if(D().dicas===0){ aviso('No Difícil não tem dica. Você consegue!'); sNo(); return; }
    if(dicasRestantes<=0){ aviso('Acabaram as dicas deste capítulo.'); sNo(); return; }
    dicasRestantes--; atualizarBotaoDica(); beep(880,.1); falar(dicaAtual());
  }
  function atualizarBotaoDica(){
    const b=document.getElementById('rpgDica'); if(!b) return;
    if(D().dicas===0){ b.style.display='none'; return; }
    b.style.display='';
    b.textContent = D().dicas>=99 ? '💡 Dica' : '💡 Dica ('+dicasRestantes+')';
    b.style.opacity = dicasRestantes>0?1:.45;
  }

  /* ================== CAIXOTE ================== */
  function arrumarCaixote(){
    if(!cap.caixote){ aviso('Este capítulo não tem caixote.'); return; }
    if(dial||miniAberto) return;
    caixote.x=cap.caixote.x; caixote.y=cap.caixote.y; salvar(); sOk(); aviso('O caixote voltou pro começo!');
  }
  const solidoSemCaixote=(tx,ty)=>SOLIDOS.has(tileEm(tx,ty));
  function caixotePreso(){
    if(!cap.caixote) return false;
    if(caixote.x===cap.alvoCaixote.x&&caixote.y===cap.alvoCaixote.y) return false;
    return ![[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>
      !solidoSemCaixote(caixote.x-dx,caixote.y-dy)&&!solidoSemCaixote(caixote.x+dx,caixote.y+dy));
  }
  function empurrar(dx,dy){
    if(!cap.caixote||empurraCd>0) return;
    const {tx,ty}=alvoFrente();
    if(caixote.x!==tx||caixote.y!==ty) return;
    if(caixote.x===cap.alvoCaixote.x&&caixote.y===cap.alvoCaixote.y) return;
    const ax=caixote.x+dx, ay=caixote.y+dy;
    if(solidoSemCaixote(ax,ay)) return;
    if((cap.npcs||[]).some(n=>n.x===ax&&n.y===ay)) return;
    caixote.x=ax; caixote.y=ay; empurraCd=18; beep(220,.09,'square',.08);
    if(caixote.x===cap.alvoCaixote.x&&caixote.y===cap.alvoCaixote.y){
      sOk(); aviso('O caixote está no lugar certo!');
      setTimeout(()=>{ if(!dial) falar([['LUÍSA','Agora eu subo aqui e alcanço o sino!'],
        ['LUÍSA','É só ficar do lado, olhar pro sino e apertar A.']]); },500);
    } else if(caixotePreso()){
      setTimeout(()=>{ if(!dial) falar([['LUÍSA','Ops, o caixote ficou entalado.'],
        ['LUÍSA','É só apertar 🪄 Arrumar caixote que ele volta pro começo.']]); },400);
    }
    salvar();
  }

  /* ================== MOVIMENTO ================== */
  function livreEm(nx,ny){
    const cx0=Math.floor((nx+4)/TS), cx1=Math.floor((nx+11)/TS);
    const cy0=Math.floor((ny+8)/TS), cy1=Math.floor((ny+15)/TS);
    for(let ty=cy0;ty<=cy1;ty++) for(let tx=cx0;tx<=cx1;tx++) if(solido(tx,ty)) return false;
    for(const n of (cap.npcs||[])){ if(n.oculto&&!prontoParaFinal()) continue;
      if(n.x>=cx0&&n.x<=cx1&&n.y>=cy0&&n.y<=cy1) return false; }
    return true;
  }
  function passo(){
    if(dial||miniAberto){ jog.andando=false; return; }
    let dx=0,dy=0;
    if(btn.left)dx=-1; else if(btn.right)dx=1; else if(btn.up)dy=-1; else if(btn.down)dy=1;
    jog.andando=!!(dx||dy);
    let vy=0;
    if(cap.vento){ ventoT++; rajada=(ventoT%300)<80; if(rajada) vy=0.42; }
    if(!jog.andando && !vy) return;
    if(dx||dy) jog.dir = dx<0?'left':dx>0?'right':dy<0?'up':'down';
    const v=1.1, nx=jog.x+dx*v, ny=jog.y+dy*v+vy;
    if(livreEm(nx,ny)){ jog.x=nx; jog.y=ny; }
    else {
      // auto-alinhamento: destrava a entrada de corredores quando ela está
      // só um pouquinho torta em relação ao tile (corner correction)
      let ok=false, AJ=1.6;
      if(dy!==0){
        const alvo=Math.round(jog.x/TS)*TS, dist=alvo-jog.x;
        if(Math.abs(dist)>0.01){
          const px=jog.x+Math.sign(dist)*Math.min(AJ,Math.abs(dist));
          if(livreEm(px,ny)){ jog.x=px; jog.y=ny; ok=true; }
          else if(livreEm(px,jog.y)){ jog.x=px; ok=true; }
        }
      }
      if(!ok && dx!==0){
        const alvo=Math.round(jog.y/TS)*TS, dist=alvo-jog.y;
        if(Math.abs(dist)>0.01){
          const py=jog.y+Math.sign(dist)*Math.min(AJ,Math.abs(dist));
          if(livreEm(nx,py)){ jog.x=nx; jog.y=py; ok=true; }
          else if(livreEm(jog.x,py)){ jog.y=py; ok=true; }
        }
      }
      if(!ok && (dx||dy)) empurrar(dx,dy);
    }
    cam.x=Math.max(0,Math.min(cap.mapa[0].length*TS-VW,jog.x+8-VW/2));
    cam.y=Math.max(0,Math.min(cap.mapa.length*TS-VH,jog.y+8-VH/2));
    // chegar no ponto final conclui sozinho (sem depender de apertar A)
    if(cap.entrega && todasFeitas() && !entregue && !dial){
      const jx=(jog.x+8)/TS, jy=(jog.y+8)/TS;
      if(Math.hypot(jx-cap.entrega.x, jy-cap.entrega.y) < 1.6) concluir();
    }
  }
  function loop(){ if(!rodando) return; tempo++; if(empurraCd>0)empurraCd--; passo(); desenhar();
    raf=requestAnimationFrame(loop); }

  /* ================== SAVE ================== */
  const KEY='luisa_rpg_v2';
  const lerSave=()=>{ try{ return JSON.parse(localStorage.getItem(KEY)||'{}'); }catch(e){ return {}; } };
  const gravar=o=>{ try{ localStorage.setItem(KEY,JSON.stringify(o)); }catch(e){} };
  function salvar(){ const s=lerSave(); s.dif=dif;
    s[cap.id]={x:jog.x,y:jog.y,cx:caixote.x,cy:caixote.y,f:[...feitos],fim:entregue,dicas:dicasRestantes};
    gravar(s); }
  function carregar(){
    const s=lerSave()[cap.id]; if(!s) return false;
    jog.x=s.x; jog.y=s.y; if(cap.caixote){caixote.x=s.cx;caixote.y=s.cy;}
    feitos=new Set(s.f||[]); entregue=!!s.fim;
    dicasRestantes=(typeof s.dicas==='number')?s.dicas:D().dicas;
    return true;
  }
  function limparCap(){ const s=lerSave(); delete s[cap.id]; gravar(s); }
  function marcarCapConcluido(id){ const s=lerSave(); s.done=[...new Set([...(s.done||[]),id])]; gravar(s); }
  const capConcluido=id=>(lerSave().done||[]).includes(id);
  const desbloqueado=i=> i===0 || capConcluido(CAPS[i-1].id);

  /* ================== UI ================== */
  function objetivoUI(){
    const el=document.getElementById('rpgObj'), t=document.getElementById('rpgObjT');
    if(!el||!t) return;
    if(!D().obj){
      el.innerHTML='<span class="objIt">'+feitos.size+' de '+cap.metas.length+'</span>';
      t.textContent = entregue?'Capítulo completo! 🌈':cap.objetivo; return;
    }
    el.innerHTML=cap.metas.map(m=>{
      const ok=feitos.has(m.id);
      return '<span class="objIt '+(ok?'ok':'')+'">'+(ok?'✅':m.icone)+' '+m.nome+'</span>';
    }).join('');
    t.textContent = entregue ? 'Capítulo completo! 🌈'
      : (todasFeitas() ? (cap.entregaTxt||'Vá até o ponto final') : cap.objetivo);
  }
  function montarMenu(){
    const box=document.getElementById('rpgMenu'); box.innerHTML='';
    CAPS.forEach((c,i)=>{
      /* Duas aventuras na mesma lista: o capítulo 5 fecha As Quatro Cores.
         Não existe estrutura AVENTURAS no motor — isto é só a marca visual. */
      if(c.n===1 || c.n===6){
        const s=document.createElement('div');
        s.className='avSep'; s.style.setProperty('--i',i);
        s.innerHTML='<b>'+(c.n===1?'🌈 As Quatro Cores':'🗺️ O Mapa que Faltava')+'</b>'+
          '<span>'+(c.n===1?'Capítulos 1 a 5':'Capítulos 6 a 10')+'</span>';
        box.appendChild(s);
      }
      const livre=desbloqueado(i), feito=capConcluido(c.id);
      const b=document.createElement(livre?'button':'div');
      b.className='avCard'+(livre?'':' breve'); b.style.setProperty('--i',i);
      b.innerHTML='<span class="avEm">'+c.emoji+'</span><b>'+c.titulo+'</b><span>'+c.subtitulo+'</span>'+
        '<i>'+(livre?c.resumo:'🔒 Termine o capítulo anterior')+'</i>'+(feito?'<em class="avOk">✅ completo</em>':'');
      if(livre) b.addEventListener('click',()=>{ beep(740,.09); iniciar(c); });
      box.appendChild(b);
    });
    const dc=document.getElementById('rpgDifChips');
    if(dc){
      if(!dc.dataset.pronto){
        dc.dataset.pronto='1';
        dc.querySelectorAll('.chip').forEach(ch=>ch.addEventListener('click',()=>{
          dc.querySelectorAll('.chip').forEach(x=>x.classList.remove('on'));
          ch.classList.add('on'); dif=ch.dataset.d;
          const s=lerSave(); s.dif=dif; gravar(s); beep(700,.08);
        }));
      }
      dc.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x.dataset.d===dif));
    }
  }

  /* ================== CONTROLES ================== */
  function ligarControles(){
    const mp={up:'rpgUp',down:'rpgDown',left:'rpgLeft',right:'rpgRight'};
    Object.entries(mp).forEach(([k,id])=>{
      const el=document.getElementById(id);
      const on=e=>{e.preventDefault();btn[k]=1;el.classList.add('press')};
      const off=e=>{e.preventDefault();btn[k]=0;el.classList.remove('press')};
      el.addEventListener('pointerdown',on); el.addEventListener('pointerup',off);
      el.addEventListener('pointerleave',off); el.addEventListener('pointercancel',off);
    });
    const a=document.getElementById('rpgA');
    a.addEventListener('pointerdown',e=>{e.preventDefault();a.classList.add('press');agir()});
    a.addEventListener('pointerup',e=>{e.preventDefault();a.classList.remove('press')});
    document.getElementById('rpgDialogo').addEventListener('click',()=>avancarDialogo());
    addEventListener('keydown',e=>{ if(atual!=='vRpg')return; const k=e.key;
      if(k==='ArrowUp')btn.up=1; if(k==='ArrowDown')btn.down=1;
      if(k==='ArrowLeft')btn.left=1; if(k==='ArrowRight')btn.right=1;
      if(k===' '||k==='Enter'||k==='z'||k==='Z'){e.preventDefault();agir();} });
    addEventListener('keyup',e=>{ const k=e.key;
      if(k==='ArrowUp')btn.up=0; if(k==='ArrowDown')btn.down=0;
      if(k==='ArrowLeft')btn.left=0; if(k==='ArrowRight')btn.right=0; });
  }

  /* ================== CICLO ================== */
  function iniciar(c,forcarNovo){
    rodando=false; if(raf){cancelAnimationFrame(raf);raf=null;}
    dial=null; fecharMini();
    const de=document.getElementById('rpgDialogo'); if(de)de.classList.remove('on');
    const we=document.getElementById('win'); if(we)we.classList.remove('on');
    btn={up:0,down:0,left:0,right:0};
    document.querySelectorAll('.dpad button.press').forEach(b=>b.classList.remove('press'));
    cap=c;
    document.getElementById('rpgMenuWrap').style.display='none';
    document.getElementById('rpgJogo').style.display='block';
    const ba=document.getElementById('rpgArrumar'); if(ba) ba.style.display=cap.caixote?'':'none';
    cv=document.getElementById('rpgCanvas'); ctx=cv.getContext('2d'); cv.width=VW; cv.height=VH;
    feitos=new Set(); entregue=false; falouCom=new Set(); empurraCd=0; tempo=0; ventoT=0; rajada=false;
    dicasRestantes=D().dicas;
    if(cap.caixote){ caixote.x=cap.caixote.x; caixote.y=cap.caixote.y; }
    jog.x=cap.inicio.x*TS; jog.y=cap.inicio.y*TS; jog.dir='down';
    const tinha=!forcarNovo && carregar();
    saturacao=entregue?1:(feitos.size?.22+feitos.size*(0.78/cap.metas.length):0);
    aplicarCor(); objetivoUI(); atualizarBotaoDica();
    cam.x=Math.max(0,Math.min(cap.mapa[0].length*TS-VW,jog.x+8-VW/2));
    cam.y=Math.max(0,Math.min(cap.mapa.length*TS-VH,jog.y+8-VH/2));
    rodando=true; loop();
    if(!tinha){
      const tut = dif==='facil' ? [['COMO JOGAR','Use as setas ▲▼◀▶ para andar.'],
        ['COMO JOGAR','Chegue pertinho e aperte A para falar e agir.'],
        ['COMO JOGAR','A seta amarela mostra pra onde ir. Travou? Aperte 💡 Dica.']] : [];
      setTimeout(()=>falar([...cap.abertura,...tut]),350);
    }
  }
  function reiniciarCap(){ limparCap(); iniciar(cap,true); }
  function abrir(){
    const s=lerSave(); if(s.dif&&DIF[s.dif]) dif=s.dif;
    document.getElementById('rpgMenuWrap').style.display='block';
    document.getElementById('rpgJogo').style.display='none';
    montarMenu(); if(!pronto) carregarAtlas();
  }
  function fechar(){ rodando=false; if(raf)cancelAnimationFrame(raf); fecharMini(); }
  function voltarMenu(){ fechar(); abrir(); }
  function boot(){ carregarAtlas(); ligarControles(); const s=lerSave(); if(s.dif&&DIF[s.dif]) dif=s.dif; }

  return { boot, abrir, fechar, voltarMenu, reiniciar:reiniciarCap, dica:pedirDica, arrumar:arrumarCaixote,
    _dbg:()=>({x:jog.x/TS,y:jog.y/TS,dir:jog.dir,cap:cap&&cap.id,dif,cx:caixote.x,cy:caixote.y,
      feitos:[...feitos],fim:entregue,dial:!!dial,mini:miniAberto,sat:saturacao,
      inicio:cap&&cap.inicio,entrega:cap&&cap.entrega}),
    _tp:(x,y,d)=>{ jog.x=x*TS; jog.y=y*TS; if(d)jog.dir=d;
      cam.x=Math.max(0,Math.min(cap.mapa[0].length*TS-VW,jog.x+8-VW/2));
      cam.y=Math.max(0,Math.min(cap.mapa.length*TS-VH,jog.y+8-VH/2)); },
    _a:()=>agir(), _cap:i=>iniciar(CAPS[i],true), _dif:d=>{dif=d;},
    _rota:()=>{ const a=alvoAtual(); return a?{alvo:a,passo:proximoPasso(a)}:null; },
    _mapa:()=>cap.mapa, _metas:()=>cap.metas.map(m=>({id:m.id,x:m.x,y:m.y,acao:m.acao})),
    _feito:id=>{ const m=cap.metas.find(x=>x.id===id); if(m) concluirMeta(m); } };
})();
