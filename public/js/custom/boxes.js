document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load boxes data when the page loads
        await loadBoxes();

        // Initialize modal events
        document.getElementById('addBoxBtn').addEventListener('click', function() {
            document.getElementById('boxId').value = '';
            document.getElementById('boxForm').reset();
            document.getElementById('boxModalLabel').textContent = 'Add New Box';
            new bootstrap.Modal(document.getElementById('boxModal')).show();
        });

        // Handle save button click
        document.getElementById('saveBoxBtn').addEventListener('click', function() {
            saveBox();
        });
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

async function loadBoxes() {
    try {
        const data = await getApiData('Boxes');
        if (data) {
            updateBoxesTable(data);
        }
    } catch (error) {
        console.error('Error loading boxes:', error);
        alert('Error loading boxes. Please try again.');
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
            <td>${formattedDate}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editBox(${box.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteBox(${box.id}, '${box.code}')">Delete</button>
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
            document.getElementById('boxModalLabel').textContent = 'Edit Box';
            new bootstrap.Modal(document.getElementById('boxModal')).show();
        }
    } catch (error) {
        console.error('Error loading box details:', error);
        alert('Error loading box details. Please try again.');
    }
}

async function saveBox() {
    try {
        const boxId = document.getElementById('boxId').value;
        const boxCode = document.getElementById('boxCode').value.trim();
        const boxLocation = document.getElementById('boxLocation').value.trim();

        if (!boxCode) {
            alert('Please enter a box code');
            return;
        }

        if (!boxLocation) {
            alert('Please enter a box location');
            return;
        }

        const boxData = {
            id: boxId ? parseInt(boxId) : 0,
            code: boxCode,
            location: boxLocation,
            lastOperationDate: new Date().toISOString()
        };

        const method = boxData.id === 0 ? 'POST' : 'PUT';        const url = boxData.id === 0 ? 'Boxes' : `Boxes/${boxData.id}`;

        const response = await fetch(`${API_URL}${url}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(boxData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        await response.json();
        bootstrap.Modal.getInstance(document.getElementById('boxModal')).hide();
        await loadBoxes();
        alert(boxData.id === 0 ? 'Box created successfully!' : 'Box updated successfully!');
    } catch (error) {
        console.error('Error saving box:', error);
        alert('Error saving box. Please try again.');
    }
}

async function toggleBoxStatus(id, currentStatus) {
    try {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this box?`)) {
            return;
        }

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
        alert('Box status updated successfully!');
    } catch (error) {
        console.error('Error updating box status:', error);
        alert('Error updating box status. Please try again.');
    }
}

async function deleteBox(id, code) {
    try {
        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Delete Box',
            text: `Are you sure you want to delete box "${code}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) {
            return;
        }

        // Send DELETE request to API
        const response = await fetch(`${API_URL}Boxes/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Refresh the table
        await loadBoxes();
        
        // Show success message
        await Swal.fire(
            'Deleted!',
            'The box has been deleted.',
            'success'
        );
    } catch (error) {
        console.error('Error deleting box:', error);
        await Swal.fire(
            'Error!',
            'Failed to delete the box. Please try again.',
            'error'
        );
    }
}
