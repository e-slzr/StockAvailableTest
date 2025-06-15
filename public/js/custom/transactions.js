// Variables globales
// Nota: Estas variables ya están declaradas en products.js cuando se usa en esa página
// Verificamos si ya existen antes de declararlas
if (typeof preSelectedProductId === 'undefined') {
    var preSelectedProductId = null;
}
if (typeof preSelectedTransactionType === 'undefined') {
    var preSelectedTransactionType = null;
}

// Cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay parámetros en la URL (redireccionamiento desde productos)
    const urlParams = new URLSearchParams(window.location.search);
    preSelectedProductId = urlParams.get('productId');
    preSelectedTransactionType = urlParams.get('transactionType');
    
    // Si hay parámetros, abrir automáticamente el modal
    if (preSelectedProductId && preSelectedTransactionType) {
        // Esperar un momento para que la página se cargue completamente
        setTimeout(() => {
            const modalInstance = bootstrap.Modal.getOrCreateInstance(document.getElementById('transactionModal'));
            modalInstance.show();
        }, 300);
    }
     
    // Inicializar el modal 
    const transactionModal = document.getElementById('transactionModal');
    transactionModal.addEventListener('show.bs.modal', async function() {
        await loadBoxesAndProducts();
        
        // Si tenemos parámetros preseleccionados, configurar el modal
        if (preSelectedProductId && preSelectedTransactionType) {
            // Establecer el tipo de transacción
            document.getElementById('type').value = preSelectedTransactionType;
            document.getElementById('type').disabled = true; // Bloquear cambio de tipo
            
            // Establecer el producto
            document.getElementById('productId').value = preSelectedProductId;
            document.getElementById('productId').disabled = true; // Bloquear cambio de producto
            
            // Actualizar el título del modal según el tipo de transacción
            const modalTitle = document.getElementById('transactionModalLabel');
            modalTitle.textContent = preSelectedTransactionType === 'IN' ? 'Add Stock' : 'Remove Stock';
            
            // Si es una transacción de salida, filtrar solo las cajas que contienen este producto
            if (preSelectedTransactionType === 'OUT') {
                await filterBoxesWithProduct(preSelectedProductId);
            }
        } else {
            resetForm();
        }
    });

    // Manejar el click del botón guardar
    document.getElementById('saveTransactionBtn').addEventListener('click', function(event) {
        // Prevenir múltiples clics
        const button = this;
        if (button.disabled) return;
        
        // Deshabilitar el botón y cambiar texto
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
        
        // Llamar a la función para guardar
        saveTransaction(button);
    });

    // Manejar el click del botón nueva transacción
    const newTransactionButton = document.getElementById('newTransactionBtn');
    if (newTransactionButton) { // Verificar que el botón exista en la página actual
        newTransactionButton.addEventListener('click', function() {
            // Limpiar las variables preseleccionadas
            preSelectedProductId = null;
            preSelectedTransactionType = null;
            
            // Resetear el formulario
            resetForm();
            
            // Habilitar todos los campos
            document.getElementById('type').disabled = false;
            document.getElementById('productId').disabled = false;
            
            // Restaurar el título del modal
            document.getElementById('transactionModalLabel').textContent = 'New Transaction';
            
            // Mostrar el modal
            const modalInstance = bootstrap.Modal.getOrCreateInstance(document.getElementById('transactionModal'));
            modalInstance.show();
        });
    }
    
    // Manejar cambio en el tipo de transacción
    document.getElementById('type').addEventListener('change', async function() {
        const productId = document.getElementById('productId').value;
        if (this.value === 'OUT' && productId) {
            // Si es una transacción de salida y hay un producto seleccionado, filtrar cajas
            await filterBoxesWithProduct(productId);
        } else {
            // Si es entrada, mostrar todas las cajas
            await loadBoxesAndProducts();
        }
    });
    
    // Manejar cambio en el producto seleccionado
    document.getElementById('productId').addEventListener('change', async function() {
        const transactionType = document.getElementById('type').value;
        if (transactionType === 'OUT' && this.value) {
            // Si es una transacción de salida y hay un producto seleccionado, filtrar cajas
            await filterBoxesWithProduct(this.value);
        }
    });
});

// Cargar cajas y productos
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
    } catch (error) {
        showAlert('Error', 'Failed to load boxes and products', 'error');
    }
}

// Poblar selects
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

// Nota: El evento change para #boxId ya se configura en el document ready
// No es necesario registrarlo aquí nuevamente

// Guardar transacción
async function saveTransaction(button) {
    // Validar el formulario
    const form = document.getElementById('transactionForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Validar la capacidad disponible
    const boxId = document.getElementById('boxId').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const type = document.getElementById('type').value;
    const quantityError = document.getElementById('quantityError');
    
    // Solo validar la capacidad si es una transacción de entrada (IN)
    if (type === 'IN') {
        const selectedOption = $("#boxId option:selected");
        const available = selectedOption.data('available');
        
        if (quantity > available) {
            quantityError.textContent = `The quantity exceeds the available capacity`;
            // Restablecer el botón cuando hay un error de validación
            button.disabled = false;
            button.innerHTML = 'Save';
            return;
        } else {
            // Limpiar mensaje de error si es válido
            quantityError.textContent = '';
        }
    } else {
        // Limpiar mensaje de error para transacciones OUT
        quantityError.textContent = '';
    }
    
    // Deshabilitar el botón para evitar múltiples envíos
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
    
    try {
        // Obtener los valores del formulario
        const productId = document.getElementById('productId').value;
        
        // Crear el objeto de datos
        const transactionData = {
            boxId: parseInt(boxId),
            productId: parseInt(productId),
            quantity: quantity,
            type: type,
            transactionDate: new Date().toISOString()
        };
        
        // Enviar los datos a la API
        const response = await fetch(`${API_URL}transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        // Cerrar el modal y actualizar la tabla
        bootstrap.Modal.getInstance(document.getElementById('transactionModal')).hide();
        window.location.reload(); // Recargar la página para mostrar la nueva transacción
    } catch (error) {
        console.error('Error saving transaction:', error);
        
        // Mostrar mensaje de error específico si viene de la API
        if (error.message.includes('capacity')) {
            quantityError.textContent = error.message;
        } else {
            showAlert('Error', 'Failed to save transaction', 'error');
        }
    }
}

// La función editTransaction ha sido eliminada ya que las transacciones no deben modificarse

// La función para eliminar transacciones ha sido eliminada ya que las transacciones no se pueden eliminar



// Resetear formulario
function resetForm() {
    $('#transactionId').val('');
    $('#transactionForm')[0].reset();
    $('#quantityError').text('');
    $('#boxCapacityInfo').text('');
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
