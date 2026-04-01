-- Script de inicialização do PostgreSQL
-- Cria o banco de dados de testes separado do banco principal

SELECT 'CREATE DATABASE uaimed_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'uaimed_test')\gexec

GRANT ALL PRIVILEGES ON DATABASE uaimed_test TO docker;

