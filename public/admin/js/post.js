//Change Status
const buttonsChangeStatus = document.querySelectorAll("[button-change-status]");
if(buttonsChangeStatus.length > 0){
    const formChangeStatus = document.querySelector("#form-change-status");
    const path = formChangeStatus.getAttribute("data-path");

    buttonsChangeStatus.forEach(button => {
        button.addEventListener("click", () => {
            const statusCurrent = button.getAttribute("data-status");
            const id = button.getAttribute("data-id");
            
            let statusChange = statusCurrent == "active" ? "inactive" : "active";

            const action = path + `/${statusChange}/${id}?_method=PATCH`; 
            formChangeStatus.setAttribute("action", action);

            formChangeStatus.submit();
        })
    });
}
//End Change Status

//Delete Item
const buttonsDelete = document.querySelectorAll("[button-delete]");
if(buttonsDelete.length > 0){
    const formDeleteItem = document.querySelector("#form-delete-item");
    const path = formDeleteItem.getAttribute("data-path");

    buttonsDelete.forEach(button => {
        button.addEventListener("click", () => {
            const itemName = button.getAttribute("data-name") || "bài viết này";
            const isConfirm = confirm(`Bạn có chắc muốn xóa ${itemName}?`);

            if(isConfirm) {
                const id = button.getAttribute("data-id");

                const action = `${path}/${id}?_method=DELETE`;
                console.log(action);

                formDeleteItem.setAttribute("action", action);
                formDeleteItem.submit();
            }
        });
    });
}
//End Delete Item

//Form Change Multi (sử dụng lại code từ script.js nhưng tùy chỉnh cho posts)
const formChangeMulti = document.querySelector("#form-change-multi");
if(formChangeMulti){
    const selectChangeMulti = document.querySelector("#select-change-multi");
    const buttonChangeMulti = document.querySelector("#button-change-multi");
    const checkboxMulti = document.querySelector("[checkbox-multi]");
    
    if(selectChangeMulti && buttonChangeMulti && checkboxMulti) {
        const inputcheckAll = checkboxMulti.querySelector("input[name='checkall']");
        const inputsId = checkboxMulti.querySelectorAll("input[name='id']");
        
        // Enable/disable button based on selection
        const updateButtonState = () => {
            const checkedInputs = checkboxMulti.querySelectorAll("input[name='id']:checked");
            const hasSelection = checkedInputs.length > 0;
            const hasAction = selectChangeMulti.value !== "";
            
            buttonChangeMulti.disabled = !(hasSelection && hasAction);
        };
        
        // Check all functionality
        inputcheckAll.addEventListener("click", () => { 
            if(inputcheckAll.checked == true){
                inputsId.forEach(input => {
                    input.checked = true;
                });
            }else{
                inputsId.forEach(input => {
                    input.checked = false;
                });
            }
            updateButtonState();
        });

        // Individual checkbox functionality
        inputsId.forEach(input => {
            input.addEventListener("click", () => {
                const countChecked = checkboxMulti.querySelectorAll("input[name='id']:checked").length;
                
                if(countChecked == inputsId.length) {
                    inputcheckAll.checked = true; 
                } else {
                    inputcheckAll.checked = false;
                }
                updateButtonState();
            });
        });
        
        // Select change functionality
        selectChangeMulti.addEventListener("change", updateButtonState);
        
        // Form submit functionality
        formChangeMulti.addEventListener("submit", (e) => {
            e.preventDefault();
            const inputsChecked = checkboxMulti.querySelectorAll("input[name='id']:checked");
            const typeChange = selectChangeMulti.value;

            if(typeChange == "delete-all"){
                const isConfirm = confirm("Bạn có chắc muốn xóa những bài viết này?");
                if(!isConfirm){
                    return;
                }
            }
            
            if(inputsChecked.length > 0){
                let ids = [];
                const inputIds = document.querySelector("#ids-change-multi");

                inputsChecked.forEach(input => {
                    const id = input.getAttribute("value");
                    ids.push(id);
                });

                inputIds.value = ids.join(", ");
                formChangeMulti.submit();
            }else {
                alert("Vui lòng chọn ít nhất một bài viết!");
            }
        });
    }
}
//End Form Change Multi

//Alert
const showAlert = document.querySelector("[show-alert]");
if(showAlert){
    const time = parseInt(showAlert.getAttribute("data-time"));
    const closeAlert = showAlert.querySelector("[close-alert]");

    setTimeout(() => {
        showAlert.classList.add("alert-hidden");
    }, time);

    closeAlert.addEventListener("click", () => {
        showAlert.classList.add("alert-hidden");
    });

}
//End Alert

//Pagination
const buttonsPagination = document.querySelectorAll("[button-pagination]");

if(buttonsPagination.length > 0){
    let url = new URL(window.location.href);

    buttonsPagination.forEach(button => {
        button.addEventListener('click', () => {
            const page = button.getAttribute("button-pagination");
            if(page){
                url.searchParams.set("page", page);
            }else{
                url.searchParams.delete("page");
            }

            window.location.href = url.href;
        });
    });      
}
//End Pagination

// Button Status (Filter)
const buttonStatus = document.querySelectorAll('[button-status]');
if(buttonStatus.length > 0){
    let url = new URL(window.location.href);

    buttonStatus.forEach(button => {
        button.addEventListener('click', () => {
            const status = button.getAttribute("button-status");
            
            if(status) {
                url.searchParams.set("status", status);
            }else{
                url.searchParams.delete("status");
            }

            window.location.href = url.href;
        });
    });
}
// End Button Status

// Form Search
const formSearch = document.querySelector('#form-search');
if(formSearch){
    let url = new URL(window.location.href);
    formSearch.addEventListener('submit', (e) => {
        e.preventDefault();
        const keyword = e.target.elements.keyword.value;

        if(keyword){
            url.searchParams.set("keyword", keyword);
        }else{
            url.searchParams.delete("keyword");
        }

        window.location.href = url.href;
    });
}
// End Form Search