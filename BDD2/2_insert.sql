INSERT INTO perfis (nome) VALUES 
('Cliente'), ('Administrador');

INSERT INTO status_agendamento (nome) VALUES 
('Pendente'), ('Confirmado'), ('Concluído'), ('Cancelado');

-- Inserindo Usuários (20 linhas)
INSERT INTO usuarios (perfil_id, nome_completo, email, senha, telefone) VALUES
(2, 'Admin', 'adm@daedalo.com', '123456', '19999999999'),
(1, 'João Cabeleireiro', 'joao@gmail.com', '123456789', '19988888888'),
(1, 'Carlos Souza', 'carlos@gmail.com', '123456789', '19977777777'),
(1, 'Maria Oliveira', 'maria@gmail.com', '123456789', '19966666666'),
(1, 'Pedro Alves', 'pedro@gmail.com', '123456789', '19955555555'),
(1, 'Ana Clara', 'ana@gmail.com', '123456789', '19944444444'),
(1, 'Lucas Mendes', 'lucas@gmail.com', '123456789', '19933333333'),
(1, 'Fernanda Costa', 'fernanda@gmail.com', '123456789', '19922222222'),
(1, 'Rafael Lima', 'rafael@gmail.com', '123456789', '19911111111'),
(1, 'Juliana Castro', 'juliana@gmail.com', '123456789', '19900000000'),
(1, 'Marcos Rocha', 'marcos@gmail.com', '123456789', '19899999999'),
(1, 'Beatriz Santos', 'beatriz@gmail.com', '123456789', '19888888888'),
(1, 'Tiago Silva', 'tiago@gmail.com', '123456789', '19877777777'),
(1, 'Camila Ribeiro', 'camila@gmail.com', '123456789', '19866666666'),
(1, 'Bruno Carvalho', 'bruno@gmail.com', '123456789', '19855555555'),
(1, 'Aline Martins', 'aline@gmail.com', '123456789', '19844444444'),
(1, 'Rodrigo Gomes', 'rodrigo@gmail.com', '123456789', '19833333333'),
(1, 'Letícia Melo', 'leticia@gmail.com', '123456789', '19822222222'),
(1, 'Felipe Barros', 'felipe@gmail.com', '123456789', '19811111111'),
(1, 'Larissa Dias', 'larissa@gmail.com', '123456789', '19800000000');

