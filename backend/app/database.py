import os

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker, declarative_base

def criar_engine(database_url=None):
    endereco = database_url or os.getenv("DATABASE_URL")
    if not endereco:
        if os.getenv("RENDER"):
            raise RuntimeError("Configure DATABASE_URL com um PostgreSQL persistente no Render.")
        endereco = "sqlite:///./synthetica.db"
    url = make_url(endereco)
    if url.drivername in ("postgres", "postgresql"):
        url = url.set(drivername="postgresql+psycopg")
    if os.getenv("RENDER") and url.get_backend_name() == "sqlite":
        raise RuntimeError("Use PostgreSQL em DATABASE_URL no Render para preservar as contas.")
    return create_engine(
        url,
        connect_args={"check_same_thread": False} if url.get_backend_name() == "sqlite" else {"connect_timeout": 15},
        pool_pre_ping=True,
    )

engine = criar_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
