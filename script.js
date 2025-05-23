let entries = [];

function handleCategoryChange(select) {
  if (select.value === "Others") {
    const newCat = prompt("Enter new category name:");
    if (newCat) {
      const newOption = new Option(newCat, newCat);
      select.add(newOption, select.options.length - 1);
      select.value = newCat;
    } else {
      select.value = ""; // Reset if no new category is entered
    }
  }
}

function addEntry() {
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const subject = document.getElementById("subject").value.trim();
  const debit = parseFloat(document.getElementById("debit").value) || 0;
  const credit = parseFloat(document.getElementById("credit").value) || 0;

  if (!date || !category) {
    alert("Please enter date and category.");
    return;
  }

  entries.push({ date, category, subject, debit, credit });
  renderTable(entries);
  clearInputs();
}

function clearInputs() {
  document.getElementById("date").value = "";
  document.getElementById("category").value = "";
  document.getElementById("subject").value = "";
  document.getElementById("debit").value = "0";
  document.getElementById("credit").value = "0";
}

function renderTable(data) {
  const tbody = document.querySelector("#ledger tbody");
  tbody.innerHTML = ""; // Clear existing rows

  let balance = 0;

  data.forEach((entry, index) => {
    balance += entry.credit - entry.debit;

    const row = tbody.insertRow();
    row.insertCell().textContent = entry.date;
    
    const categoryCell = row.insertCell();
    const categoryLink = document.createElement('a');
    categoryLink.textContent = entry.category;
    categoryLink.href = "#"; // Make it behave like a link
    categoryLink.onclick = (event) => {
        event.preventDefault(); // Prevent page jump
        filterByCategory(entry.category);
    };
    categoryCell.appendChild(categoryLink);
    
    row.insertCell().textContent = entry.subject || "";
    row.insertCell().textContent = entry.debit.toFixed(2);
    row.insertCell().textContent = entry.credit.toFixed(2);
    row.insertCell().textContent = balance.toFixed(2);

    const actionsCell = row.insertCell();
    const editButton = document.createElement('button');
    editButton.textContent = "Edit";
    editButton.classList.add("action-btn", "edit-btn");
    editButton.onclick = () => editEntry(index);
    actionsCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("action-btn");
    deleteButton.onclick = () => deleteEntry(index);
    actionsCell.appendChild(deleteButton);
  });

  document.getElementById("balanceSummary").textContent = `Total Balance: ₹${balance.toFixed(2)}`;
}

function filterByCategory(category) {
  const filtered = entries.filter(e => e.category === category);
  renderTable(filtered);
  const filteredBalance = filtered.reduce((acc, e) => acc + e.credit - e.debit, 0);
  document.getElementById("balanceSummary").textContent = `Filtered by ${category} — Total Balance: ₹${filteredBalance.toFixed(2)}`;
}

function showAll() {
  renderTable(entries);
  // Recalculate total balance when showing all
  const totalBalance = entries.reduce((acc, e) => acc + e.credit - e.debit, 0);
  document.getElementById("balanceSummary").textContent = `Total Balance: ₹${totalBalance.toFixed(2)}`;
}

function deleteEntry(index) {
  if (confirm("Delete this entry?")) {
    entries.splice(index, 1);
    renderTable(entries); // Re-render table which also updates summary
  }
}

function editEntry(index) {
  const entry = entries[index];
  
  // For a better UX, we'll replace these prompts with modals later.
  const newDate = prompt("Edit Date:", entry.date);
  if (newDate === null) return; // User cancelled

  const newCategory = prompt("Edit Category:", entry.category);
  if (newCategory === null) return; // User cancelled

  const newSubject = prompt("Edit Subject:", entry.subject);
  // Subject can be empty, so null check is not strictly needed if we accept cancellation as clearing.
  // However, for consistency with other prompts:
  if (newSubject === null) return; 


  let newDebitStr = prompt("Edit Debit:", entry.debit);
  if (newDebitStr === null) return;
  let newCreditStr = prompt("Edit Credit:", entry.credit);
  if (newCreditStr === null) return;

  const newDebit = parseFloat(newDebitStr);
  const newCredit = parseFloat(newCreditStr);

  // Basic validation for parsed numbers
  if (isNaN(newDebit) || isNaN(newCredit)) {
    alert("Invalid number for debit or credit. Please enter valid numbers.");
    // Optionally, re-open the edit for those fields or revert
    return; 
  }

  entries[index] = {
    date: newDate,
    category: newCategory,
    subject: newSubject || "", // Keep allowing empty subject
    debit: newDebit,
    credit: newCredit
  };
  renderTable(entries);
}

// Initialize table on load if there's any data (e.g., from localStorage in the future)
// For now, it just ensures the table structure is ready.
document.addEventListener('DOMContentLoaded', () => {
    renderTable(entries); 
}); 