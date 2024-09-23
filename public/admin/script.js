const body = document.querySelector("body"),
      modeToggle = body.querySelector(".mode-toggle");
      sidebar = body.querySelector("nav");
      sidebarToggle = body.querySelector(".sidebar-toggle");

let getMode = localStorage.getItem("mode");
if(getMode && getMode ==="dark"){
    body.classList.toggle("dark");
}

let getStatus = localStorage.getItem("status");
if(getStatus && getStatus ==="close"){
    sidebar.classList.toggle("close");
}

modeToggle.addEventListener("click", () =>{
    body.classList.toggle("dark");
    if(body.classList.contains("dark")){
        localStorage.setItem("mode", "dark");
    }else{
        localStorage.setItem("mode", "light");
    }
});

sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    if(sidebar.classList.contains("close")){
        localStorage.setItem("status", "close");
    }else{
        localStorage.setItem("status", "open");
    }
})


// script.js
document.getElementById('account-link').addEventListener('click', function() {
    fetch('/api/users')
        .then(response => response.json())
        .then(users => {
            let userList = '<h2>Danh sách tài khoản</h2><ul>';
            users.forEach(user => {
                userList += `<li>${user.username} (${user.name})</li>`;
            });
            userList += '</ul>';

            // Tạo một modal hoặc div để hiển thị danh sách
            const modal = document.createElement('div');
            modal.innerHTML = userList;
            modal.style.position = 'fixed';
            modal.style.top = '50%';
            modal.style.left = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.backgroundColor = '#fff';
            modal.style.padding = '20px';
            modal.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
            modal.style.zIndex = '1000';
            document.body.appendChild(modal);

            // Thêm sự kiện để đóng modal khi nhấp vào
            modal.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
});

document.querySelector('.btn-save').addEventListener('click', function() {
    // Logic to save changes
    alert('Changes saved successfully!');
});

document.querySelector('.btn-delete').addEventListener('click', function() {
    // Logic to delete account
    if (confirm('Are you sure you want to delete your account?')) {
        alert('Account deleted successfully!');
        // Redirect or additional logic
    }
});

