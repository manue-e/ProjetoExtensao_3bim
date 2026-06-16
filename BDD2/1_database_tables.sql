CREATE DATABASE IF NOT EXISTS daedalo_bd;

USE daedalo_bd;

CREATE TABLE IF NOT EXISTS perfis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    perfil_id INT NOT NULL DEFAULT 1, -- Por padrão, 1 = 'cliente'
    nome VARCHAR(100) NOT NULL,        
    email VARCHAR(100) NOT NULL UNIQUE, 
    senha VARCHAR(255) NOT NULL,       
    telefone VARCHAR(20) NOT NULL,     
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    preco DECIMAL(10, 2) NOT NULL DEFAULT 0.00, 
    duracao_minutos INT NOT NULL DEFAULT 60,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS status_agendamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    servico_id INT NOT NULL,
    status_id INT NOT NULL DEFAULT 1, -- Por padrão, 1 = 'pendente'
    data_hora DATETIME NOT NULL,
    observacoes TEXT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_agendamento_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_agendamento_servico FOREIGN KEY (servico_id) 
        REFERENCES servicos(id) ON DELETE RESTRICT,
    CONSTRAINT fk_agendamento_status FOREIGN KEY (status_id) 
        REFERENCES status_agendamento(id) ON DELETE RESTRICT
);
