// Load employees from localStorage
let employees = JSON.parse(localStorage.getItem('employees')) || [];
let editingEmployeeId = null;

const addEmployeeBtn = document.getElementById('addEmployeeBtn');
const formContainer = document.getElementById('formContainer');
const employeeForm = document.getElementById('employeeForm');
const cancelBtn = document.getElementById('cancelBtn');
const tableContainer = document.getElementById('tableContainer');
const employeeCount = document.getElementById('employeeCount');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const searchInput = document.getElementById('searchInput');

// Function to save to localStorage
function saveToLocalStorage() {
  localStorage.setItem('employees', JSON.stringify(employees));
}

// Function to render employee table
function renderTable(filter = '') {
  let filtered = employees.filter(emp =>
    emp.name.toLowerCase().includes(filter.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(filter.toLowerCase()) ||
    emp.email.toLowerCase().includes(filter.toLowerCase())
  );

  employeeCount.textContent = filtered.length;

  if (filtered.length === 0) {
    tableContainer.innerHTML = "<p>No employees found.</p>";
    return;
  }

  let tableHTML = `
    <table id="employeeTable">
      <thead>
        <tr>
          <th>Emp ID</th>
          <th>Employer ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Position</th>
          <th>Department</th>
          <th>Salary (₹)</th>
          <th>Phone</th>
          <th>Join Date</th>
          <th>Aadhar</th>
          <th>Bank Account</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(emp => `
          <tr>
            <td>${emp.employeeId}</td>
            <td>${emp.employerId}</td>
            <td>${emp.name}</td>
            <td>${emp.email}</td>
            <td>${emp.position}</td>
            <td>${emp.department}</td>
            <td>₹${emp.salary}</td>
            <td>${emp.phone}</td>
            <td>${emp.joinDate}</td>
            <td>${emp.aadharNumber}</td>
            <td>${emp.bankAccountNumber}</td>
            <td>
              <button class="action-btn edit-btn" onclick="editEmployee('${emp.id}')">Edit</button>
              <button class="action-btn delete-btn" onclick="deleteEmployee('${emp.id}')">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  tableContainer.innerHTML = tableHTML;
}

// Add Employee button
addEmployeeBtn.addEventListener('click', () => {
  formContainer.style.display = 'block';
  formTitle.textContent = 'Add New Employee';
  submitBtn.textContent = 'Add Employee';
  employeeForm.reset();
  editingEmployeeId = null;
});

// Cancel button
cancelBtn.addEventListener('click', () => {
  formContainer.style.display = 'none';
  employeeForm.reset();
  editingEmployeeId = null;
});

// Form submit (Add or Update)
employeeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(employeeForm);
  const employeeData = Object.fromEntries(formData.entries());

  // ✅ Check if Employee ID or Email already exists
  const duplicate = employees.some(emp =>
    (emp.employeeId === employeeData.employeeId || emp.email === employeeData.email) &&
    emp.id !== editingEmployeeId
  );

  if (duplicate) {
    alert("Employee with the same Employee ID or Email already exists!");
    return;
  }

  // Add new employee
  if (!editingEmployeeId) {
    employeeData.id = Date.now().toString();
    employees.push(employeeData);
  } else {
    employees = employees.map(emp =>
      emp.id === editingEmployeeId ? { ...employeeData, id: editingEmployeeId } : emp
    );
  }

  saveToLocalStorage();
  renderTable();
  formContainer.style.display = 'none';
});

// Edit employee
window.editEmployee = function (id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  formContainer.style.display = 'block';
  formTitle.textContent = 'Edit Employee';
  submitBtn.textContent = 'Update Employee';
  editingEmployeeId = id;

  for (let key in emp) {
    if (employeeForm.elements[key]) {
      employeeForm.elements[key].value = emp[key];
    }
  }
};

// Delete employee
window.deleteEmployee = function (id) {
  if (confirm('Are you sure you want to delete this employee?')) {
    employees = employees.filter(emp => emp.id !== id);
    saveToLocalStorage();
    renderTable();
  }
};

// Search employees
searchInput.addEventListener('input', (e) => {
  renderTable(e.target.value);
});

// Initial render
renderTable();



