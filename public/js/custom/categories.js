// Variables para controlar el estado
var isSaving = false;
var isEditing = false;

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Cargar categorías al inicio
        await loadCategories();

        // Inicializar eventos del modal
        const categoryModal = document.getElementById('categoryModal');
        
        // Resetear estado cuando se cierra el modal
        categoryModal.addEventListener('hidden.bs.modal', function() {
            isEditing = false;
        });

        // Configurar evento para nuevo categoría
        document.getElementById('addCategoryBtn').addEventListener('click', function() {
            // Resetear el formulario para nueva categoría
            document.getElementById('categoryForm').reset();
            document.getElementById('categoryId').value = '';
            document.getElementById('categoryModalLabel').textContent = 'Add New Category';
            document.getElementById('categoryForm').classList.remove('was-validated');
            isEditing = false;
            
            // Mostrar el modal
            const modalInstance = bootstrap.Modal.getOrCreateInstance(categoryModal);
            modalInstance.show();
        });

        // Configurar evento para guardar
        document.getElementById('saveCategoryBtn').addEventListener('click', function(e) {
            const button = this;
            if (button.disabled) return;
            
            // Deshabilitar el botón y mostrar estado de carga
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
            
            saveCategory(button);
        });
    } catch (error) {
        console.error('Error during initialization:', error);
        showErrorMessage('Error initializing application. Please refresh the page.');
    }
});

// Función para mostrar mensaje de éxito
function showSuccessMessage(message) {
    const modalHtml = `
        <div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Success</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-success mb-0">
                            ${message}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const existingModal = document.getElementById('successModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Mostrar modal
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();
    
    // Remover modal del DOM cuando se cierre
    document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Función para mostrar mensaje de error
function showErrorMessage(message) {
    const modalHtml = `
        <div class="modal fade" id="errorModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Error</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-danger mb-0">
                            ${message}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const existingModal = document.getElementById('errorModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Mostrar modal
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    errorModal.show();
    
    // Remover modal del DOM cuando se cierre
    document.getElementById('errorModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

async function loadCategories() {
    try {
        const data = await getApiData('Categories');
        if (data) {
            updateCategoriesTable(data);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        showMessage('Error', 'Error loading categories. Please try again.', 'danger');
    }
}

function updateCategoriesTable(categories) {
    const tbody = document.querySelector('#categoriesTable tbody');
    tbody.innerHTML = '';

    if (categories.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">No categories found</td>';
        tbody.appendChild(row);
        return;
    }

    categories.forEach(category => {
        const row = document.createElement('tr');
        
        // Format date if available
        const statusBadge = category.isActive 
            ? '<span class="badge bg-success">Active</span>' 
            : '<span class="badge bg-danger">Inactive</span>';
        
        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.code}</td>
            <td>${category.name}</td>
            <td>${category.description || ''}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-primary" onclick="editCategory(${category.id})" title="Edit Category">
                        <svg height="16" width="16" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                            <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/>
                        </svg>
                    </button>
                    <button class="btn btn-sm ${category.isActive ? 'btn-danger' : 'btn-success'}" 
                            onclick="toggleCategoryStatus(${category.id}, ${category.isActive})" 
                            title="${category.isActive ? 'Deactivate' : 'Activate'} Category">
                        <svg height="16" width="16" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                            ${category.isActive 
                                ? '<path d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z"/>'
                                : '<path d="M461.6,109.6l-54.9-43.3c-1.7-1.4-3.8-2.4-6.2-2.4c-2.4,0-4.6,1-6.3,2.5L194.5,323c0,0-78.5-75.5-80.7-77.7c-2.2-2.2-5.1-5.9-9.5-5.9c-4.4,0-6.4,3.1-8.7,5.4c-1.7,1.8-29.7,31.2-43.5,45.8c-0.8,0.9-1.3,1.4-2,2.1c-1.2,1.7-2,3.6-2,5.7c0,2.2,0.8,4,2,5.7l2.8,2.6c0,0,139.3,133.8,141.6,136.1c2.3,2.3,5.1,5.2,9.2,5.2c4,0,7.3-4.3,9.2-6.2L462,121.8c1.2-1.7,2-3.6,2-5.8C464,113.5,463,111.4,461.6,109.6z"/>'
                            }
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id}, '${category.code}')" title="Delete Category">
                        <svg height="16" width="16" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

async function saveCategory(button) {
    try {
        // Validar el formulario
        const form = document.getElementById('categoryForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            // Restablecer el botón si el formulario no es válido
            if (button) {
                button.disabled = false;
                button.innerHTML = 'Save';
            }
            return;
        }

        if (isSaving) return;
        isSaving = true;

        const categoryId = document.getElementById('categoryId').value;
        const categoryData = {
            id: categoryId ? parseInt(categoryId) : 0,
            code: document.getElementById('categoryCode').value,
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value || ''
        };

        let response;
        if (categoryId) {
            // Update existing category with the complete URL
            response = await updateApiData(`Categories/${categoryId}`, null, categoryData);
        } else {
            // Create new category
            response = await postApiData('Categories', categoryData);
        }

        if (response) {
            // Cerrar el modal
            const modalElement = document.getElementById('categoryModal');
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
            modalInstance.hide();

            // Mostrar mensaje de éxito
            showSuccessMessage(`Category ${categoryId ? 'updated' : 'created'} successfully`);

            // Recargar la tabla
            await loadCategories();
        }
    } catch (error) {
        console.error('Error saving category:', error);
        showErrorMessage('Error saving category. Please try again.');
    } finally {
        isSaving = false;
        if (button) {
            button.disabled = false;
            button.innerHTML = 'Save';
        }
    }
}

async function editCategory(id) {
    try {
        // Marcar que estamos en modo edición
        isEditing = true;
        
        // Obtener datos de la categoría
        const category = await getApiData(`Categories/${id}`);
        
        if (category) {
            // Actualizar título del modal
            document.getElementById('categoryModalLabel').textContent = 'Edit Category';
            
            // Llenar el formulario con los datos
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryCode').value = category.code;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryDescription').value = category.description || '';
            
            // Limpiar estado de validación
            document.getElementById('categoryForm').classList.remove('was-validated');
            
            // Mostrar el modal
            const modalInstance = bootstrap.Modal.getOrCreateInstance(document.getElementById('categoryModal'));
            modalInstance.show();
        }
    } catch (error) {
        console.error('Error loading category:', error);
        showErrorMessage('Error loading category. Please try again.');
    }
}

async function toggleCategoryStatus(id, currentStatus) {
    try {
        const message = `Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this category?`;
        
        // Create modal element
        const modalElement = document.createElement('div');
        modalElement.className = 'modal fade';
        modalElement.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm Action</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary confirm-action">Continue</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalElement);
        
        // Create and show modal
        const confirmModal = new bootstrap.Modal(modalElement);
        
        const result = await new Promise(resolve => {
            modalElement.querySelector('.confirm-action').onclick = () => {
                confirmModal.hide();
                resolve(true);
            };
            modalElement.addEventListener('hidden.bs.modal', () => {
                resolve(false);
                modalElement.remove();
            });
            confirmModal.show();
        });
        
        if (result) {
            // Primero obtenemos los datos actuales de la categoría
            const currentCategory = await getApiData(`Categories/${id}`);
            if (currentCategory) {
                // Actualizamos solo el estado manteniendo el resto de datos
                const updatedCategory = {
                    ...currentCategory,
                    isActive: !currentStatus
                };
                
                const response = await updateApiData(`Categories/${id}`, id, updatedCategory);
                if (response) {
                    const messageModalEl = document.getElementById('messageModal');
                    const messageModal = new bootstrap.Modal(messageModalEl);
                    document.getElementById('messageModalLabel').textContent = 'Success';
                    const messageBody = document.getElementById('messageModalBody');
                    messageBody.className = 'alert alert-success';
                    messageBody.textContent = `Category ${currentStatus ? 'deactivated' : 'activated'} successfully`;
                    messageModal.show();
                    await loadCategories();
                }
            }
        }
    } catch (error) {
        console.error('Error toggling category status:', error);
        const messageModalEl = document.getElementById('messageModal');
        const messageModal = new bootstrap.Modal(messageModalEl);
        document.getElementById('messageModalLabel').textContent = 'Error';
        const messageBody = document.getElementById('messageModalBody');
        messageBody.className = 'alert alert-danger';
        messageBody.textContent = 'Error updating category status. Please try again.';
        messageModal.show();
    }
}

async function deleteCategory(id, code) {
    try {
        const message = `Are you sure you want to delete the category "${code}"?`;
        
        // Create confirm modal element
        const modalElement = document.createElement('div');
        modalElement.className = 'modal fade';
        modalElement.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm Delete</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger confirm-delete">Delete</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalElement);
        
        // Create and show confirm modal
        const confirmModal = new bootstrap.Modal(modalElement);
        
        const result = await new Promise(resolve => {
            modalElement.querySelector('.confirm-delete').onclick = () => {
                confirmModal.hide();
                resolve(true);
            };
            modalElement.addEventListener('hidden.bs.modal', () => {
                resolve(false);
                modalElement.remove();
            });
            confirmModal.show();
        });
        
        if (result) {
            const response = await deleteApiData(`Categories/${id}`);
            if (response) {
                // Create success modal element
                const successModalElement = document.createElement('div');
                successModalElement.className = 'modal fade';
                successModalElement.innerHTML = `
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Success</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                Category deleted successfully
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(successModalElement);
                
                // Show success modal and handle cleanup
                const successModal = new bootstrap.Modal(successModalElement);
                successModalElement.addEventListener('hidden.bs.modal', () => {
                    successModalElement.remove();
                });
                successModal.show();
                
                // Reload categories
                await loadCategories();
            }
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        
        // Create error modal element
        const errorModalElement = document.createElement('div');
        errorModalElement.className = 'modal fade';
        errorModalElement.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Error</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        Error deleting category. Please try again.
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(errorModalElement);
        
        // Show error modal and handle cleanup
        const errorModal = new bootstrap.Modal(errorModalElement);
        errorModalElement.addEventListener('hidden.bs.modal', () => {
            errorModalElement.remove();
        });
        errorModal.show();
    }
}
