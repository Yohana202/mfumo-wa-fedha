document.addEventListener('DOMContentLoaded', () => {
    // 1. NAVIGATION SYSTEM
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const sections = document.querySelectorAll('.page-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href').replace('#', '');

            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.style.display = 'none');

            item.classList.add('active');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });

    // 2. FORM SUBMISSIONS
    const incomeForm = document.getElementById('incomeForm');
    if (incomeForm) {
        incomeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const source = document.getElementById('incomeSource').value;
            const amount = parseFloat(document.getElementById('incomeAmount').value);
            const date = document.getElementById('incomeDate').value;

            const incomeData = getStoredIncome();
            incomeData.push({ source, amount, date, type: 'Income' });
            saveIncome(incomeData);

            alert('Mapato yamehifadhiwa kikamilifu!');
            incomeForm.reset();
            loadFinancialSummary();
        });
    }

    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('expenseTitle').value;
            const amount = parseFloat(document.getElementById('expenseAmount').value);
            const date = document.getElementById('expenseDate').value;

            const expenseData = getStoredExpenses();
            expenseData.push({ title, amount, date, type: 'Expense' });
            saveExpenses(expenseData);

            alert('Matumizi yamehifadhiwa kikamilifu!');
            expenseForm.reset();
            loadFinancialSummary();
        });
    }

    // Soma data zote mara tu mfumo unapofunguka
    loadFinancialSummary();
});

// --- HELPER FUNCTIONS FOR COMPATIBILITY ---
function getStoredIncome() {
    return JSON.parse(
        localStorage.getItem('mPEP_income') || 
        localStorage.getItem('financial_income') || 
        localStorage.getItem('incomeData') || 
        '[]'
    );
}

function getStoredExpenses() {
    return JSON.parse(
        localStorage.getItem('mPEP_expenses') || 
        localStorage.getItem('financial_expenses') || 
        localStorage.getItem('expenseData') || 
        '[]'
    );
}

function saveIncome(data) {
    localStorage.setItem('mPEP_income', JSON.stringify(data));
    localStorage.setItem('financial_income', JSON.stringify(data)); // Kwa ajili ya mfumo wa Malengo
}

function saveExpenses(data) {
    localStorage.setItem('mPEP_expenses', JSON.stringify(data));
    localStorage.setItem('financial_expenses', JSON.stringify(data)); // Kwa ajili ya mfumo wa Malengo
}

// 3. LOAD & DISPLAY SUMMARY
function loadFinancialSummary() {
    const mapato = getStoredIncome();
    const matumizi = getStoredExpenses();

    const totalIncome = mapato.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpenses = matumizi.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const balance = totalIncome - totalExpenses;

    const incDisplay = document.getElementById('totalIncomeDisplay');
    const expDisplay = document.getElementById('totalExpensesDisplay');
    const balDisplay = document.getElementById('balanceDisplay');

    if (incDisplay) incDisplay.innerText = `TZS ${totalIncome.toLocaleString()}`;
    if (expDisplay) expDisplay.innerText = `TZS ${totalExpenses.toLocaleString()}`;
    if (balDisplay) balDisplay.innerText = `TZS ${balance.toLocaleString()}`;

    // Display Transactions List
    const listContainer = document.getElementById('transactionsList');
    if (listContainer) {
        const allTransactions = [...mapato, ...matumizi];
        if (allTransactions.length === 0) {
            listContainer.innerHTML = '<p style="color: #64748b;">Hakuna miamala iliyorekodiwa bado.</p>';
        } else {
            let html = '<ul style="list-style: none; padding: 0;">';
            allTransactions.forEach(t => {
                const color = t.type === 'Income' || t.source ? '#16a34a' : '#ef4444';
                const name = t.source || t.title || t.category || 'Muamala';
                const typeName = t.source ? 'Mapato' : 'Matumizi';
                const dateStr = t.date ? `(${t.date})` : '';
                
                html += `<li style="padding: 12px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${name}</strong> <small style="color: #64748b;">${dateStr}</small>
                    </div>
                    <span style="color: ${color}; font-weight: bold;">${t.source ? '+' : '-'} TZS ${Number(t.amount || 0).toLocaleString()}</span>
                </li>`;
            });
            html += '</ul>';
            listContainer.innerHTML = html;
        }
    }
}

// 4. BACKUP DATA
function backupFinancialData() {
    const mapato = getStoredIncome();
    const matumizi = getStoredExpenses();

    const backupData = {
        income: mapato,
        expenses: matumizi,
        exportDate: new Date().toISOString()
    };

    if (backupData.income.length === 0 && backupData.expenses.length === 0) {
        alert("Hakuna data zilizohifadhiwa za kufanyia Backup!");
        return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `mPEP_Financial_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
}

// 5. RESTORE DATA
function restoreFinancialData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);

            if (importedData.income || importedData.expenses) {
                if (importedData.income) saveIncome(importedData.income);
                if (importedData.expenses) saveExpenses(importedData.expenses);

                alert("Hongera! Taarifa zako zote zimerudishwa kikamilifu!");
                location.reload();
            } else {
                alert("Faili hili halina muundo sahihi wa data.");
            }
        } catch (err) {
            alert("Kuna makosa katika kuisoma data hii. Hakikisha ni faili sahihi la .json");
        }
    };
    reader.readAsText(file);
}
