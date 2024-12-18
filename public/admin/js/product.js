//Change Status
const buttonsChangeStatus = document.querySelectorAll("[button-change-status]");
if(buttonsChangeStatus.length > 0){
    const formChangeStatus = document.querySelector("#form-change-status");
    const path = formChangeStatus.getAttribute("data-path");
    // console.log(path);

    buttonsChangeStatus.forEach(button => {
        button.addEventListener("click", () => {
            const statusCurrent = button.getAttribute("data-status");
            const id = button.getAttribute("data-id");
            
            let statusChange = statusCurrent == "active" ? "inactive" : "active";

            // console.log(statusCurrent);
            // console.log(statusChange);
            // console.log(id);

            const action = path + `/${statusChange}/${id}?_method=PATCH`; 
            // console.log(action);
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
           const isConfirm = confirm("Bạn có chắc muốn xoá sản phẩm này?");

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