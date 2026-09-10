-- =====================================================================
-- PORTAL SYNTHETICA — corpo real das materias da edicao 1
-- ---------------------------------------------------------------------
-- A carga original (synthetica-completo.sql) preencheu MATERIA.corpo com
-- textos-stub ("Corpo completo da materia sobre chips..."). A revista
-- (front) agora le esse CLOB de verdade na tela de Leitura, entao aqui
-- trocamos os stubs por texto de verdade.
--
-- Rode este script UMA vez no SQL Developer, conectado como o mesmo
-- usuario da carga. Cada bloco fica abaixo de 4000 bytes (limite do
-- literal antes da conversao para CLOB). Paragrafos separados por linha
-- em branco — a revista quebra o texto por \n.
--
-- O WHERE usa o TITULO (nao o id) porque a coluna id_materia e IDENTITY
-- e pode ter numeracao diferente se a carga foi reexecutada.
-- =====================================================================

UPDATE materia SET corpo = q'[
A promessa de simular o clima da Terra num laptop deixou de ser retorica. Um consorcio de universidades apresentou nesta semana uma familia de modelos generativos que reproduz cenarios de circulacao atmosferica com uma fracao do custo computacional exigido pelos metodos tradicionais de diferencas finitas.

O ganho vem de uma troca: em vez de resolver as equacoes fisicas ponto a ponto numa malha, a rede neural aprende o comportamento do sistema a partir de decadas de reanalise e passa a "adivinhar" o proximo estado com margem de erro conhecida. Nos testes divulgados, a aceleracao chegou a 40% para previsoes sazonais, sem perda relevante de acuracia nas variaveis de superficie.

Ha ressalvas. O modelo herda os vieses do periodo em que foi treinado e ainda tropeca em eventos extremos raros, justamente os que mais interessam a quem faz politica publica. Os autores defendem um uso hibrido: a IA varre o espaco de cenarios depressa e barato, e o modelo fisico confere os poucos casos que importam.

Para paises sem supercomputadores, a mudanca e material. Rodar um conjunto de projecoes regionais que antes exigia semanas de fila agora cabe num orcamento de laboratorio. A pergunta que fica e de governanca: quem audita um prognostico climatico quando ele sai de uma caixa-preta estatistica?
]' WHERE titulo = 'IA generativa reduz custo de simulação climática';


UPDATE materia SET corpo = q'[
A nova ala do museu nao tem curador humano creditado na parede. As 60 obras em cartaz foram escolhidas, agrupadas e comentadas por um sistema treinado no acervo da instituicao e em milhares de textos de historia da arte. O visitante le, ao lado de cada quadro, uma justificativa escrita pela maquina sobre por que aquela peca esta ali.

A instituicao afirma que a intencao nao e substituir a curadoria, e sim expo-la. Cada sala traz um painel com os criterios que o sistema diz ter usado — proximidade cronologica, afinidade de paleta, recorrencia de tema — e um registro das obras que ele descartou. E uma tentativa de tornar visivel um processo que, feito por gente, quase nunca e explicado ao publico.

Criticos se dividem. Para uns, a mostra e um exercicio honesto de transparencia algoritmica. Para outros, e teatro: o modelo apenas formaliza gostos que ja estavam no acervo, e o painel de criterios e uma narrativa construida depois da escolha, nao antes.

O museu promete publicar os dados da curadoria — pesos, prompts e listas de exclusao — para pesquisa. Se cumprir, sera um dos poucos casos em que uma decisao estetica automatizada fica aberta a auditoria de fora.
]' WHERE titulo = 'Museu de São Paulo abre ala dedicada a curadoria por IA';


UPDATE materia SET corpo = q'[
Os primeiros processadores neuromorficos voltados ao consumidor final chegaram as lojas. Diferente de uma CPU comum, o chip nao separa memoria e calculo: ele imita a forma como neuronios e sinapses trocam sinais, e so gasta energia quando ha evento para processar.

Na pratica, isso rende autonomia. Um assistente de voz local que hoje drena a bateria de um aparelho em horas pode rodar por dias, porque o processador fica praticamente inerte entre uma palavra e outra. Tarefas de percepcao continua — deteccao de queda, leitura de gestos, escuta de ambiente — sao as que mais se beneficiam.

O custo e a friccao de software. O modelo de programacao e outro: nao ha um "loop principal" que roda sempre, e sim redes que disparam sob estimulo. Poucas equipes dominam esse paradigma, e as ferramentas ainda sao rusticas. Os fabricantes apostam em camadas de traducao que aceitam modelos treinados do jeito convencional.

Para o usuario, a mudanca vai aparecer primeiro como um numero melhor na etiqueta de consumo, nao como um recurso novo. A revolucao, se vier, e silenciosa: dispositivos que enxergam e ouvem o tempo todo sem pedir para serem recarregados.
]' WHERE titulo = 'Chips neuromórficos chegam ao mercado consumidor';


UPDATE materia SET corpo = q'[
Um coletivo brasileiro decidiu fazer o que a maior parte do mercado evita: creditar explicitamente os modelos de IA como coautores das suas obras. Nas fichas tecnicas de uma serie de gravuras e videos, ao lado dos nomes dos artistas, aparece o nome do sistema usado e a versao.

A decisao e politica. Para o grupo, esconder a maquina no processo criativo e uma forma de mentir sobre como o trabalho foi feito — e tambem de escapar do debate sobre direitos, dados de treino e remuneracao de quem produziu as imagens que alimentaram o modelo.

Juridicamente, o gesto abre uma caixa. A legislacao de direito autoral do pais reconhece autoria apenas para pessoas fisicas; um "coautor" que e software nao tem personalidade juridica nem pode ceder direitos. Advogados ouvidos pela reportagem dizem que o credito, hoje, tem valor simbolico, nao contratual.

O coletivo sabe disso e diz que e esse o ponto. Ao forcar a assinatura da maquina para dentro da obra, quer transformar uma discussao abstrata sobre autoria em um problema concreto que galerias, editais e museus vao ter de responder caso a caso.
]' WHERE titulo = 'Coletivo de artistas processa IA como coautora';


UPDATE materia SET corpo = q'[
Entrou em vigor a lei que regula o uso de inteligencia artificial em decisoes de diagnostico medico. O texto nao proibe os sistemas, mas exige que toda conclusao automatizada com impacto no tratamento passe por revisao humana registrada, com nome e responsabilidade do profissional que assinou.

A norma tambem obriga hospitais a manter um registro auditavel: qual modelo foi usado, com que versao, quais dados entraram e qual foi a saida. Em caso de erro, esse rastro e o que permite reconstruir a decisao. Sem ele, a responsabilidade recai integralmente sobre a instituicao.

Entidades medicas apoiaram a exigencia de auditoria humana, mas alertam para o efeito colateral: em redes publicas sobrecarregadas, a revisao obrigatoria pode virar carimbo. Se o profissional nao tem tempo de contestar a maquina, a "supervisao" existe so no papel.

O ministerio responde que a lei preve fiscalizacao por amostragem e que a fase inicial sera de adequacao, sem multa. A duvida que o setor leva para os proximos meses e se a regra vai elevar a qualidade das decisoes ou apenas redistribuir a culpa quando algo der errado.
]' WHERE titulo = 'Governo federal regulamenta uso de IA em diagnóstico médico';

COMMIT;

-- Confere: nenhuma materia deve continuar com o texto-stub.
SELECT id_materia, titulo, DBMS_LOB.GETLENGTH(corpo) AS tamanho_corpo
FROM materia
ORDER BY id_materia;
