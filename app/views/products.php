<?php
// Obtener los productos
$products = getApiData('products');
?>

<!-- Cabecera con título y botón de nuevo producto -->
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Products</h2>
    <button type="button" class="btn btn-primary" id="newProductBtn" data-bs-toggle="modal" data-bs-target="#productModal">
        <svg height="16" width="16" viewBox="0 0 512 512" style="fill:currentColor;">
            <polygon points="448,224 288,224 288,64 224,64 224,224 64,224 64,288 224,288 224,448 288,448 288,288 448,288" />
        </svg>
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
                        <th>Unit</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Last Transaction</th>
                        <th>Minimum Stock</th>
                        <th>Available Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!empty($products)): ?>
                        <?php foreach ($products as $product): ?>
                            <tr>
                                <td><?= htmlspecialchars($product['code']) ?></td>
                                <td><?= htmlspecialchars($product['description']) ?></td>
                                <td><?= htmlspecialchars($product['unit']) ?></td>
                                <td><?= htmlspecialchars($product['categoryName']) ?></td>
                                <td>
                                    <span class="badge <?= $product['isActive'] ? 'bg-success' : 'bg-danger' ?>">
                                        <?= $product['isActive'] ? 'Active' : 'Inactive' ?>
                                    </span>
                                </td>
                                <td><?= $product['lastTransactionDate'] ? date('Y-m-d H:i', strtotime($product['lastTransactionDate'])) : 'N/A' ?></td>
                                <td>
                                    <?php if ($product['availableStock'] < $product['minimumStock']): ?>
                                        <span class="text-danger" title="Stock below minimum level">
                                            <?= htmlspecialchars($product['minimumStock']) ?>
                                            <i class="bi bi-exclamation-triangle-fill"></i>
                                        </span>
                                    <?php else: ?>
                                        <?= htmlspecialchars($product['minimumStock']) ?>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if ($product['availableStock'] < $product['minimumStock']): ?>
                                        <span class="text-danger fw-bold"><?= htmlspecialchars($product['availableStock']) ?></span>
                                    <?php else: ?>
                                        <?= htmlspecialchars($product['availableStock']) ?>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <div class="d-flex gap-1">
                                        <!-- Botón para ver detalles del producto -->
                                        <button class="btn btn-sm btn-dark text-white" 
                                                onclick="viewProductBoxes(<?= $product['id'] ?>, '<?= htmlspecialchars($product['code']) ?>')"
                                                title="View boxes containing this product">
                                            <svg height="16" width="16" viewBox="0 0 576 512" style="fill:currentColor;">
                                                <path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"/>
                                            </svg>
                                        </button>
                                        <!-- Botón de editar -->
                                        <button class="btn btn-sm btn-primary" onclick="editProduct(<?= $product['id'] ?>)" title="Edit product">
                                            <svg height="16" width="16" viewBox="0 0 512 512" style="fill:currentColor;">
                                                <g>
                                                    <path d="M442.8,99.6l-30.4-30.4c-7-6.9-18.2-6.9-25.1,0L355.5,101l55.5,55.5l31.8-31.7C449.7,117.7,449.7,106.5,442.8,99.6z"/>
                                                    <g>
                                                        <polygon points="346.1,110.5 174.1,288 160,352 224,337.9 400.6,164.9" />
                                                    </g>
                                                    <path d="M384,256v150c0,5.1-3.9,10.1-9.2,10.1s-269-0.1-269-0.1c-5.6,0-9.8-5.4-9.8-10s0-268,0-268c0-5,4.7-10,10.6-10H256l32-32H87.4c-13,0-23.4,10.3-23.4,23.3v305.3c0,12.9,10.5,23.4,23.4,23.4h305.3c12.9,0,23.3-10.5,23.3-23.4V224L384,256z"/>
                                                </g>
                                            </svg>
                                        </button>
                                        
                                        <!-- Botón de activar/desactivar -->
                                        <button class="btn btn-sm <?= $product['isActive'] ? 'btn-danger' : 'btn-success' ?>" 
                                                onclick="toggleProductStatus(<?= $product['id'] ?>, <?= $product['isActive'] ? 'false' : 'true' ?>)" 
                                                title="<?= $product['isActive'] ? 'Deactivate product' : 'Activate product' ?>">
                                            <?php if ($product['isActive']): ?>
                                                <svg height="16" width="16" viewBox="0 0 512 512" style="fill:currentColor;">
                                                    <path d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z"/>
                                                </svg>
                                            <?php else: ?>
                                                <svg height="16" width="16" viewBox="0 0 512 512" style="fill:currentColor;">
                                                    <path d="M461.6,109.6l-54.9-43.3c-1.7-1.4-3.8-2.4-6.2-2.4c-2.4,0-4.6,1-6.3,2.5L194.5,323c0,0-78.5-75.5-80.7-77.7c-2.2-2.2-5.1-5.9-9.5-5.9c-4.4,0-6.4,3.1-8.7,5.4c-1.7,1.8-29.7,31.2-43.5,45.8c-0.8,0.9-1.3,1.4-2,2.1c-1.2,1.7-2,3.6-2,5.7c0,2.2,0.8,4,2,5.7l2.8,2.6c0,0,139.3,133.8,141.6,136.1c2.3,2.3,5.1,5.2,9.2,5.2c4,0,7.3-4.3,9.2-6.2L462,121.8c1.2-1.7,2-3.6,2-5.8C464,113.5,463,111.4,461.6,109.6z"/>
                                                </svg>
                                            <?php endif; ?>
                                        </button>
                                        
                                        <!-- Botón para transacción de entrada -->
                                        <button class="btn btn-sm btn-success" 
                                                onclick="newTransaction(<?= $product['id'] ?>, 'IN')" 
                                                title="Add stock to inventory">
                                            <svg height="16" width="16" viewBox="0 0 512 512" style="fill:currentColor;">
                                                <polygon points="256.5,64.5 64.5,256.5 176.5,256.5 176.5,448.5 336.5,448.5 336.5,256.5 448.5,256.5" />
                                            </svg>
                                        </button>
                                        
                                        <!-- Botón para transacción de salida (deshabilitado si no hay stock) -->
                                        <button class="btn btn-sm btn-danger" 
                                                onclick="newTransaction(<?= $product['id'] ?>, 'OUT')" 
                                                <?= $product['availableStock'] <= 0 ? 'disabled' : '' ?>
                                                title="<?= $product['availableStock'] <= 0 ? 'No stock available' : 'Remove stock from inventory' ?>">
                                            <svg height="16" width="16" viewBox="0 0 512 512" style="fill:currentColor;">
                                                <polygon points="256.5,448.5 448.5,256.5 336.5,256.5 336.5,64.5 176.5,64.5 176.5,256.5 64.5,256.5" />
                                            </svg>
                                        </button>

                                    </div>
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

<!-- Modal para crear/editar transacción -->
<div class="modal fade" id="transactionModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
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
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="saveTransactionBtn">Save</button>
            </div>
        </div>
    </div>
</div>

<!-- Modal para crear/editar producto -->
<div class="modal fade" id="productModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">            <div class="modal-header">
                <h5 class="modal-title" id="productModalLabel">New Product</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="productForm">
                    <input type="hidden" id="productId">
                    <div class="mb-3">
                        <label for="code" class="form-label">Code</label>
                        <input type="text" class="form-control" id="code" required>
                        <div id="codeError" class="form-text text-danger mt-1"></div>
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
                        <select class="form-select" id="unit" required>
                            <option value="">Select unit...</option>
                            <option value="unit">Unit</option>
                            <option value="pack">Pack</option>
                            <option value="box">Box</option>
                            <option value="kg">Kilogram (kg)</option>
                            <option value="g">Gram (g)</option>
                            <option value="l">Liter (l)</option>
                            <option value="ml">Milliliter (ml)</option>
                            <option value="m">Meter (m)</option>
                            <option value="cm">Centimeter (cm)</option>
                            <option value="pair">Pair</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="categoryId" class="form-label">Category</label>
                        <select class="form-select" id="categoryId" required>
                            <!-- Se llenará con JavaScript -->
                        </select>
                    </div>
                </form>
            </div>            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="saveProductBtn">Save</button>
            </div>
        </div>
    </div>
</div>

<!-- Modal para ver cajas que contienen el producto -->
<div class="modal fade" id="productBoxesModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="productBoxesModalLabel">Product Location</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Box Code</th>
                                <th>Location</th>
                                <th>Current Stock</th>
                                <th>Last Transaction</th>
                            </tr>
                        </thead>
                        <tbody id="productBoxesTableBody">
                            <!-- Se llenará con JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
