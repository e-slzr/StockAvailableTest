// Variables globales
let currentTransactionId = null;

// Cuando el DOM esté listo
$(document).ready(function() {
    // Inicializar el modal
    $('#transactionModal').on('show.bs.modal', function() {
        loadBoxesAndProducts();
        resetForm();
    });    // Manejar el click del botón de nueva transacción
    $('#newTransactionBtn').on('click', function(e) {
        e.preventDefault();
        console.log('New Transaction button clicked');
        $('#transactionModal').modal('show');
    });
});

// Cargar cajas y productos
async function loadBoxesAndProducts() {
    try {
        console.log('Loading boxes and products from:', API_URL);
        
        // Cargar cajas
        const boxesResponse = await fetch(`${API_URL}boxes`);
        if (!boxesResponse.ok) {
            throw new Error(`HTTP error! status: ${boxesResponse.status}`);
        }
        const boxes = await boxesResponse.json();
        console.log('Boxes data:', boxes);
        populateSelect('boxId', boxes, 'code', 'location');

        // Cargar productos
        const productsResponse = await fetch(`${API_URL}products`);
        if (!productsResponse.ok) {
            throw new Error(`HTTP error! status: ${productsResponse.status}`);
        }
        const products = await productsResponse.json();
        console.log('Products data:', products);
        populateSelect('productId', products, 'code', 'description');
    } catch (error) {
        showAlert('Error', 'Failed to load boxes and products', 'error');
    }
}

// Poblar selects
function populateSelect(selectId, data, valueField, textField) {
    const $select = $(`#${selectId}`);
    $select.empty().append('<option value="">Select...</option>');
    
    data.forEach(item => {
        $select.append(
            $('<option>', {
                value: item.id,
                text: `${item[valueField]} - ${item[textField]}`
            })
        );
    });
}

// Guardar transacción
async function saveTransaction() {
    const $form = $('#transactionForm');
    
    if (!$form[0].checkValidity()) {
        $form[0].reportValidity();
        return;
    }

    const data = {
        boxId: parseInt($('#boxId').val()),
        productId: parseInt($('#productId').val()),
        quantity: parseInt($('#quantity').val()),
        type: $('#type').val()
    };

    try {
        const url = currentTransactionId 
            ? `${API_URL}/transactions/${currentTransactionId}`
            : `${API_URL}/transactions`;
            
        const method = currentTransactionId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        
        // Cerrar modal y mostrar mensaje
        const modal = bootstrap.Modal.getInstance(document.getElementById('transactionModal'));
        modal.hide();
        
        showAlert(
            'Success', 
            `Transaction ${currentTransactionId ? 'updated' : 'created'} successfully`, 
            'success'
        );
        
        // Recargar la página para mostrar los cambios
        setTimeout(() => location.reload(), 1500);

    } catch (error) {
        showAlert('Error', 'Failed to save transaction', 'error');
    }
}

// Editar transacción
async function editTransaction(id) {
    try {
        console.log('Fetching transaction:', `${API_URL}transactions/${id}`);
        const response = await fetch(`${API_URL}transactions/${id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const transaction = await response.json();
        console.log('Transaction data:', transaction);

        if (!transaction) {
            throw new Error('Transaction data is empty');
        }

        currentTransactionId = transaction.id;
        
        // Esperar a que se carguen las cajas y productos
        await loadBoxesAndProducts();
        
        // Llenar el formulario
        document.getElementById('boxId').value = transaction.boxId;
        document.getElementById('productId').value = transaction.productId;
        document.getElementById('quantity').value = transaction.quantity;
        document.getElementById('type').value = transaction.type;

        // Actualizar título del modal
        document.querySelector('#transactionModal .modal-title').textContent = 'Edit Transaction';
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
        modal.show();
    } catch (error) {
        showAlert('Error', 'Failed to load transaction details', 'error');
    }
}

// Eliminar transacción
function deleteTransaction(id) {
    // Usar la función de confirmación del main.js
    confirmAction(
        'Delete Transaction',
        'Are you sure you want to delete this transaction?',
        async () => {
            try {
                const response = await fetch(`${API_URL}/transactions/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                showAlert('Success', 'Transaction deleted successfully', 'success');
                setTimeout(() => location.reload(), 1500);
            } catch (error) {
                showAlert('Error', 'Failed to delete transaction', 'error');
            }
        }
    );
}

// Resetear formulario
function resetForm() {
    currentTransactionId = null;
    $('#transactionForm')[0].reset();
    $('#transactionModal .modal-title').text('New Transaction');
}
