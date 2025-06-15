// Variable para controlar si ya se está procesando una solicitud
var isSaving = false;

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load boxes data when the page loads
        await loadBoxes();

        // Initialize modal events
        document.getElementById('addBoxBtn').addEventListener('click', function() {
            document.getElementById('boxId').value = '';
            document.getElementById('boxForm').reset();
            document.getElementById('boxModalLabel').textContent = 'Add New Box';
            // Usar getOrCreateInstance para evitar crear múltiples instancias
            const modalElement = document.getElementById('boxModal');
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
            modalInstance.show();
        });

        // Handle save button click
        document.getElementById('saveBoxBtn').addEventListener('click', function() {
            if (!isSaving) { // Verificar que no haya una solicitud en proceso
                saveBox();
            }
        });
    } catch (error) {        showMessage('Error', 'Error initializing application: ' + error.message, 'danger');
    }
});

async function loadBoxes() {
    try {
        const data = await getApiData('Boxes');
        if (data) {
            updateBoxesTable(data);
        }
    } catch (error) {        showMessage('Error', 'Error loading boxes: ' + error.message, 'danger');
    }
}

function updateBoxesTable(boxes) {
    const tbody = document.querySelector('#boxesTable tbody');
    tbody.innerHTML = '';
    
    boxes.forEach(box => {
        const row = document.createElement('tr');
        const date = new Date(box.lastOperationDate);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          row.innerHTML = `
            <td>${box.id}</td>
            <td>${box.code}</td>
            <td>${box.location}</td>
            <td>${box.totalCapacity || 'N/A'}</td>
            <td>${formattedDate}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editBox(${box.id})" title="Edit Box">
                    <svg height="16" width="16" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                        <g>
                            <path d="M442.8,99.6l-30.4-30.4c-7-6.9-18.2-6.9-25.1,0L355.5,101l55.5,55.5l31.8-31.7C449.7,117.7,449.7,106.5,442.8,99.6z"/>
                            <g>
                                <polygon points="346.1,110.5 174.1,288 160,352 224,337.9 400.6,164.9   "/>
                            </g>
                            <path d="M384,256v150c0,5.1-3.9,10.1-9.2,10.1s-269-0.1-269-0.1c-5.6,0-9.8-5.4-9.8-10s0-268,0-268c0-5,4.7-10,10.6-10H256l32-32   H87.4c-13,0-23.4,10.3-23.4,23.3v305.3c0,12.9,10.5,23.4,23.4,23.4h305.3c12.9,0,23.3-10.5,23.3-23.4V224L384,256z"/>
                        </g>
                    </svg>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteBox(${box.id}, '${box.code}')" title="Delete Box">
                    <svg height="16" width="16" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                        <g>
                            <path d="M413.7,133.4c-2.4-9-4-14-4-14c-2.6-9.3-9.2-9.3-19-10.9l-53.1-6.7c-6.6-1.1-6.6-1.1-9.2-6.8c-8.7-19.6-11.4-31-20.9-31   h-103c-9.5,0-12.1,11.4-20.8,31.1c-2.6,5.6-2.6,5.6-9.2,6.8l-53.2,6.7c-9.7,1.6-16.7,2.5-19.3,11.8c0,0-1.2,4.1-3.7,13   c-3.2,11.9-4.5,10.6,6.5,10.6h302.4C418.2,144.1,417,145.3,413.7,133.4z"/>
                            <path d="M379.4,176H132.6c-16.6,0-17.4,2.2-16.4,14.7l18.7,242.6c1.6,12.3,2.8,14.8,17.5,14.8h207.2c14.7,0,15.9-2.5,17.5-14.8   l18.7-242.6C396.8,178.1,396,176,379.4,176z"/>
                        </g>
                    </svg>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function editBox(id) {
    try {
        const box = await getApiData(`Boxes/${id}`);
        if (box) {
            document.getElementById('boxId').value = box.id;
            document.getElementById('boxCode').value = box.code;
            document.getElementById('boxLocation').value = box.location;
            document.getElementById('boxMaxCapacity').value = box.totalCapacity || '';
            document.getElementById('boxModalLabel').textContent = 'Edit Box';
            // Usar getOrCreateInstance para evitar crear múltiples instancias
            const modalElement = document.getElementById('boxModal');
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
            modalInstance.show();
        }
    } catch (error) {
        console.error('Error loading box details:', error);
        showMessage('Error', 'Error loading box details. Please try again.', 'danger');
    }
}

// Función para mostrar mensajes en un modal
function showMessage(title, message, type = 'info') {
    const messageModal = document.getElementById('messageModal');
    const messageModalLabel = document.getElementById('messageModalLabel');
    const messageModalBody = document.getElementById('messageModalBody');
    
    messageModalLabel.textContent = title;
    messageModalBody.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    
    const modalInstance = bootstrap.Modal.getOrCreateInstance(messageModal);
    modalInstance.show();
}

async function saveBox() {
    try {
        // Establecer la bandera para evitar múltiples envíos
        isSaving = true;
        
        const boxId = document.getElementById('boxId').value;
        const boxCode = document.getElementById('boxCode').value.trim();
        const boxLocation = document.getElementById('boxLocation').value.trim();
        const boxMaxCapacity = document.getElementById('boxMaxCapacity').value.trim();

        // Validaciones
        if (!boxCode) {
            showMessage('Validation Error', 'Please enter a box code', 'danger');
            isSaving = false;
            return;
        }

        if (!boxLocation) {
            showMessage('Validation Error', 'Please enter a box location', 'danger');
            isSaving = false;
            return;
        }
        
        if (!boxMaxCapacity) {
            showMessage('Validation Error', 'Please enter a maximum capacity', 'danger');
            isSaving = false;
            return;
        }

        const boxData = {
            id: boxId ? parseInt(boxId) : 0,
            code: boxCode,
            location: boxLocation,
            totalCapacity: parseInt(boxMaxCapacity),
            lastOperationDate: new Date().toISOString()
        };

        const method = boxData.id === 0 ? 'POST' : 'PUT';
        const url = boxData.id === 0 ? 'Boxes' : `Boxes/${boxData.id}`;

        const response = await fetch(`${API_URL}${url}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(boxData)
        });

        // Procesar la respuesta
        let responseData;
        let responseText;
        
        try {
            // Intentar obtener la respuesta como JSON
            responseText = await response.text();
            try {
                responseData = JSON.parse(responseText);
            } catch (jsonError) {
                // Si no es JSON válido, usar el texto como mensaje de error
                responseData = { message: responseText };
            }
        } catch (textError) {
            // Si falla al obtener el texto, crear un mensaje genérico
            responseData = { message: 'Unknown server error' };
        }
        
        if (!response.ok) {
            // Manejar errores específicos
            if (response.status === 400) {
                if (responseData && responseData.errors) {
                    // Mostrar errores de validación
                    const errorMessages = Object.values(responseData.errors).flat().join('<br>');
                    showMessage('Validation Error', errorMessages, 'danger');
                } else if (responseData && responseData.message) {
                    // Mostrar mensaje de error del servidor
                    showMessage('Error', responseData.message, 'danger');
                } else if (responseText && responseText.includes('Ya existe')) {
                    // Manejar específicamente el error de código duplicado
                    showMessage('Error', 'A box with this code already exists.', 'danger');
                } else {
                    // Otro error
                    showMessage('Error', 'The data is invalid or there was a problem with the request.', 'danger');
                }
            } else {
                throw new Error(`Server error: ${response.status}`);
            }
            isSaving = false;
            return;
        }

        // Éxito
        bootstrap.Modal.getInstance(document.getElementById('boxModal')).hide();
        await loadBoxes();
        showMessage('Success', boxData.id === 0 ? 'Box created successfully!' : 'Box updated successfully!', 'success');
    } catch (error) {        showMessage('Error', 'Error saving box: ' + error.message, 'danger');
    } finally {
        // Siempre restablecer la bandera
        isSaving = false;
    }
}

async function toggleBoxStatus(id, currentStatus) {
    // Crear un modal de confirmación personalizado
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal fade';
    confirmModal.id = 'confirmStatusModal';
    confirmModal.setAttribute('tabindex', '-1');
    confirmModal.setAttribute('aria-labelledby', 'confirmStatusModalLabel');
    confirmModal.setAttribute('aria-hidden', 'true');
    
    const action = currentStatus ? 'deactivate' : 'activate';
    
    confirmModal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="confirmStatusModalLabel">Confirm Status Change</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Are you sure you want to ${action} this box?
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="confirmStatusBtn">Confirm</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    const modal = new bootstrap.Modal(confirmModal);
    modal.show();
    
    // Manejar la confirmación
    document.getElementById('confirmStatusBtn').addEventListener('click', async function() {
        try {
            modal.hide();
            
            const response = await fetch(`${API_URL}Boxes/${id}/toggle`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            await response.json();
            await loadBoxes();
            showMessage('Success', `Box ${action}d successfully!`, 'success');
            
            // Eliminar el modal de confirmación del DOM después de usarlo
            confirmModal.addEventListener('hidden.bs.modal', function() {
                document.body.removeChild(confirmModal);
            });
        } catch (error) {            showMessage('Error', 'Error updating box status: ' + error.message, 'danger');
        }
    });
    
    // Eliminar el modal cuando se cierre sin confirmar
    confirmModal.addEventListener('hidden.bs.modal', function() {
        setTimeout(() => {
            if (document.body.contains(confirmModal)) {
                document.body.removeChild(confirmModal);
            }
        }, 300);
    });
}

async function deleteBox(id, code) {
    // Crear un modal de confirmación personalizado
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal fade';
    confirmModal.id = 'confirmDeleteModal';
    confirmModal.setAttribute('tabindex', '-1');
    confirmModal.setAttribute('aria-labelledby', 'confirmDeleteModalLabel');
    confirmModal.setAttribute('aria-hidden', 'true');
    
    confirmModal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="confirmDeleteModalLabel">Confirm Delete</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Are you sure you want to delete box <strong>${code}</strong>?
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    const modal = new bootstrap.Modal(confirmModal);
    modal.show();
    
    // Manejar la confirmación
    document.getElementById('confirmDeleteBtn').addEventListener('click', async function() {
        try {
            modal.hide();
              const response = await fetch(`${API_URL}Boxes/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.text();
                if (response.status === 400) {
                    throw new Error('This box cannot be deleted because it is currently in use.');
                } else {
                    throw new Error(errorData || 'Error deleting box');
                }
            }

            await loadBoxes();
            showMessage('Success', 'Box deleted successfully!', 'success');
            
            // Eliminar el modal de confirmación del DOM después de usarlo
            confirmModal.addEventListener('hidden.bs.modal', function() {
                document.body.removeChild(confirmModal);
            });
        } catch (error) {
            console.error('Error deleting box:', error);
            showMessage('Error', error.message, 'danger');
        }
    });
    
    // Eliminar el modal cuando se cierre sin confirmar
    confirmModal.addEventListener('hidden.bs.modal', function() {
        setTimeout(() => {
            if (document.body.contains(confirmModal)) {
                document.body.removeChild(confirmModal);
            }
        }, 300);
    });
}
