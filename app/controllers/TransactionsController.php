<?php
class TransactionsController {
    private $transactionModel;
    
    public function __construct() {
        $this->transactionModel = new Transaction();
    }

    public function index() {
        $transactions = $this->transactionModel->getAll();
        
        // Load view
        ob_start();
        require_once 'app/views/transactions/index.php';
        $content = ob_get_clean();
        
        require_once 'app/views/layouts/main.php';
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $result = $this->transactionModel->create($data);
            
            header('Content-Type: application/json');
            echo json_encode($result);
            exit;
        }
    }

    public function update() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id'] ?? null;
            
            if ($id) {
                unset($data['id']);
                $result = $this->transactionModel->update($id, $data);
                
                header('Content-Type: application/json');
                echo json_encode($result);
                exit;
            }
        }
    }

    public function delete() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id'] ?? null;
            
            if ($id) {
                $result = $this->transactionModel->delete($id);
                
                header('Content-Type: application/json');
                echo json_encode($result);
                exit;
            }
        }
    }
}
