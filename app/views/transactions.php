<?php
// Obtener las transacciones
$transactions = getApiData('transactions');
?>

<!-- Cabecera con título -->
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Transaction history</h2>
</div>

<!-- Tabla de transacciones -->
<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Box</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Type</th>
                        <th>Last Transaction</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!empty($transactions)): ?>
                        <?php foreach ($transactions as $transaction): ?>
                            <tr>
                                <td><?= htmlspecialchars($transaction['id']) ?></td>
                                <td><?= htmlspecialchars($transaction['boxCode']) ?></td>
                                <td><?= htmlspecialchars($transaction['productDescription']) ?></td>
                                <td><?= htmlspecialchars($transaction['quantity']) ?></td>
                                <td>
                                    <span class="badge <?= $transaction['type'] === 'IN' ? 'bg-success' : 'bg-danger' ?>">
                                        <?= htmlspecialchars($transaction['type']) ?>
                                    </span>
                                </td>
                                <td><?= htmlspecialchars(date('Y-m-d H:i', strtotime($transaction['transactionDate']))) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="6" class="text-center">No transactions found</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Scripts -->
<script src="public/js/custom/api_helper.js"></script>
<script src="public/js/custom/transactions.js"></script>

<!-- El modal de confirmación de eliminación ha sido eliminado ya que las transacciones no se pueden eliminar -->

<!-- Modal para crear/editar transacción -->
<div class="modal fade" id="transactionModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">            <div class="modal-header">
                <h5 class="modal-title" id="transactionModalLabel">New Transaction</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="transactionForm">
                    <input type="hidden" id="transactionId">
                    <div class="mb-3">
                        <label for="boxId" class="form-label">Box</label>
                        <select class="form-control form-select" id="boxId" required>
                            <!-- Se llenará con JavaScript -->
                        </select>
                        <div id="boxCapacityInfo" class="form-text mt-2"></div>
                    </div>
                    <div class="mb-3">
                        <label for="productId" class="form-label">Product</label>
                        <select class="form-control form-select" id="productId" required>
                            <!-- Se llenará con JavaScript -->
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="quantity" class="form-label">Quantity</label>
                        <input type="number" class="form-control" id="quantity" min="1" required>
                        <div id="quantityError" class="form-text text-danger mt-1"></div>
                    </div>
                    <div class="mb-3">
                        <label for="type" class="form-label">Type</label>
                        <select class="form-control form-select" id="type" required>
                            <option value="IN">IN</option>
                            <option value="OUT">OUT</option>
                        </select>
                    </div>
                </form>
            </div>            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="saveTransactionBtn">Save</button>
            </div>
        </div>
    </div>
</div>
