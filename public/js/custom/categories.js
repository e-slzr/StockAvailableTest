// Variables para controlar el estado
let isSaving = false;
let isEditing = false;
let currentCategory = null; // Variable para mantener los datos actuales de la categoría

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Cargar categorías al inicio
        await loadCategories();

        // Inicializar eventos del modal
        const categoryModal = document.getElementById('categoryModal');
        if (!categoryModal) {
            throw new Error('Category modal not found');
        }

        // Resetear estado cuando se cierra el modal
        categoryModal.addEventListener('hidden.bs.modal', function() {
            isEditing = false;
            currentCategory = null; // Limpiar la categoría actual
        });

        // Configurar evento para nueva categoría
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (!addCategoryBtn) {
            throw new Error('Add category button not found');
        }

        addCategoryBtn.addEventListener('click', function() {
            // Resetear el formulario para nueva categoría
            const form = document.getElementById('categoryForm');
            if (!form) {                showMessage('Error', 'Category form not found. Please refresh the page.', 'danger');
                return;
            }

            form.reset();
            document.getElementById('categoryId').value = '';
            document.getElementById('categoryModalLabel').textContent = 'Add New Category';
            form.classList.remove('was-validated');
            isEditing = false;
            currentCategory = null;
            
            // Mostrar el modal
            const modalInstance = bootstrap.Modal.getOrCreateInstance(categoryModal);
            modalInstance.show();
        });

        // Configurar evento para guardar
        const saveCategoryBtn = document.getElementById('saveCategoryBtn');
        if (!saveCategoryBtn) {
            throw new Error('Save button not found');
        }

        saveCategoryBtn.addEventListener('click', saveCategory);    } catch (error) {        showMessage('Error', 'Error initializing application: ' + error.message, 'danger');
    }
});

async function loadCategories() {
    try {
        const data = await getApiData('Categories');
        if (data) {
            updateCategoriesTable(data);
        }
    } catch (error) {        showMessage('Error', 'Error loading categories: ' + error.message, 'danger');
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

async function saveCategory(e) {
    try {
        if (e) {
            e.preventDefault();
        }

        // Validar el formulario
        const form = document.getElementById('categoryForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        if (isSaving) return;
        isSaving = true;

        const button = document.getElementById('saveCategoryBtn');
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';        const categoryId = document.getElementById('categoryId').value;
        const categoryData = {
            code: document.getElementById('categoryCode').value,
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value || '',
            isActive: categoryId && currentCategory ? currentCategory.isActive : true // Mantener el estado actual o true para nuevas categorías
        };

        let response;
        if (categoryId) {
            response = await updateApiData(`Categories/${categoryId}`, null, categoryData);
        } else {
            response = await postApiData('Categories', categoryData);
        }

        if (response) {
            // Cerrar el modal
            const modalInstance = bootstrap.Modal.getOrCreateInstance(document.getElementById('categoryModal'));
            modalInstance.hide();

            // Mostrar mensaje de éxito
            showMessage('Success', `Category ${categoryId ? 'updated' : 'created'} successfully`, 'success');

            // Recargar la tabla
            await loadCategories();
        }
    } catch (error) {        showMessage('Error', 'Error saving category: ' + error.message, 'danger');
    } finally {
        isSaving = false;
        const button = document.getElementById('saveCategoryBtn');
        button.disabled = false;
        button.innerHTML = 'Save';
    }
}

async function editCategory(id) {
    try {
        isEditing = true;
        const category = await getApiData(`Categories/${id}`);
          if (category) {
            // Guardar la categoría actual
            currentCategory = category;
            
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
    } catch (error) {        showMessage('Error', 'Error loading category: ' + error.message, 'danger');
    }
}

async function toggleCategoryStatus(id, isActive) {
    try {
        const message = `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this category?`;
        
        const modalHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm Action</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${message}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary confirm-action">Continue</button>
                    </div>
                </div>
            </div>
        `;

        const confirmed = await showConfirmDialog(modalHTML);
        
        if (confirmed) {
            const category = await getApiData(`Categories/${id}`);
            if (category) {
                category.isActive = !isActive;
                const response = await updateApiData(`Categories/${id}`, null, category);
                
                if (response) {
                    showMessage('Success', `Category ${isActive ? 'deactivated' : 'activated'} successfully`, 'success');
                    await loadCategories();
                }
            }
        }
    } catch (error) {        showMessage('Error', 'Error updating category status: ' + error.message, 'danger');
    }
}

async function deleteCategory(id, code) {
    try {
        const modalHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm Delete</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        Are you sure you want to delete category "${code}"?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger confirm-action">Delete</button>
                    </div>
                </div>
            </div>
        `;

        const confirmed = await showConfirmDialog(modalHTML);
        
        if (confirmed) {
            const response = await deleteApiData(`Categories/${id}`);
            if (response) {
                showMessage('Success', 'Category deleted successfully', 'success');
                await loadCategories();
            }
        }
    } catch (error) {        showMessage('Error', 'Error deleting category: ' + error.message, 'danger');
    }
}

function showMessage(title, message, type = 'success') {
    const modalElement = document.getElementById('messageModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    
    document.getElementById('messageModalLabel').textContent = title;
    const messageBody = document.getElementById('messageModalBody');
    messageBody.className = `alert alert-${type} mb-0`;
    messageBody.textContent = message;
    
    modal.show();
}

async function showConfirmDialog(modalHTML) {
    return new Promise(resolve => {
        const modalElement = document.createElement('div');
        modalElement.className = 'modal fade';
        modalElement.innerHTML = modalHTML;
        document.body.appendChild(modalElement);
        
        const modal = new bootstrap.Modal(modalElement);
        
        modalElement.querySelector('.confirm-action').onclick = () => {
            modal.hide();
            resolve(true);
        };
        
        modalElement.addEventListener('hidden.bs.modal', () => {
            resolve(false);
            modalElement.remove();
        });
        
        modal.show();
    });
}
