// Variables globales
let currentProductId = null;

// Variable para controlar si estamos editando o creando
let isEditing = false;

// Variables para transacciones (compartidas con transactions.js)
var preSelectedProductId = null;
var preSelectedTransactionType = null;

// Cuando el DOM esté listo
$(document).ready(function() {
    // Inicializar el modal de productos
    $('#productModal').on('show.bs.modal', function(e) {
        // Solo resetear el formulario si no estamos editando
        if (!isEditing) {
            resetForm();
        }
        
        // Siempre cargar las categorías
        loadCategories();
        
        // Resetear la bandera de edición después de que se muestre el modal
        isEditing = false;
    });

    // Manejar el click del botón de nuevo producto
    $('#newProductBtn').on('click', function(e) {
        e.preventDefault();
        console.log('New Product button clicked');
        // Asegurarse de que no estamos en modo edición
        isEditing = false;
        $('#productModal').modal('show');
    });
    
    // Manejar el click del botón guardar producto
    $('#saveProductBtn').on('click', function() {
        // Prevenir múltiples clics
        const button = this;
        if (button.disabled) return;
        
        // Deshabilitar el botón y cambiar texto
        button.disabled = true;
        $(button).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...');
        
        // Llamar a la función para guardar
        saveProduct(button);
    });
    
    // Configurar eventos para el modal de transacciones
    $('#transactionModal').on('shown.bs.modal', function() {
        // Enfocar el campo de cantidad cuando se muestra el modal
        $('#quantity').focus();
    });
    
    // Configurar botón de guardar transacción
    $('#saveTransactionBtn').on('click', function() {
        // Prevenir múltiples clics
        const button = this;
        if (button.disabled) return;
        
        // Deshabilitar el botón y cambiar texto
        button.disabled = true;
        $(button).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...');
        
        // Llamar a la función para guardar transacción
        saveTransaction(button);
    });
    
    // Configurar evento change para el tipo de transacción
    $('#type').on('change', function() {
        const type = $(this).val();
        const productId = $('#productId').val();
        
        // Si es una transacción de salida y hay un producto seleccionado, filtrar cajas
        if (type === 'OUT' && productId) {
            filterBoxesWithProduct(productId);
        } else {
            // Si es entrada, cargar todas las cajas
            loadBoxesAndProducts();
        }
    });
    
    // Configurar evento change para el producto
    $('#productId').on('change', function() {
        const productId = $(this).val();
        const type = $('#type').val();
        
        // Si es una transacción de salida y hay un producto seleccionado, filtrar cajas
        if (type === 'OUT' && productId) {
            filterBoxesWithProduct(productId);
        }
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
async function saveProduct(button) {
    const $form = $('#productForm');
    const codeInput = document.getElementById('code');
    const codeError = document.getElementById('codeError');
    
    // Validación básica del formulario
    if (!$form[0].checkValidity()) {
        $form[0].reportValidity();
        // Restablecer el botón si el formulario no es válido
        if (button) {
            button.disabled = false;
            $(button).text('Save');
        }
        return;
    }
    
    // Validación adicional para el código (debe tener un formato específico)
    const codeValue = $('#code').val();
    const codeRegex = /^[A-Za-z0-9-]+$/; // Letras, números y guiones
    
    if (!codeRegex.test(codeValue)) {
        codeError.textContent = 'Code must contain only letters, numbers, and hyphens';
        // Restablecer el botón si hay error de validación
        if (button) {
            button.disabled = false;
            $(button).text('Save');
        }
        return;
    } else {
        codeError.textContent = '';
    }

    const data = {
        code: codeValue,
        description: $('#description').val(),
        minimumStock: parseInt($('#minimumStock').val()),
        unit: $('#unit').val(),
        categoryId: parseInt($('#categoryId').val()),
        isActive: true // Por defecto, los nuevos productos están activos
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

        // Obtener la respuesta como texto primero
        let responseText = await response.text();
        let responseData;
        
        // Intentar parsear como JSON
        try {
            responseData = JSON.parse(responseText);
        } catch (jsonError) {
            // Si no es JSON válido, usar el texto como mensaje de error
            responseData = { message: responseText };
        }
        
        if (!response.ok) {
            // Verificar si el mensaje contiene información sobre código duplicado
            if (responseText.includes('Ya existe un producto con el código') || 
                responseText.includes('already exists')) {
                codeError.textContent = 'This product code already exists';
                throw new Error('Duplicate product code');
            } else if (responseData && responseData.message) {
                throw new Error(responseData.message);
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        // Usar los datos ya parseados en lugar de leer la respuesta nuevamente
        const result = responseData;
        
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
        
        // Solo mostrar alerta si no es un error de código duplicado
        if (error.message !== 'Duplicate product code') {
            showAlert('Error', 'Failed to save product: ' + error.message, 'error');
        }
        
        // Restablecer el botón en caso de error
        if (button) {
            button.disabled = false;
            $(button).text('Save');
        }
    }
}

// Editar producto
async function editProduct(id) {
    try {
        // Indicar que estamos en modo edición
        isEditing = true;
        
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

        // Actualizar título del modal primero
        $('#productModal .modal-title').text('Edit Product');
        
        // Establecer el ID del producto actual
        currentProductId = product.id;
        
        // Esperar a que se carguen las categorías
        await loadCategories();
        
        // Limpiar mensajes de error previos
        $('#codeError').text('');
        
        // Llenar el formulario con los datos del producto
        $('#code').val(product.code);
        $('#description').val(product.description);
        $('#minimumStock').val(product.minimumStock);
        $('#unit').val(product.unit);
        $('#categoryId').val(product.categoryId);
        
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
                // Primero necesitamos obtener los datos actuales del producto
                const getResponse = await fetch(`${API_URL}products/${id}`);
                
                if (!getResponse.ok) {
                    throw new Error(`HTTP error! status: ${getResponse.status}`);
                }
                
                const productData = await getResponse.json();
                
                // Actualizar solo el campo isActive
                productData.isActive = newStatus;
                
                // Usar PUT en lugar de PATCH para actualizar el producto
                const response = await fetch(`${API_URL}products/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(productData)
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
    
    // Limpiar mensajes de error
    $('#codeError').text('');
    
    // Asegurarse de que los selects tengan una opción seleccionada por defecto
    $('#unit').val('');
    $('#categoryId').val('');
}

// Función para iniciar una nueva transacción desde la vista de productos
async function newTransaction(productId, transactionType) {
    try {
        // Verificar que el producto exista antes de abrir el modal
        const productResponse = await fetch(`${API_URL}products/${productId}`);
        if (!productResponse.ok) {
            throw new Error(`HTTP error! status: ${productResponse.status}`);
        }
        
        const product = await productResponse.json();
        
        // Configurar el modal de transacción
        const modalTitle = document.getElementById('transactionModalLabel');
        modalTitle.textContent = transactionType === 'IN' ? 'Add Stock' : 'Remove Stock';
        
        // Limpiar el formulario
        document.getElementById('transactionId').value = '';
        document.getElementById('transactionForm').reset();
        document.getElementById('quantityError').textContent = '';
        document.getElementById('boxCapacityInfo').textContent = '';
        
        // Cargar cajas y productos
        await loadBoxesAndProducts();
        
        // Establecer el tipo de transacción
        document.getElementById('type').value = transactionType;
        document.getElementById('type').disabled = true; // Bloquear cambio de tipo
        
        // Establecer el producto
        document.getElementById('productId').value = productId;
        document.getElementById('productId').disabled = true; // Bloquear cambio de producto
        
        // Si es una transacción de salida, filtrar solo las cajas que contienen este producto
        if (transactionType === 'OUT') {
            await filterBoxesWithProduct(productId);
        }
        
        // Mostrar el modal
        const transactionModal = new bootstrap.Modal(document.getElementById('transactionModal'));
        transactionModal.show();
        
    } catch (error) {
        console.error('Error preparing transaction:', error);
        showAlert('Error', 'Failed to prepare transaction: ' + error.message, 'error');
    }
}

// Cargar cajas y productos para el modal de transacciones
async function loadBoxesAndProducts() {
    try {
        // Cargar cajas
        const boxesResponse = await fetch(`${API_URL}boxes`);
        if (!boxesResponse.ok) {
            throw new Error(`HTTP error! status: ${boxesResponse.status}`);
        }
        const boxes = await boxesResponse.json();
        
        // Cargar transacciones para calcular la ocupación actual de las cajas
        const transactionsResponse = await fetch(`${API_URL}transactions`);
        let boxCurrentItems = {};
        
        if (transactionsResponse.ok) {
            const transactions = await transactionsResponse.json();
            
            // Calcular la ocupación actual de cada caja basada en las transacciones
            transactions.forEach(transaction => {
                const boxId = transaction.boxId;
                if (!boxCurrentItems[boxId]) {
                    boxCurrentItems[boxId] = 0;
                }
                
                // Sumar o restar según el tipo de transacción
                if (transaction.type === 'IN') {
                    boxCurrentItems[boxId] += transaction.quantity;
                } else if (transaction.type === 'OUT') {
                    boxCurrentItems[boxId] -= transaction.quantity;
                }
            });
        }
        
        // Agregar la información de ocupación actual a cada caja
        const boxesWithCapacity = boxes.map(box => ({
            ...box,
            currentItems: boxCurrentItems[box.id] || 0
        }));
        
        populateSelect('boxId', boxesWithCapacity, 'code', 'location');

        // Cargar productos
        const productsResponse = await fetch(`${API_URL}products`);
        if (!productsResponse.ok) {
            throw new Error(`HTTP error! status: ${productsResponse.status}`);
        }
        const products = await productsResponse.json();
        
        // Filtrar solo productos activos
        const activeProducts = products.filter(product => product.isActive);
        
        populateSelect('productId', activeProducts, 'code', 'description');
        
        // Configurar evento change para el selector de cajas
        $('#boxId').on('change', function() {
            updateBoxCapacityInfo();
        });
        
    } catch (error) {
        console.error('Error loading boxes and products:', error);
        showAlert('Error', 'Failed to load boxes and products', 'error');
    }
}

// Filtrar cajas que contienen un producto específico
async function filterBoxesWithProduct(productId) {
    try {
        // Obtener todas las transacciones
        const transactionsResponse = await fetch(`${API_URL}transactions`);
        if (!transactionsResponse.ok) {
            throw new Error(`HTTP error! status: ${transactionsResponse.status}`);
        }
        const transactions = await transactionsResponse.json();
        
        // Calcular el inventario actual por caja y producto
        const boxProductInventory = {};
        
        transactions.forEach(transaction => {
            const boxId = transaction.boxId;
            const transactionProductId = transaction.productId;
            
            // Inicializar si no existe
            if (!boxProductInventory[boxId]) {
                boxProductInventory[boxId] = {};
            }
            
            if (!boxProductInventory[boxId][transactionProductId]) {
                boxProductInventory[boxId][transactionProductId] = 0;
            }
            
            // Sumar o restar según el tipo de transacción
            if (transaction.type === 'IN') {
                boxProductInventory[boxId][transactionProductId] += transaction.quantity;
            } else if (transaction.type === 'OUT') {
                boxProductInventory[boxId][transactionProductId] -= transaction.quantity;
            }
        });
        
        // Obtener todas las cajas
        const boxesResponse = await fetch(`${API_URL}boxes`);
        if (!boxesResponse.ok) {
            throw new Error(`HTTP error! status: ${boxesResponse.status}`);
        }
        const allBoxes = await boxesResponse.json();
        
        // Filtrar solo las cajas que tienen el producto seleccionado con cantidad > 0
        const boxesWithProduct = allBoxes.filter(box => {
            const inventory = boxProductInventory[box.id];
            return inventory && inventory[productId] && inventory[productId] > 0;
        });
        
        // Agregar información de inventario a cada caja
        const boxesWithInventory = boxesWithProduct.map(box => ({
            ...box,
            productQuantity: boxProductInventory[box.id][productId] || 0
        }));
        
        // Ordenar cajas por cantidad de producto (mayor a menor)
        boxesWithInventory.sort((a, b) => b.productQuantity - a.productQuantity);
        
        // Actualizar el selector de cajas
        populateSelect('boxId', boxesWithInventory, 'code', 'location', (box) => {
            return `${box.code} - ${box.location} (${box.productQuantity} units available)`;
        });
        
        // Si no hay cajas con este producto, mostrar mensaje
        if (boxesWithInventory.length === 0) {
            $('#boxCapacityInfo').html('<div class="alert alert-warning mt-2">No boxes contain this product. Please add stock first.</div>');
            $('#saveTransactionBtn').prop('disabled', true);
        } else {
            $('#saveTransactionBtn').prop('disabled', false);
        }
        
    } catch (error) {
        console.error('Error filtering boxes with product:', error);
        showAlert('Error', 'Failed to load boxes with product', 'error');
    }
}

// Poblar selects para el modal de transacciones
function populateSelect(selectId, data, valueField, textField, formatFunction = null) {
    const $select = $(`#${selectId}`);
    $select.empty().append('<option value="">Select...</option>');
    
    data.forEach(item => {
        // Si estamos poblando el select de cajas, verificamos si está llena
        if (selectId === 'boxId') {
            // Calculamos la capacidad disponible (si no hay currentItems, asumimos 0)
            const currentItems = item.currentItems || 0;
            const availableCapacity = item.totalCapacity - currentItems;
            const isFull = availableCapacity <= 0;
            
            // Usar el formato personalizado si se proporciona, o el formato predeterminado
            const optionText = formatFunction ? 
                formatFunction(item) : 
                `${item[valueField]} - ${item[textField]}`;
            
            const $option = $('<option>', {
                value: item.id,
                text: optionText,
                'data-available': availableCapacity,
                'data-total': item.totalCapacity,
                'data-current': currentItems
            });
            
            // Si la caja está llena, la marcamos en rojo
            if (isFull) {
                $option.css('color', 'red');
            }
            
            $select.append($option);
        } else {
            // Para otros selects, comportamiento normal
            // Usar el formato personalizado si se proporciona, o el formato predeterminado
            const optionText = formatFunction ? 
                formatFunction(item) : 
                `${item[valueField]} - ${item[textField]}`;
                
            $select.append($('<option>', {
                value: item.id,
                text: optionText
            }));
        }
    });
    
    // Actualizar la información de capacidad si es el selector de cajas
    if (selectId === 'boxId') {
        updateBoxCapacityInfo();
    }
}

// Actualizar información de capacidad de la caja seleccionada
function updateBoxCapacityInfo() {
    const $select = $('#boxId');
    const selectedOption = $select.find('option:selected');
    const boxCapacityInfo = document.getElementById('boxCapacityInfo');
    
    if (selectedOption.val() === '') {
        boxCapacityInfo.innerHTML = '';
        return;
    }
    
    const available = selectedOption.data('available');
    const total = selectedOption.data('total');
    const current = selectedOption.data('current');
    
    if (available <= 0) {
        boxCapacityInfo.innerHTML = `<span class="text-danger"><strong>Box is full!</strong> Capacity: ${current}/${total}</span>`;
    } else if (available < total * 0.2) { // Less than 20% available
        boxCapacityInfo.innerHTML = `<span class="text-warning"><strong>Box almost full:</strong> ${current}/${total} (${available} available)</span>`;
    } else {
        boxCapacityInfo.innerHTML = `<span class="text-success">Available capacity: ${current}/${total} (${available} available)</span>`;
    }
}

// Guardar transacción
async function saveTransaction(button) {
    // Validar el formulario
    const form = document.getElementById('transactionForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Obtener valores
    const boxId = document.getElementById('boxId').value;
    const productId = document.getElementById('productId').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const type = document.getElementById('type').value;
    
    // Validar que se haya seleccionado una caja y un producto
    if (!boxId || !productId) {
        showAlert('Error', 'Please select both a box and a product', 'error');
        return;
    }
    
    try {
        // Para transacciones de salida, verificar que haya suficiente stock
        if (type === 'OUT') {
            // Obtener el stock actual del producto en la caja seleccionada
            const transactionsResponse = await fetch(`${API_URL}transactions`);
            if (!transactionsResponse.ok) {
                throw new Error(`HTTP error! status: ${transactionsResponse.status}`);
            }
            
            const transactions = await transactionsResponse.json();
            
            // Calcular el stock actual del producto en la caja seleccionada
            let currentStock = 0;
            transactions.forEach(transaction => {
                if (transaction.boxId === parseInt(boxId) && transaction.productId === parseInt(productId)) {
                    if (transaction.type === 'IN') {
                        currentStock += transaction.quantity;
                    } else if (transaction.type === 'OUT') {
                        currentStock -= transaction.quantity;
                    }
                }
            });
            
            // Verificar si hay suficiente stock
            if (currentStock < quantity) {
                document.getElementById('quantityError').textContent = `Not enough stock. Available: ${currentStock}`;
                if (button) {
                    button.disabled = false;
                    button.innerHTML = 'Save';
                }
                return;
            }
        }
        
        // Crear objeto de transacción
        const transactionData = {
            boxId: parseInt(boxId),
            productId: parseInt(productId),
            quantity: quantity,
            type: type,
            transactionDate: new Date().toISOString()
        };
        
        // Enviar la transacción
        const response = await fetch(`${API_URL}transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Cerrar modal y mostrar mensaje de éxito
        const transactionModal = bootstrap.Modal.getInstance(document.getElementById('transactionModal'));
        transactionModal.hide();
        
        showAlert('Success', 'Transaction saved successfully', 'success');
        
        // Recargar la página para mostrar los cambios
        setTimeout(() => location.reload(), 1500);
        
    } catch (error) {
        console.error('Error saving transaction:', error);
        showAlert('Error', 'Failed to save transaction: ' + error.message, 'error');
        
        // Restablecer el botón
        if (button) {
            button.disabled = false;
            button.innerHTML = 'Save';
        }
    }
}

// Función para ver las cajas que contienen un producto
async function viewProductBoxes(productId, productCode) {
    try {
        // Obtener la información de ubicaciones del producto
        const response = await getApiData(`products/${productId}/locations`);
        
        if (response.isSuccess && response.data) {
            // Actualizar el título del modal con el código y descripción del producto
            document.getElementById('productBoxesModalLabel').textContent = 
                `Product Location: ${response.data.productCode} - ${response.data.description}`;
            
            // Obtener la tabla donde mostraremos los datos
            const tbody = document.getElementById('productBoxesTableBody');
            tbody.innerHTML = '';
            
            if (response.data.boxes && response.data.boxes.length > 0) {
                response.data.boxes.forEach(box => {
                    const row = document.createElement('tr');
                    // Formatear la fecha a local
                    const lastTransaction = new Date(box.lastTransactionDate).toLocaleString();
                    
                    row.innerHTML = `
                        <td>${box.boxCode}</td>
                        <td>${box.location || 'No location specified'}</td>
                        <td>${box.currentStock}</td>
                        <td>${lastTransaction}</td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                // Si no hay cajas, mostrar mensaje
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="5" class="text-center">No boxes found containing this product</td>';
                tbody.appendChild(row);
            }
            
            // Mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById('productBoxesModal'));
            modal.show();
        } else {
            throw new Error(response.error || 'Failed to load product locations');
        }
    } catch (error) {
        console.error('Error loading product boxes:', error);
        // Crear y mostrar modal de error
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
                        <div class="alert alert-danger mb-0">
                            Error loading product boxes. Please try again.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(errorModalElement);
        
        const errorModal = new bootstrap.Modal(errorModalElement);
        errorModalElement.addEventListener('hidden.bs.modal', () => {
            errorModalElement.remove();
        });
        errorModal.show();
    }
}
