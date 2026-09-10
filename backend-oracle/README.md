# backend-oracle — API FastAPI + Oracle

API REST ligando o banco Oracle do Portal Synthetica ao projeto, no **mesmo
padrão do repositório de aula** ([vvsantos/aula_fastapi](https://github.com/vvsantos/aula_fastapi)):

- `database.py` cuida **só** da conexão (`oracledb` em modo *thin* — sem
  Instant Client);
- `main.py` tem as rotas, os modelos Pydantic (entrada/saída separados) e um
  helper `linha_para_x` que converte a tupla do cursor em dicionário;
- toda query com **bind variables** (`:nome`) — nada de concatenar string
  no SQL;
- toda escrita com **`commit()` / `rollback()` explícitos**, num
  `try / except / finally` que sempre fecha `cursor` e `conn`;
- `SELECT` sempre com as colunas listadas, nunca `SELECT *`.

> Não substitui o `backend/` (SQLite + SQLAlchemy) que roda o portal do
> leitor. É um serviço separado, para a disciplina de Banco de Dados.

## Passo a passo

**1. Crie e popule o schema** — no SQL Developer, rode o `synthetica-completo.sql`:
   1. parte 1 (DDL, os `CREATE TABLE`)
   2. parte 2 (DML, os `INSERT` + `COMMIT`)
   > Na 1ª execução os `DROP TABLE` do topo dão
   > `ORA-00942: table or view does not exist` — é esperado, siga.

**1b. Texto real das matérias** — a carga põe `MATERIA.corpo` com stubs
(`'Corpo completo da matéria sobre chips...'`). Como a revista (front) lê esse
CLOB na tela de Leitura, rode `corpo-materias.sql` uma vez para trocar os
stubs por texto de verdade (5 `UPDATE` + `COMMIT`).

**2. Suba a API:**

```bash
cd backend-oracle
cp .env.exemplo .env          # edite com usuário / senha / host / service do seu Oracle
./iniciar.sh                  # macOS / Linux   (Windows: iniciar.bat)
```

Ou na mão:

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8010
```

- Swagger: <http://127.0.0.1:8010/docs>
- `GET /health` → `SELECT 1 FROM dual`, confirma que o banco responde.
- `testes.http` tem uma chamada pronta para cada rota (extensão REST Client).

## Rotas (seção 7 do doc de modelagem)

| Rota | Método | SQL |
|---|---|---|
| `/materias` | GET | consulta 5.1 — `MATERIA JOIN EIXO JOIN AUTOR` (+ `resumo`, `pagina` via `ROW_NUMBER`, `tempo_leitura` via `DBMS_LOB.GETLENGTH`, campos que a revista consome) |
| `/materias/mais-comentadas` | GET | consulta 5.2 — `LEFT JOIN COMENTARIO + COUNT + GROUP BY` |
| `/materias/{id_materia}` | GET | detalhe p/ a tela de Leitura — 5.1 + `corpo` (CLOB) + tags (`MATERIA_TAG JOIN TAG` com `LISTAGG`) |
| `/materias/{id}/comentarios` | POST | `INSERT INTO comentario` — corpo: `id_usuario`, `texto` |
| `/comentarios/{id}` | PUT | `UPDATE comentario ... WHERE id_comentario=:id AND id_usuario=:uid` |
| `/comentarios/{id}` | DELETE | `DELETE FROM comentario ...` restrito ao autor |
| `/usuarios/{id}/favoritos` | GET | consulta 5.3 — `FAVORITO JOIN MATERIA JOIN EIXO` |
| `/favoritos` | POST | `INSERT INTO favorito` — corpo: `id_usuario`, `id_materia` |
| `/favoritos/{id_usuario}/{id_materia}` | DELETE | `DELETE FROM favorito ...` |
| `/usuarios/mais-ativos` | GET | consulta 5.4 — `UNION ALL` + `COUNT` + `GROUP BY` + `FETCH FIRST 10` |
| `/avaliacoes/{id}/moderar` | PUT | `UPDATE avaliacao SET status, moderada_por, editada_em` |

### Autenticação simulada

As rotas restritas ao autor (`PUT` / `DELETE` de comentário) leem o header
**`X-Usuario-Id`** — o id que entraria via token numa app real. O
`id_usuario` vai para o `WHERE`; se o comentário não for daquele usuário, a
API responde `404`.

### Tradução de erros do Oracle

Em erro do banco, a rota faz `rollback` e devolve `HTTPException(400, str(erro))`
com a mensagem original do Oracle (`ORA-00001` PK duplicada, `ORA-02291` FK
sem pai, `ORA-02290` CHECK violado, etc.) — assim dá pra ver na hora qual
constraint barrou.
