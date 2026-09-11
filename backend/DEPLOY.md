# Cadastro e login no Render com Neon

Crie um projeto no plano Free do Neon e copie a URL PostgreSQL no painel Connect. Não publique essa URL: ela contém a senha do banco.

No Web Service `synthetica-auth` do Render:

- Root Directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- `PYTHON_VERSION=3.12.10`
- `DATABASE_URL`: URL completa fornecida pelo Neon, preservando `sslmode=require` e demais parâmetros.
- `CORS_ORIGINS=https://synthetica-portal.onrender.com`
- Opcional: `ADMIN_INITIAL_PASSWORD`, uma senha forte definida antes da primeira inicialização, para acessar a redação. Sem ela, as contas editoriais recebem senha aleatória no Render. A senha de demonstração local não é aplicada na nuvem. Essa configuração não altera senhas existentes.

O backend cria tabelas no PostgreSQL e usa esse banco para contas, sessões e painel editorial. Reiniciar o Render não apaga essas contas. O plano gratuito do Neon tem cotas; ele não é uma promessa de disponibilidade ilimitada. Contas de um SQLite local anterior não são migradas automaticamente.

No Static Site `synthetica-portal`, acrescente `VITE_API_URL` com a URL HTTPS do serviço `synthetica-auth` e reconstrua o frontend. Preserve `VITE_ORACLE_API_URL`: os artigos e Gemini continuam na outra API.

Valide cadastro, logout, login, ficha e persistência após reiniciar o serviço. Não configure a URL do banco no frontend.
