SELECT 
    u.id,
    u.nome_completo,
    COUNT(a.id)
FROM usuarios u
LEFT JOIN agendamentos a ON u.id = a.usuario_id
GROUP BY u.id, u.nome_completo;

SELECT 
    s.id,
    s.nome,
    COUNT(a.id) AS total
FROM servicos s
JOIN agendamentos a ON s.id = a.servico_id
GROUP BY s.id, s.nome
ORDER BY total DESC;

SELECT 
    s.id,
    s.nome,
    COUNT(a.id)
FROM servicos s
LEFT JOIN agendamentos a ON s.id = a.servico_id
GROUP BY s.id, s.nome;

SELECT 
    sa.nome,
    COUNT(a.id)
FROM status_agendamento sa
LEFT JOIN agendamentos a ON sa.id = a.status_id
GROUP BY sa.id, sa.nome;
