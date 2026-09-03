# Portal Synthetica — CP1/CP2

Projeto integrador (Synthetica) — disciplinas **Framework Application** (CRUD de conteúdos) e **Mobile Hybrid Development**.

## Estrutura

- `backend/` — API REST em FastAPI + SQLAlchemy + SQLite, CRUD de conteúdos do Portal Synthetica.
- `frontend/` — Painel de redação em React + Vite, consumindo a API via `fetch`.

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

## Modelo de dados

- **Usuário** — autor/editor do conteúdo.
- **Categoria** — as duas categorias do desafio (Avanços Tecnológicos / IA na Arte e Cultura).
- **Editoria** — subcategoria usada nos filtros do painel (Avanços, Cultura, Ética, Memória), ligada a uma Categoria.
- **Conteúdo** — a matéria em si (título, chamada, corpo, editoria, página, tempo de leitura, palavra-chave SEO, status).
- **Comentário** / **Favorito** — ligados a Conteúdo e Usuário, para fechar o MER do desafio.

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| GET | `/conteudos` | Lista conteúdos (filtros: `busca`, `editoria`, `status`) |
| GET | `/conteudos/{id}` | Detalhe de um conteúdo |
| POST | `/conteudos` | Cria conteúdo |
| PUT/PATCH | `/conteudos/{id}` | Atualiza conteúdo |
| DELETE | `/conteudos/{id}` | Remove conteúdo |
| GET | `/editorias` | Lista editorias (para o formulário) |
| GET | `/categorias` | Lista categorias |
