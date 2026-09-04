from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

COLUNAS_NOVAS_USUARIOS = {
    "senha_hash": "VARCHAR(200)",
    "token": "VARCHAR(64)",
    "criado_em": "DATETIME",
    "proporcao_avancos": "INTEGER",
    "temas": "VARCHAR(300)",
    "perfil": "VARCHAR(20)",
    "tempo": "VARCHAR(20)",
}


def aplicar_migracoes(engine: Engine):
    """Adiciona colunas novas em tabelas já existentes (SQLite ALTER TABLE ADD COLUMN
    é seguro e não apaga dados). Só roda o que faltar."""
    inspetor = inspect(engine)
    if "usuarios" not in inspetor.get_table_names():
        return

    colunas_existentes = {c["name"] for c in inspetor.get_columns("usuarios")}
    with engine.begin() as conexao:
        for nome, tipo in COLUNAS_NOVAS_USUARIOS.items():
            if nome not in colunas_existentes:
                conexao.execute(text(f"ALTER TABLE usuarios ADD COLUMN {nome} {tipo}"))
