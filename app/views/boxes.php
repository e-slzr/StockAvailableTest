<?php
$pageTitle = 'Boxes Management';
require_once 'layout.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Boxes</h2>
    <button type="button" class="btn btn-primary" id="addBoxBtn" title="New Box">
        <svg height="16" width="16" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <polygon points="448,224 288,224 288,64 224,64 224,224 64,224 64,288 224,288 224,448 288,448 288,288 448,288 "/>
        </svg>
        New Box
    </button>
</div>    <!-- Table -->
    <div class="card">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped" id="boxesTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Code</th>
                            <th>Location</th>
                            <th>Total Capacity</th>
                            <th>Last Transaction</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Table content will be loaded dynamically -->
                    </tbody>
                </table>
            </div>
        </div>
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
                        <label for="boxCode" class="form-label">Code</label>
                        <input type="text" class="form-control" id="boxCode" required>
                    </div>
                    <div class="mb-3">
                        <label for="boxLocation" class="form-label">Location</label>
                        <input type="text" class="form-control" id="boxLocation" required>
                    </div>
                    <div class="mb-3">
                        <label for="boxMaxCapacity" class="form-label">Total Capacity</label>
                        <input type="number" class="form-control" id="boxMaxCapacity" min="1" required>
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

<!-- Modal para mensajes -->
<div class="modal fade" id="messageModal" tabindex="-1" aria-labelledby="messageModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="messageModalLabel">Message</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="messageModalBody">
                <!-- El mensaje se insertará aquí -->
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>

<!-- Scripts -->
<script src="public/js/custom/api_helper.js"></script>
<script src="public/js/custom/boxes.js"></script>
