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

// Xử lý upload multiple images
const uploadImageMultiple = document.querySelector("[upload-image-multiple]");
if (uploadImageMultiple) {
    const uploadImageInput = uploadImageMultiple.querySelector("[upload-image-input]");
    const uploadImagePreview = uploadImageMultiple.querySelector("[upload-image-preview]");
    
    uploadImageInput.addEventListener("change", (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            // Xóa preview cũ
            uploadImagePreview.innerHTML = "";
            
            // Tạo preview cho từng file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const img = document.createElement("img");
                img.classList.add("image-preview");
                img.style.width = "150px";
                img.style.height = "150px";
                img.style.objectFit = "cover";
                img.style.margin = "10px";
                img.style.border = "1px solid #ddd";
                img.style.borderRadius = "5px";
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
                
                uploadImagePreview.appendChild(img);
            }
        }
    });
}