<?php
$pageTitle = 'Boxes Management';
require_once 'layout.php';
?>

<div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Boxes Management</h2>
        <button type="button" class="btn btn-primary" id="addBoxBtn">
            <i class="fas fa-plus"></i> Add New Box
        </button>
    </div>

    <!-- Tabla de cajas -->
    <div class="table-responsive">
        <table class="table table-striped table-hover" id="boxesTable">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>            <tbody>
                <!-- Table content will be loaded dynamically -->
            </tbody>
        </table>
    </div>
</div>

<!-- Modal para agregar/editar caja -->
<div class="modal fade" id="boxModal" tabindex="-1" aria-labelledby="boxModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="boxModalLabel">Box Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>            <div class="modal-body">
                <form id="boxForm">
                    <input type="hidden" id="boxId" value="">
                    <div class="mb-3">
                        <label for="boxName" class="form-label">Name</label>
                        <input type="text" class="form-control" id="boxName" required>
                    </div>
                    <div class="mb-3">
                        <label for="boxDescription" class="form-label">Description</label>
                        <textarea class="form-control" id="boxDescription" rows="3"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="saveBoxBtn">Save</button>
            </div>
        </div>
    </div>
</div>

<!-- Scripts -->
<script src="public/js/custom/boxes.js"></script>
