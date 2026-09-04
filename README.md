# Portal Synthetica — CP1/CP2

Projeto integrador (Synthetica) — disciplinas **Framework Application** (CRUD de conteúdos + portal completo) e **Mobile Hybrid Development**.

## Estrutura

- `backend/` — API REST em FastAPI + SQLAlchemy + SQLite: CRUD de conteúdos, cartas à redação e autenticação (leitor e redação).
- `frontend/` — React + Vite (CSS Modules puro, sem Tailwind): painel de redação + portal do leitor, consumindo a API via `fetch`.

## Rodando localmente

### Backend

```bash
cd backend
python3 -m venv venv
venv/Scripts/python.exe -m pip install -r requirements.txt   # Windows
venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000
```

API disponível em `http://127.0.0.1:8000` (docs automáticas em `/docs`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App disponível em `http://localhost:5173`.

## Contas de teste

O banco já vem semeado com dados de exemplo.

- **Redação (admin)** — `http://localhost:5173/admin/login`
  E-mail: `redacao@synthetica.app` · Senha: `redacao2047`
- **Leitor/assinante** — crie uma conta em `http://localhost:5173/cadastro` (passa antes pela Ficha de Assinatura em `/assinatura`).

O login da redação é **separado** do login do leitor: cada `Usuario.papel` (`"editor"` ou `"assinante"`) só acessa a área correspondente — uma conta de leitor não consegue entrar em `/admin/*`.

## Rotas principais do frontend

| Área | Rota | O que é |
|---|---|---|
| Redação | `/admin/login` | Login da equipe editorial |
| Redação | `/admin/painel` | Dashboard |
| Redação | `/admin/conteudos` | CRUD de conteúdos |
| Redação | `/admin/cartas` | Moderação de cartas de assinantes |
| Leitor | `/assinatura` | Ficha de Assinatura (onboarding, 4 perguntas) |
| Leitor | `/cadastro`, `/login` | Cadastro e login do assinante |
| Leitor | `/assinante` | Ficha do assinante (sinais salvos, "apagar") |
| Leitor | `/home` | Home com a agulha de duas faces |
| Leitor | `/sumario` | Sumário da edição (conteúdos reais) |
| Leitor | `/leitura/:id` | Leitura de uma matéria |
| Leitor | `/checkout`, `/assinatura-confirmada`, `/cancelar-assinatura` | Fluxo de assinatura (sem processar pagamento real) |

## Modelo de dados

- **Usuário** — autor/editor de conteúdo **ou** assinante (`papel`). Guarda também autenticação (`senha_hash`, `token`) e os sinais coletados na Ficha de Assinatura (`proporcao_avancos`, `temas`, `perfil`, `tempo`).
- **Categoria** — as duas categorias do desafio (Avanços Tecnológicos / IA na Arte e Cultura).
- **Editoria** — subcategoria usada nos filtros do painel (Avanços, Cultura, Ética, Memória), ligada a uma Categoria.
- **Conteúdo** — a matéria em si (título, chamada, corpo, editoria, página, tempo de leitura, palavra-chave SEO, status).
- **Comentário** / **Favorito** — ligados a Conteúdo e Usuário, para fechar o MER do desafio.
- **Carta** — mensagem de um assinante à redação (pendente/aprovada/recusada).

## Nota pra quem for trocar o banco (Database Application)

Esse backend já usa um banco relacional de verdade (SQLite) via SQLAlchemy — não é dado fake em memória. Pra trocar pelo MER definitivo da disciplina de Database Application:

1. **Trocar a engine** (se for usar Postgres/MySQL em vez de SQLite): só muda `SQLALCHEMY_DATABASE_URL` em `backend/app/database.py`. As rotas em `main.py` não mudam.
2. **Trocar/ajustar as tabelas**: os modelos ficam todos em `backend/app/models.py` (um por classe). Os schemas de entrada/saída da API ficam em `schemas.py`, separados dos modelos — dá pra ajustar o banco sem quebrar o formato que o frontend espera, desde que os campos usados pelo frontend continuem existindo (ver `frontend/src/api/client.js` pra ver o que cada tela consome).
3. Migrações simples (adicionar coluna sem apagar dado) estão em `backend/app/migracoes.py` — é só ALTER TABLE, funciona com SQLite e a maioria dos bancos relacionais.
4. Os dados de exemplo (`backend/app/seed.py`) só populam se as tabelas estiverem vazias — pode ligar/desligar/substituir sem afetar a estrutura da API.

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| GET | `/conteudos` | Lista conteúdos (filtros: `busca`, `editoria`, `status`) |
| GET | `/conteudos/{id}` | Detalhe de um conteúdo |
| POST | `/conteudos` | Cria conteúdo |
| PUT/PATCH | `/conteudos/{id}` | Atualiza conteúdo |
| DELETE | `/conteudos/{id}` | Remove conteúdo |
| GET | `/editorias`, `/categorias` | Listas de apoio pro formulário |
| GET | `/cartas` | Lista cartas (filtros: `status`, `busca`) |
| PATCH | `/cartas/{id}` | Aprova/recusa uma carta |
| POST | `/auth/cadastro` | Cria conta de assinante (com os sinais da Ficha de Assinatura) |
| POST | `/auth/login` | Login (leitor ou redação — o front decide qual área liberar pelo `papel`) |
| GET | `/auth/eu` | Dados da conta autenticada (`Authorization: Bearer <token>`) |
| PATCH | `/auth/preferencias` | Atualiza sinais da ficha |
| DELETE | `/auth/preferencias/{campo}` | Apaga um sinal específico |
