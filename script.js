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
const exportBtn = document.getElementById('exportBtn');

// Render table with optional search filter
function renderTable(filter = '') {
  let filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(filter.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(filter.toLowerCase()) ||
    emp.employerId.toLowerCase().includes(filter.toLowerCase()) ||
    (emp.aadharNumber && emp.aadharNumber.includes(filter)) ||
    (emp.bankAccountNumber && emp.bankAccountNumber.includes(filter)) ||
    (emp.phone && emp.phone.includes(filter)) ||
    (emp.email && emp.email.toLowerCase().includes(filter.toLowerCase()))
  );

  employeeCount.textContent = filteredEmployees.length;

  if (filteredEmployees.length === 0) {
    tableContainer.innerHTML = '<p>No employees found.</p>';
    return;
  }

  let tableHTML = `
    <table id="employeeTable">
      <thead>
        <tr>
          <th>Employee ID</th>
          <th>Employer ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Position</th>
          <th>Department</th>
          <th>Salary (₹)</th>
          <th>Phone</th>
          <th>Join Date</th>
          <th>Aadhar Number</th>
          <th>Bank Account Number</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filteredEmployees.map(emp => `
          <tr>
            <td>${emp.employeeId}</td>
            <td>${emp.employerId}</td>
            <td>${emp.name}</td>
            <td>${emp.email}</td>
            <td>${emp.position}</td>
            <td>${emp.department}</td>
            <td>₹${parseInt(emp.salary).toLocaleString()}</td>
            <td>${emp.phone || 'N/A'}</td>
            <td>${emp.joinDate}</td>
            <td>${emp.aadharNumber || 'N/A'}</td>
            <td>${emp.bankAccountNumber || 'N/A'}</td>
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

// Save employees to localStorage
function saveToLocalStorage() {
  localStorage.setItem('employees', JSON.stringify(employees));
}

// Show Add Employee Form
addEmployeeBtn.addEventListener('click', () => {
  formContainer.style.display = 'block';
  formTitle.textContent = 'Add New Employee';
  submitBtn.textContent = 'Add Employee';
  employeeForm.reset();
  editingEmployeeId = null;
});

// Cancel form
cancelBtn.addEventListener('click', () => {
  formContainer.style.display = 'none';
  employeeForm.reset();
  editingEmployeeId = null;
});

// Form Validation
function validateEmployee(employeeData) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number
  const aadharRegex = /^\d{12}$/;    // 12 digits
  const bankRegex = /^\d{10,18}$/;   // 10-18 digits

  if (!emailRegex.test(employeeData.email)) {
    alert('Invalid Email ID!');
    return false;
  }
  if (!phoneRegex.test(employeeData.phone)) {
    alert('Invalid Phone Number! It should be 10 digits and start with 6-9.');
    return false;
  }
  if (!aadharRegex.test(employeeData.aadharNumber)) {
    alert('Invalid Aadhar Number! It should be 12 digits.');
    return false;
  }
  if (!bankRegex.test(employeeData.bankAccountNumber)) {
    alert('Invalid Bank Account Number! It should be 10 to 18 digits.');
    return false;
  }
  return true;
}

// Submit form: Add or Edit Employee
employeeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(employeeForm);
  const employeeData = Object.fromEntries(formData.entries());

  // Validate form
  if (!validateEmployee(employeeData)) return;

  // Check for duplicate Email or Employee ID
  if (!editingEmployeeId) {
    const exists = employees.some(emp => 
      emp.email === employeeData.email || emp.employeeId === employeeData.employeeId
    );
    if (exists) {
      alert('Employee with this Email or Employee ID already exists!');
      return;
    }
    const newEmployee = { ...employeeData, id: Date.now().toString() };
    employees.push(newEmployee);
  } else {
    employees = employees.map(emp =>
      emp.id === editingEmployeeId ? { ...employeeData, id: editingEmployeeId } : emp
    );
  }

  saveToLocalStorage();
  renderTable(searchInput.value);
  employeeForm.reset();
  formContainer.style.display = 'none';
  editingEmployeeId = null;
});

// Edit employee
window.editEmployee = function(id) {
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
window.deleteEmployee = function(id) {
  if (confirm('Are you sure you want to delete this employee?')) {
    employees = employees.filter(emp => emp.id !== id);
    saveToLocalStorage();
    renderTable(searchInput.value);
  }
};

// Search employees
searchInput.addEventListener('input', (e) => {
  renderTable(e.target.value);
});

// Export to Excel
exportBtn.addEventListener('click', () => {
  if (employees.length === 0) {
    alert("No employees to export!");
    return;
  }

  const data = employees.map(emp => ({
    "Employee ID": emp.employeeId,
    "Employer ID": emp.employerId,
    "Name": emp.name,
    "Email": emp.email,
    "Position": emp.position,
    "Department": emp.department,
    "Salary (₹)": emp.salary,
    "Phone": emp.phone || 'N/A',
    "Join Date": emp.joinDate,
    "Aadhar Number": emp.aadharNumber || 'N/A',
    "Bank Account Number": emp.bankAccountNumber || 'N/A',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
  XLSX.writeFile(workbook, "employee_data.xlsx");
  alert("Excel file exported successfully!");
});

// Initial table render
renderTable();
