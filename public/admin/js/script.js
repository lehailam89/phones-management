// Button Status
const buttonStatus = document.querySelectorAll('[button-status]');
//thuộc tính tự định nghĩa là phải thêm dấu ngoặc vuông
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


//CheckBox Multi
const checkboxMulti = document.querySelector("[checkbox-multi]");
if(checkboxMulti){
    const inputcheckAll = checkboxMulti.querySelector("input[name='checkall']");
    const inputsId = checkboxMulti.querySelectorAll("input[name='id']");
  
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
    });

    inputsId.forEach(input => {
        input.addEventListener("click", () => {
            const countChecked = checkboxMulti.querySelectorAll("input[name='id']:checked").length;
            // console.log(countChecked);

            if(countChecked == inputsId.length) {
                inputcheckAll.checked = true; 
            } else {
                inputcheckAll.checked = false;
            }
        });
    });
}
//End checkBox Multi


//Form Change Multi
const formChangeMulti = document.querySelector("[form-change-multi] ");
if(formChangeMulti){
    formChangeMulti.addEventListener("submit", (e) => {
        e.preventDefault();
        const checkboxMulti = document.querySelector("[checkbox-multi]");
        const inputsChecked = checkboxMulti.querySelectorAll("input[name='id']:checked");

        const typeChange = e.target.elements.type.value;

        if(typeChange == "delete-all"){
            const isConfirm = confirm("Bạn có chắc muốn xoá những sản phẩm này?");
            if(!isConfirm){
                return;
            }
        }
        
        if(inputsChecked.length > 0){
            let ids = [];
            const inputIds = formChangeMulti.querySelector("input[name='ids']");

            inputsChecked.forEach(input => {
                const id = input.getAttribute("value");

                if(typeChange == "change-position"){
                    const position = input.closest("tr").querySelector("input[name='position']").value;
                    
                    ids.push(`${id}-${position}`);
                }else{
                    ids.push(id);
                }
            });

            // console.log(ids.join(", ")); //hàm join để convert thành string 
            inputIds.value = ids.join(", ");

            formChangeMulti.submit();
        }else {
            alert("Vui lòng chọn ít nhất một sản phẩm!");
        }
    });
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

// Upload Image
const uploadImage = document.querySelector("[upload-image]");
if(uploadImage){
    const uploadImageInput = uploadImage.querySelector("[upload-image-input]");
    const uploadImagePreview = uploadImage.querySelector("[upload-image-preview]");

    uploadImageInput.addEventListener("change", (e) => {
       if (e.target.files.length){
            const image = URL.createObjectURL(e.target.files[0]);

            uploadImagePreview.src = image;
       }
    });
}

// End Upload Image


//Sort
const sort = document.querySelector("[sort]"); //ngoặc vuông là thuộc tính tự định nghĩa
if(sort){
    let url = new URL(window.location.href);
    const sortSelect = sort.querySelector("[sort-select]");
    const sortClear = sort.querySelector("[sort-clear]");

    //sắp xếp
    sortSelect.addEventListener("change", (e) => {
        const value = e.target.value;
        const [sortKey, sortValue] = value.split("-");
        url.searchParams.set("sortKey", sortKey);
        url.searchParams.set("sortValue", sortValue);

        window.location.href = url.href;
    })
    //End sắp xếp 

    //Button Clear
    sortClear.addEventListener("click", () => {
        url.searchParams.delete("sortKey");
        url.searchParams.delete("sortValue");

        window.location.href = url.href;
    });
    //End Button Clear

    //Hiển thị mặc định lựa chọn
    const sortKey = url.searchParams.get("sortKey", sortKey);
    const sortValue = url.searchParams.get("sortValue", sortValue);

    if(sortKey && sortValue){
        const stringSort = `${sortKey}-${sortValue}`;
        const optionSelected = sortSelect.querySelector(`option[value='${stringSort}']`);
        optionSelected.setAttribute("selected", true);
    }

}

//End Sort


