// Variables globales
let currentProductId = null;

// Cuando el DOM esté listo
$(document).ready(function() {
    // Inicializar el modal
    $('#productModal').on('show.bs.modal', function() {
        loadCategories();
        resetForm();
    });

    // Manejar el click del botón de nuevo producto
    $('#newProductBtn').on('click', function(e) {
        e.preventDefault();
        console.log('New Product button clicked');
        $('#productModal').modal('show');
    });
});

// Cargar categorías
async function loadCategories() {
    try {
        console.log('Loading categories from:', API_URL);
        const response = await fetch(`${API_URL}categories`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const categories = await response.json();
        console.log('Categories data:', categories);

        const $select = $('#categoryId');
        $select.empty().append('<option value="">Select category...</option>');
        
        categories.forEach(category => {
            if (category.isActive) {
                $select.append(
                    $('<option>', {
                        value: category.id,
                        text: `${category.code} - ${category.name}`
                    })
                );
            }
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        showAlert('Error', 'Failed to load categories: ' + error.message, 'error');
    }
}

// Guardar producto
async function saveProduct() {
    const $form = $('#productForm');
    
    if (!$form[0].checkValidity()) {
        $form[0].reportValidity();
        return;
    }

    const data = {
        code: $('#code').val(),
        description: $('#description').val(),
        minimumStock: parseInt($('#minimumStock').val()),
        unit: $('#unit').val(),
        categoryId: parseInt($('#categoryId').val())
    };

    if (currentProductId) {
        data.id = currentProductId;
    }

    try {
        const url = currentProductId 
            ? `${API_URL}products/${currentProductId}`
            : `${API_URL}products`;
            
        const method = currentProductId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Cerrar modal y mostrar mensaje
        $('#productModal').modal('hide');
        
        showAlert(
            'Success', 
            `Product ${currentProductId ? 'updated' : 'created'} successfully`, 
            'success'
        );
        
        // Recargar la página para mostrar los cambios
        setTimeout(() => location.reload(), 1500);

    } catch (error) {
        console.error('Error saving product:', error);
        showAlert('Error', 'Failed to save product: ' + error.message, 'error');
    }
}

// Editar producto
async function editProduct(id) {
    try {
        console.log('Fetching product:', `${API_URL}products/${id}`);
        const response = await fetch(`${API_URL}products/${id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const product = await response.json();
        console.log('Product data:', product);

        if (!product) {
            throw new Error('Product data is empty');
        }

        currentProductId = product.id;
        
        // Esperar a que se carguen las categorías
        await loadCategories();
        
        // Llenar el formulario
        $('#code').val(product.code);
        $('#description').val(product.description);
        $('#minimumStock').val(product.minimumStock);
        $('#unit').val(product.unit);
        $('#categoryId').val(product.categoryId);

        // Actualizar título del modal
        $('#productModal .modal-title').text('Edit Product');
        
        // Mostrar modal
        $('#productModal').modal('show');
    } catch (error) {
        console.error('Error loading product:', error);
        showAlert('Error', 'Failed to load product details: ' + error.message, 'error');
    }
}

// Cambiar estado del producto
async function toggleProductStatus(id, newStatus) {
    const action = newStatus ? 'activate' : 'deactivate';
    const confirmMessage = `Are you sure you want to ${action} this product?`;

    confirmAction(
        `${action.charAt(0).toUpperCase() + action.slice(1)} Product`,
        confirmMessage,
        async () => {
            try {
                const response = await fetch(`${API_URL}products/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ isActive: newStatus })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                showAlert('Success', `Product ${action}d successfully`, 'success');
                setTimeout(() => location.reload(), 1500);
            } catch (error) {
                console.error('Error updating product status:', error);
                showAlert('Error', `Failed to ${action} product: ` + error.message, 'error');
            }
        }
    );
}

// Resetear formulario
function resetForm() {
    currentProductId = null;
    $('#productForm')[0].reset();
    $('#productModal .modal-title').text('New Product');
}
