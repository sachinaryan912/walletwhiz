// Initialize an empty array to hold transactions
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentPage = 1;
const transactionsPerPage = 10;
// Function to update the current balance
function updateBalance() {
    const currentBalanceElement = document.getElementById("currentBalance");
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison

    // Filter transactions to include only those from today or in the past
    const relevantTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate <= today; // Include only transactions up to today
    });

    // Calculate the total balance
    const total = relevantTransactions.reduce((acc, transaction) => {
        return acc + (transaction.type === "income" ? transaction.amount : -transaction.amount);
    }, 0);
    
    const initialBalance = parseFloat(currentBalanceElement.innerText.replace('₹', '')) || 0;
    const duration = 1000; // Animation duration in milliseconds
    const startTime = performance.now();

    function animateBalance(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const animatedBalance = initialBalance + (total - initialBalance) * progress;
        currentBalanceElement.innerText = `₹${animatedBalance.toFixed(2)}`;

        if (progress < 1) {
            requestAnimationFrame(animateBalance);
        } else {
            currentBalanceElement.innerText = `₹${total.toFixed(2)}`; // Ensure it ends on the exact value
        }
    }

    requestAnimationFrame(animateBalance);
}

// Function to render transactions
function renderTransactions(filter = "all") {
    const transactionList = document.getElementById("transactionList");
    transactionList.innerHTML = ""; // Clear the list

    // Filter transactions based on the selected category
    const filteredTransactions = transactions.filter(transaction => {
        return filter === "all" || filter === transaction.type || (filter === "upcoming" && new Date(transaction.date) > new Date());
    });

    // Calculate the number of pages
    const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    const transactionsToDisplay = filteredTransactions.slice(startIndex, endIndex);

    transactionsToDisplay.forEach(transaction => {
        const listItem = document.createElement("li");
        listItem.className = transaction.type;
        listItem.innerHTML = `
            <div class="left"><small>${transaction.date}</small><strong>₹${transaction.amount.toFixed(2)}</strong>
            <span>${transaction.description}</span>
            </div><div>
            <button class="delete-btn" onclick="deleteTransaction('${transaction.description}')"><i class="fas fa-trash-alt"></i></button></div>
        `;
        transactionList.appendChild(listItem);
    });

    // Update pagination controls
    document.getElementById("currentPage").innerText = `Page ${currentPage}`;
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = currentPage === totalPages;
}

// Function to handle page navigation
function changePage(direction) {
    const filteredTransactions = transactions.filter(transaction => {
        return document.getElementById("categoryFilter").value === "all" ||
               document.getElementById("categoryFilter").value === transaction.type ||
               (document.getElementById("categoryFilter").value === "upcoming" && new Date(transaction.date) > new Date());
    });

    const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

    if (direction === "next" && currentPage < totalPages) {
        currentPage++;
    } else if (direction === "prev" && currentPage > 1) {
        currentPage--;
    }

    renderTransactions(document.getElementById("categoryFilter").value);
}

// Event listeners for pagination buttons
document.getElementById("prevPage").addEventListener("click", () => changePage("prev"));
document.getElementById("nextPage").addEventListener(" click", () => changePage("next"));
// Function to add a transaction
// Function to add a transaction
function addTransaction() {
    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const date = document.getElementById("date").value;
    const type = document.getElementById("type").value;
    const recurrence = parseInt(document.getElementById("recurrence").value) || 1;

    if (description && !isNaN(amount) && date) {
        const startDate = new Date(date);

        for (let i = 0; i < recurrence; i++) {
            const transactionDate = new Date(startDate);
            transactionDate.setMonth(transactionDate.getMonth() + i); // Increment month for each recurrence
            const newTransaction = { description, amount, date: transactionDate.toISOString().split('T')[0], type };
            transactions.push(newTransaction);
        }

        localStorage.setItem('transactions', JSON.stringify(transactions)); // Store in localStorage
        updateBalance();
        renderTransactions();
        closeModal();
    } else {
        alert("Please fill in all fields correctly.");
    }
}

// Function to delete a transaction
function deleteTransaction(description) {
    transactions = transactions.filter(transaction => transaction.description !== description);
    localStorage.setItem('transactions', JSON.stringify(transactions)); // Update localStorage
    updateBalance();
    renderTransactions();
}

// Function to open the modal
function openModal() {
    document.getElementById("transactionModal").style.display = "block";
}

// Function to close the modal
function closeModal() {
    document.getElementById("transactionModal").style.display = "none";
    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
}

// Event listeners
document.getElementById("openModal").addEventListener("click", openModal);
document.getElementById("addTransaction").addEventListener("click", addTransaction);
document.getElementById("categoryFilter").addEventListener("change", (event) => {
    renderTransactions(event.target.value);
});

// Close the modal when the user clicks on the close button
document.querySelector(".close").addEventListener("click", closeModal);

// Close the modal when the user clicks anywhere outside of the modal
window.addEventListener("click", (event) => {
    const modal = document.getElementById("transactionModal");
    if (event.target === modal) {
        closeModal();
    }
});

// Initial render
renderTransactions();
updateBalance();