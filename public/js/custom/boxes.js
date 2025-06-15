document.addEventListener('DOMContentLoaded', function() {
    // Load boxes data when the page loads
    loadBoxes();

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
});

async function loadBoxes() {
    try {
        const data = await getApiData('Box');
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
        row.innerHTML = `
            <td>${box.id}</td>
            <td>${box.name}</td>
            <td>${box.description || ''}</td>
            <td>${box.isActive ? 'Active' : 'Inactive'}</td>
            <td>
                <button class="btn btn-sm btn-primary me-2" onclick="editBox(${box.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm ${box.isActive ? 'btn-danger' : 'btn-success'}" 
                        onclick="toggleBoxStatus(${box.id}, ${box.isActive})">
                    <i class="fas fa-${box.isActive ? 'times' : 'check'}"></i> 
                    ${box.isActive ? 'Deactivate' : 'Activate'}
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function editBox(id) {
    try {
        const box = await getApiData(`Box/${id}`);
        if (box) {
            document.getElementById('boxId').value = box.id;
            document.getElementById('boxName').value = box.name;
            document.getElementById('boxDescription').value = box.description || '';
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
        const boxData = {
            id: boxId ? parseInt(boxId) : 0,
            name: document.getElementById('boxName').value.trim(),
            description: document.getElementById('boxDescription').value.trim(),
            isActive: true
        };

        if (!boxData.name) {
            alert('Please enter a box name');
            return;
        }

        const method = boxData.id === 0 ? 'POST' : 'PUT';
        const url = boxData.id === 0 ? 'Box' : `Box/${boxData.id}`;

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

        const response = await fetch(`${API_URL}Box/${id}/toggle`, {
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
