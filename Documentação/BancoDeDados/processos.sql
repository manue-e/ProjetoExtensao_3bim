DELIMITER $$

CREATE TRIGGER trg_log_agendamento_criado
AFTER INSERT ON agendamentos
FOR EACH ROW
BEGIN
    INSERT INTO log_agendamentos (agendamento_id, status_anterior, status_novo, alterado_por)
    VALUES (NEW.id, NULL, NEW.status_id, 'SISTEMA');
END$$

CREATE TRIGGER trg_log_agendamento_cancelado
AFTER UPDATE ON agendamentos
FOR EACH ROW
BEGIN
    IF OLD.status_id <> NEW.status_id THEN
        INSERT INTO log_agendamentos (agendamento_id, status_anterior, status_novo, alterado_por)
        VALUES (NEW.id, OLD.status_id, NEW.status_id, 'SISTEMA');
    END IF;
END$$

CREATE PROCEDURE sp_cadastrar_usuario(
    IN p_perfil_id INT,
    IN p_nome VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_senha VARCHAR(255),
    IN p_telefone VARCHAR(20)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Erro';
    END;

    START TRANSACTION;
        INSERT INTO usuarios (perfil_id, nome_completo, email, senha, telefone)
        VALUES (p_perfil_id, p_nome, p_email, p_senha, p_telefone);
    COMMIT;
END$$

CREATE PROCEDURE sp_cadastrar_agendamento(
    IN p_usuario_id INT,
    IN p_servico_id INT,
    IN p_status_id INT,
    IN p_data_hora DATETIME,
    IN p_observacoes VARCHAR(100)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Erro';
    END;

    START TRANSACTION;
        INSERT INTO agendamentos (usuario_id, servico_id, status_id, data_hora, observacoes)
        VALUES (p_usuario_id, p_servico_id, p_status_id, p_data_hora, p_observacoes);
    COMMIT;
END$$

DELIMITER ;
