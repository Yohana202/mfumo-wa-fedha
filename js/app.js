document.addEventListener('DOMContentLoaded', () => {
    // 1. MFUMO WA NAVIGATION (KUBADILISHA KURASA)
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const sections = document.querySelectorAll('.page-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href').replace('#', '');

            // Ondoa 'active' kwenye menu zote
            navItems.forEach(nav => nav.classList.remove('active'));
            // Ficha kurasa zote
            sections.forEach(section => section.style.display = 'none');

            // Weka active ukurasa husika
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

            const incomeData = JSON.parse(localStorage.getItem('mPEP_income') || '[]');
            incomeData.push({ source, amount, date, type: 'Income' });
            localStorage.setItem('mPEP_income', JSON.stringify(incomeData));

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

            const expenseData = JSON.parse(localStorage.getItem('mPEP_expenses') || '[]');
            expenseData.push({ title, amount, date, type: 'Expense' });
            localStorage.setItem('mPEP_expenses', JSON.stringify(expenseData));

            alert('Matumizi yamehifadhiwa kikamilifu!');
            expenseForm.reset();
            loadFinancialSummary();
        });
    }

    // Load data mara tu mfumo unapofunguka
    loadFinancialSummary();
});

// 3. KAZI YA KUSOMA NA KUONYESHA DATA (DASHBOARD)
function loadFinancialSummary() {
    const mapato = JSON.parse(localStorage.getItem('mPEP_income') || '[]');
    const matumizi = JSON.parse(localStorage.getItem('mPEP_expenses') || '[]');

    const totalIncome = mapato.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpenses = matumizi.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const balance = totalIncome - totalExpenses;

    const incDisplay = document.getElementById('totalIncomeDisplay');
    const expDisplay = document.getElementById('totalExpensesDisplay');
    const balDisplay = document.getElementById('balanceDisplay');

    if (incDisplay) incDisplay.innerText = `TZS ${totalIncome.toLocaleString()}`;
    if (expDisplay) expDisplay.innerText = `TZS ${totalExpenses.toLocaleString()}`;
    if (balDisplay) balDisplay.innerText = `TZS ${balance.toLocaleString()}`;

    // Ongeza orodha ya miamala kwenye sehemu ya Ripoti
    const listContainer = document.getElementById('transactionsList');
    if (listContainer) {
        const allTransactions = [...mapato, ...matumizi];
        if (allTransactions.length === 0) {
            listContainer.innerHTML = '<p style="color: #64748b;">Hakuna miamala iliyorekodiwa bado.</p>';
        } else {
            let html = '<ul style="list-style: none; padding: 0;">';
            allTransactions.forEach(t => {
                const color = t.type === 'Income' ? '#16a34a' : '#ef4444';
                const name = t.source || t.title;
                html += `<li style="padding: 10px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
                    <span><strong>${name}</strong> (${t.date})</span>
                    <span style="color: ${color}; font-weight: bold;">${t.type === 'Income' ? '+' : '-'} TZS ${Number(t.amount).toLocaleString()}</span>
                </li>`;
            });
            html += '</ul>';
            listContainer.innerHTML = html;
        }
    }
}

// 4. KAZI YA BACKUP (PAKUA TAARIFA ZOTE)
function backupFinancialData() {
    const mapato = localStorage.getItem('mPEP_income') || '[]';
    const matumizi = localStorage.getItem('mPEP_expenses') || '[]';

    const backupData = {
        income: JSON.parse(mapato),
        expenses: JSON.parse(matumizi),
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

// 5. KAZI YA RESTORE (KURUDISHA DATA KUTOKA KWENYE FAILIN)
function restoreFinancialData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);

            if (importedData.income || importedData.expenses) {
                if (importedData.income) {
                    localStorage.setItem('mPEP_income', JSON.stringify(importedData.income));
                }
                if (importedData.expenses) {
                    localStorage.setItem('mPEP_expenses', JSON.stringify(importedData.expenses));
                }

                alert("Hongera! Taarifa zako zote zimerudishwa kikamilifu!");
                location.reload();
            } else {
                alert("Faili hili halina muundo sahihi wa data za mfumo huu.");
            }
        } catch (err) {
            alert("Kuna makosa katika kuisoma data hii. Hakikisha ni faili sahihi la .json");
        }
    };
    reader.readAsText(file);
}
