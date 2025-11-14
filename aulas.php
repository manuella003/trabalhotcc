<?php
session_start();
header('Content-Type: application/json');

// Verifica se está logado
if (!isset($_SESSION['professor_id'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Não autorizado']);
    exit;
}

// Arquivo para armazenar aulas (em produção, use banco de dados)
$arquivo_aulas = '../data/aulas.json';

// Garante que o diretório existe
if (!file_exists('../data')) {
    mkdir('../data', 0777, true);
}

// Inicializa arquivo se não existir
if (!file_exists($arquivo_aulas)) {
    file_put_contents($arquivo_aulas, json_encode([]));
}

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':
        // Listar todas as aulas
        $aulas = json_decode(file_get_contents($arquivo_aulas), true);
        echo json_encode($aulas);
        break;
        
    case 'POST':
        // Criar nova aula
        $dados = json_decode(file_get_contents('php://input'), true);
        
        $aulas = json_decode(file_get_contents($arquivo_aulas), true);
        
        $nova_aula = [
            'id' => uniqid(),
            'disciplina' => $dados['disciplina'],
            'turma' => $dados['turma'],
            'data' => $dados['data'],
            'horarioInicio' => $dados['horarioInicio'],
            'horarioFim' => $dados['horarioFim'],
            'sala' => $dados['sala'],
            'descricao' => $dados['descricao'] ?? '',
            'professor_id' => $_SESSION['professor_id']
        ];
        
        $aulas[] = $nova_aula;
        file_put_contents($arquivo_aulas, json_encode($aulas));
        
        echo json_encode($nova_aula);
        break;
        
    case 'DELETE':
        // Deletar aula
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID não fornecido']);
            exit;
        }
        
        $aulas = json_decode(file_get_contents($arquivo_aulas), true);
        $aulas = array_filter($aulas, function($aula) use ($id) {
            return $aula['id'] !== $id;
        });
        
        file_put_contents($arquivo_aulas, json_encode(array_values($aulas)));
        
        echo json_encode(['sucesso' => true]);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['erro' => 'Método não permitido']);
}
?>
