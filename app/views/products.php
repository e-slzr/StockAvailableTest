<?php
// Obtener los productos
$products = getApiData('products');
?>

<!-- Cabecera con título y botón de nuevo producto -->
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Products</h2>
    <button type="button" class="btn btn-primary" id="newProductBtn" data-bs-toggle="modal" data-bs-target="#productModal">
        New Product
    </button>
</div>

<!-- Tabla de productos -->
<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Description</th>
                        <th>Minimum Stock</th>
                        <th>Unit</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Last Transaction</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!empty($products)): ?>
                        <?php foreach ($products as $product): ?>
                            <tr>
                                <td><?= htmlspecialchars($product['code']) ?></td>
                                <td><?= htmlspecialchars($product['description']) ?></td>
                                <td><?= htmlspecialchars($product['minimumStock']) ?></td>
                                <td><?= htmlspecialchars($product['unit']) ?></td>
                                <td><?= htmlspecialchars($product['categoryName']) ?></td>
                                <td>
                                    <span class="badge <?= $product['isActive'] ? 'bg-success' : 'bg-danger' ?>">
                                        <?= $product['isActive'] ? 'Active' : 'Inactive' ?>
                                    </span>
                                </td>
                                <td><?= $product['lastTransactionDate'] ? date('Y-m-d H:i', strtotime($product['lastTransactionDate'])) : 'N/A' ?></td>
                                <td>
                                    <button class="btn btn-sm btn-primary" onclick="editProduct(<?= $product['id'] ?>)">
                                        Edit
                                    </button>
                                    <button class="btn btn-sm <?= $product['isActive'] ? 'btn-danger' : 'btn-success' ?>" 
                                            onclick="toggleProductStatus(<?= $product['id'] ?>, <?= $product['isActive'] ? 'false' : 'true' ?>)">
                                        <?= $product['isActive'] ? 'Deactivate' : 'Activate' ?>
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="8" class="text-center">No products found</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal para crear/editar producto -->
<div class="modal fade" id="productModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">New Product</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="productForm">
                    <input type="hidden" id="productId">
                    <div class="mb-3">
                        <label for="code" class="form-label">Code</label>
                        <input type="text" class="form-control" id="code" required>
                    </div>
                    <div class="mb-3">
                        <label for="description" class="form-label">Description</label>
                        <input type="text" class="form-control" id="description" required>
                    </div>
                    <div class="mb-3">
                        <label for="minimumStock" class="form-label">Minimum Stock</label>
                        <input type="number" class="form-control" id="minimumStock" min="0" required>
                    </div>
                    <div class="mb-3">
                        <label for="unit" class="form-label">Unit</label>
                        <input type="text" class="form-control" id="unit" required>
                    </div>
                    <div class="mb-3">
                        <label for="categoryId" class="form-label">Category</label>
                        <select class="form-select" id="categoryId" required>
                            <!-- Se llenará con JavaScript -->
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveProduct()">Save</button>
            </div>
        </div>
    </div>
</div>
