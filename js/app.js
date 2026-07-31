// INITIAL DATA & STORAGE LOGIC
let appData = JSON.parse(localStorage.getItem('mPEP_financial_data')) || {
    settings: {
        bizName: 'Taasisi Yangu',
        fiscalYear: 2026,
        categories: ['Mishahara', 'Chakula', 'Nauli', 'Vifaa vya Ofisi', 'Matengenezo', 'Gharama za Mtandao/Simu', 'Kodi']
    },
    incomes: [],
    expenses: []
};

// GLOBAL CHART INSTANCES
let barChartInstance = null;
let pieChartInstance = null;

// INIT ON PAGE LOAD
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    updateBizHeader();
    populateCategories();
    renderAllTables();
    updateDashboard();
    initCharts();
    setupFormListeners();
    
    // Set default date picker values
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const monthPicker = document.getElementById('report-month-picker');
    if (monthPicker) monthPicker.value = currentMonth;
}

function saveData() {
    localStorage.setItem('mPEP_financial_data', JSON.stringify(appData));
}

// NAVIGATION BETWEEN SECTIONS
function switchSection(sectionId, element) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.add('active');
    if (element) element.classList.add('active');

    // Title update
    const titleMap = {
        'dashboard': 'Dashboard Overview',
        'income': 'Usimamizi wa Mapato',
        'expenses': 'Usimamizi wa Matumizi',
        'monthly-reports': 'Ripoti za Mwezi na Mchanganuo',
        'yearly-reports': 'Ripoti za Mwaka Mzima',
        'pdf-reports': 'Uzalishaji wa PDF Reports',
        'settings': 'Mipangilio ya Mfumo'
    };
    document.getElementById('page-title').innerText = titleMap[sectionId] || 'Financial App';

    if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'monthly-reports') {
        generateMonthlyReport();
    } else if (sectionId === 'yearly-reports') {
        generateYearlyReport();
    }
}

// POPULATE CATEGORIES
function populateCategories() {
    const select = document.getElementById('exp-category');
    if (!select) return;
    select.innerHTML = '<option value="">Chagua Kundi...</option>';
    appData.settings.categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

function updateBizHeader() {
    const headerName = document.getElementById('header-biz-name');
    if (headerName) headerName.innerText = appData.settings.bizName;
    const setBizInput = document.getElementById('set-biz-name');
    if (setBizInput) setBizInput.value = appData.settings.bizName;
}

// FORM LISTENERS
function setupFormListeners() {
    // Income Form
    const incForm = document.getElementById('income-form');
    if (incForm) {
        incForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const date = document.getElementById('inc-date').value;
            const source = document.getElementById('inc-source').value;
            const amount = parseFloat(document.getElementById('inc-amount').value);
            const desc = document.getElementById('inc-desc').value;

            appData.incomes.push({ id: Date.now(), date, source, amount, desc });
            saveData();
            incForm.reset();
            renderAllTables();
            updateDashboard();
            alert('Mapato yamehifadhiwa kikamilifu!');
        });
    }

    // Expense Form
    const expForm = document.getElementById('expense-form');
    if (expForm) {
        expForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const date = document.getElementById('exp-date').value;
            const category = document.getElementById('exp-category').value;
            const amount = parseFloat(document.getElementById('exp-amount').value);
            const desc = document.getElementById('exp-desc').value;

            appData.expenses.push({ id: Date.now(), date, category, amount, desc });
            saveData();
            expForm.reset();
            renderAllTables();
            updateDashboard();
            alert('Matumizi yamehifadhiwa kikamilifu!');
        });
    }

    // Settings Form
    const setForm = document.getElementById('settings-form');
    if (setForm) {
        setForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('set-biz-name').value;
            const newCat = document.getElementById('set-new-category').value.trim();

            if (newName) appData.settings.bizName = newName;
            if (newCat && !appData.settings.categories.includes(newCat)) {
                appData.settings.categories.push(newCat);
                document.getElementById('set-new-category').value = '';
            }

            saveData();
            updateBizHeader();
            populateCategories();
            alert('Mipangilio imesasishwa!');
        });
    }
}

// RENDER TABLES
function renderAllTables() {
    // Render Incomes
    const incTableBody = document.querySelector('#income table tbody');
    if (incTableBody) {
        incTableBody.innerHTML = appData.incomes.length === 0 ? 
            '<tr><td colspan="5" style="text-align:center;">Hakuna mapato yaliyosajiliwa.</td></tr>' :
            appData.incomes.map(item => `
                <tr>
                    <td>${item.date}</td>
                    <td>${item.source}</td>
                    <td>TZS ${item.amount.toLocaleString()}</td>
                    <td>${item.desc || '-'}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteTransaction('incomes', ${item.id})">Futa</button></td>
                </tr>
            `).join('');
    }

    // Render Expenses
    const expTableBody = document.querySelector('#expenses table tbody');
    if (expTableBody) {
        expTableBody.innerHTML = appData.expenses.length === 0 ? 
            '<tr><td colspan="5" style="text-align:center;">Hakuna matumizi yaliyosajiliwa.</td></tr>' :
            appData.expenses.map(item => `
                <tr>
                    <td>${item.date}</td>
                    <td>${item.category}</td>
                    <td>TZS ${item.amount.toLocaleString()}</td>
                    <td>${item.desc || '-'}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteTransaction('expenses', ${item.id})">Futa</button></td>
                </tr>
            `).join('');
    }
}

function deleteTransaction(type, id) {
    if (confirm('Je, una uhakika unataka kufuta muamala huu?')) {
        appData[type] = appData[type].filter(item => item.id !== id);
        saveData();
        renderAllTables();
        updateDashboard();
    }
}

// DASHBOARD UPDATES
function updateDashboard() {
    const totalIncome = appData.incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = appData.expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpense;
    const ratio = totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 0;

    document.getElementById('dash-income').innerText = `TZS ${totalIncome.toLocaleString()}`;
    document.getElementById('dash-expense').innerText = `TZS ${totalExpense.toLocaleString()}`;
    document.getElementById('dash-balance').innerText = `TZS ${balance.toLocaleString()}`;
    document.getElementById('dash-ratio').innerText = `${ratio}%`;

    // Render Recent Transactions
    const recentList = document.getElementById('recent-transactions-list');
    if (recentList) {
        const combined = [
            ...appData.incomes.map(i => ({ ...i, type: 'Mapato', cat: i.source })),
            ...appData.expenses.map(e => ({ ...e, type: 'Matumizi', cat: e.category }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        recentList.innerHTML = combined.length === 0 ?
            '<tr><td colspan="4" style="text-align:center;">Hakuna miamala iliyowekwa bado.</td></tr>' :
            combined.map(item => `
                <tr>
                    <td>${item.date}</td>
                    <td><span style="color:${item.type === 'Mapato' ? '#2ecc71' : '#e74c3c'}; font-weight:bold;">${item.type}</span></td>
                    <td>${item.cat}</td>
                    <td>TZS ${item.amount.toLocaleString()}</td>
                </tr>
            `).join('');
    }

    updateCharts(totalIncome, totalExpense);
}

// CHARTS LOGIC
function initCharts() {
    const ctxBar = document.getElementById('barChart');
    const ctxPie = document.getElementById('pieChart');

    if (ctxBar) {
        barChartInstance = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ['Mapato', 'Matumizi'],
                datasets: [{
                    label: 'Kiasi (TZS)',
                    data: [0, 0],
                    backgroundColor: ['#2ecc71', '#e74c3c']
                }]
            },
            options: { responsive: true }
        });
    }

    if (ctxPie) {
        pieChartInstance = new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: ['#3498db', '#e74c3c', '#f1c40f', '#9b59b6', '#1abc9c', '#e67e22']
                }]
            },
            options: { responsive: true }
        });
    }
}

function updateCharts(income, expense) {
    if (barChartInstance) {
        barChartInstance.data.datasets[0].data = [income, expense];
        barChartInstance.update();
    }

    if (pieChartInstance) {
        const catTotals = {};
        appData.expenses.forEach(exp => {
            catTotals[exp.category] = (catTotals[exp.category] || 0) + exp.amount;
        });

        pieChartInstance.data.labels = Object.keys(catTotals);
        pieChartInstance.data.datasets[0].data = Object.values(catTotals);
        pieChartInstance.update();
    }
}

// MONTHLY REPORT
function generateMonthlyReport() {
    const selectedMonth = document.getElementById('report-month-picker').value;
    if (!selectedMonth) return;

    const filteredIncomes = appData.incomes.filter(i => i.date.startsWith(selectedMonth));
    const filteredExpenses = appData.expenses.filter(e => e.date.startsWith(selectedMonth));

    const totalInc = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExp = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalInc - totalExp;

    document.getElementById('monthly-total-income').innerText = `TZS ${totalInc.toLocaleString()}`;
    document.getElementById('monthly-total-expense').innerText = `TZS ${totalExp.toLocaleString()}`;
    document.getElementById('monthly-balance').innerText = `TZS ${balance.toLocaleString()}`;

    // Table Percentage Breakdown
    const catTotals = {};
    filteredExpenses.forEach(exp => {
        catTotals[exp.category] = (catTotals[exp.category] || 0) + exp.amount;
    });

    const tbody = document.querySelector('#monthly-report-table tbody');
    if (tbody) {
        tbody.innerHTML = Object.keys(catTotals).length === 0 ?
            '<tr><td colspan="3" style="text-align:center;">Hakuna data ya matumizi kwa mwezi huu.</td></tr>' :
            Object.entries(catTotals).map(([cat, amt]) => {
                const pct = totalExp > 0 ? ((amt / totalExp) * 100).toFixed(1) : 0;
                return `
                    <tr>
                        <td>${cat}</td>
                        <td>TZS ${amt.toLocaleString()}</td>
                        <td>${pct}%</td>
                    </tr>
                `;
            }).join('');
    }
}

// YEARLY REPORT
function generateYearlyReport() {
    const selectedYear = document.getElementById('report-year-picker').value;
    const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    const monthNames = ['Januari','Februari','Machi','Aprili','Mei','Juni','Julai','Agosti','Siku','Oktoba','Novemba','Disemba'];

    let grandInc = 0, grandExp = 0;
    const tbody = document.querySelector('#yearly-report-table tbody');

    if (tbody) {
        tbody.innerHTML = months.map((m, idx) => {
            const ym = `${selectedYear}-${m}`;
            const inc = appData.incomes.filter(i => i.date.startsWith(ym)).reduce((sum, i) => sum + i.amount, 0);
            const exp = appData.expenses.filter(e => e.date.startsWith(ym)).reduce((sum, e) => sum + e.amount, 0);
            const bal = inc - exp;

            grandInc += inc;
            grandExp += exp;

            return `
                <tr>
                    <td>${monthNames[idx]}</td>
                    <td>TZS ${inc.toLocaleString()}</td>
                    <td>TZS ${exp.toLocaleString()}</td>
                    <td>TZS ${bal.toLocaleString()}</td>
                </tr>
            `;
        }).join('');

        document.getElementById('yearly-grand-income').innerText = `TZS ${grandInc.toLocaleString()}`;
        document.getElementById('yearly-grand-expense').innerText = `TZS ${grandExp.toLocaleString()}`;
        document.getElementById('yearly-grand-balance').innerText = `TZS ${(grandInc - grandExp).toLocaleString()}`;
    }
}

// PRINT / DOWNLOAD PDF
function printReportPDF(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const opt = {
        margin:       10,
        filename:     `${filename}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

function backupData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mPEP_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

