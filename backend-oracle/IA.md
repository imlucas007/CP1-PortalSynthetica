# Resumo inteligente — CP1 AI & Web Application

Na leitura de uma matéria, o botão **Resumir com IA** mostra um resumo gerado pelo Gemini. O artigo original permanece disponível e o resultado é identificado como IA.

O frontend envia `POST /materias/{id}/resumo-ia`, sem chave ou texto fornecido pelo visitante. A API Python consulta a matéria no Oracle, fecha a conexão e envia seu título e corpo à API Gemini. Não há alteração no banco. A resposta inclui `id_materia`, `resumo` e `modelo`.

Configure `GEMINI_API_KEY` no `.env` deste backend, ignorado pelo Git. Opcionalmente configure `GEMINI_MODEL`; padrão: `gemini-3.5-flash-lite`. Reinicie o backend após alterar o ambiente. Nunca use prefixo `VITE_` para essa chave.

O prompt pede até 100 palavras em português, preservando ressalvas, sem acrescentar fatos ou seguir instruções presentes na matéria. Respostas incompletas, bloqueadas, limites e falhas de conexão geram mensagem de erro, sem resumo simulado. Até 128 resumos são reutilizados em memória por título, corpo e modelo; mudar o texto invalida a reutilização. Reiniciar o servidor limpa o cache.

Tecnologia da disciplina: Google AI Studio (chave Gemini) e integração do LLM via Python/httpx. Referência REST: https://ai.google.dev/api/generate-content

Validação local: `python -m unittest test_ia.py`, build/lint do frontend e teste real pelo botão. Para demonstrar, abra `/leitura/1`, clique no botão, leia o painel e navegue para outra matéria. A nova matéria não deve mostrar o resumo anterior.

Estes recursos estão preparados para demonstração local. Antes de disponibilizá-los publicamente, defina autenticação ou limitação de requisições e cotas de consumo: os endpoints atuais são acessíveis aos visitantes e chamadas não armazenadas em cache consomem a cota Gemini.

## Curadoria inteligente

No `/sumario`, a seção **Sua seleção com IA** permite escolher temas, proporção desejada e quantidade (1 a 5). Os valores iniciais de temas e proporção vêm da ficha local do navegador. Ajustes valem para esta seleção e não alteram a ficha do assinante. O catálogo completo permanece disponível abaixo; Home e capa mantêm a edição completa.

`POST /curadoria` recebe `temas`, `proporcao_avancos` e `quantidade`. O backend consulta o Oracle e envia apenas IDs, títulos, categorias e chamadas das matérias ao Gemini. O modelo retorna IDs e motivos em JSON. O servidor valida quantidade, unicidade e existência dos IDs; títulos e links são construídos a partir do Oracle. Se a IA devolver uma seleção inválida, aparece um erro e o usuário pode tentar de novo. Não há seleção simulada nem criação de artigos.

As recomendações ficam nesta tela enquanto aberta. Alterar preferências limpa a seleção anterior. Nenhuma chave, e-mail, senha ou histórico de leitura é enviado no prompt. As recomendações não são armazenadas em cache; cada clique de geração faz uma chamada Gemini.

Testes: `python -m unittest test_ia.py test_curadoria.py`. Para demonstrar, escolha AUTORIA e uma proporção favorável a cultura, gere a seleção e abra uma matéria recomendada. Depois teste outra preferência e compare as justificativas; o catálogo pequeno limita a diversidade de resultados.
