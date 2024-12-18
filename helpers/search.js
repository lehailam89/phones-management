module.exports = (query) => {
    let objectSearch = {
        keyword: ""
    }
    
    if (query.keyword) {
        objectSearch.keyword = query.keyword;

        const regex = new RegExp(objectSearch.keyword, "i"); //Kiến thức tự học thêm về regex
        objectSearch.regex = regex;
    }
    //req.query thì nó sẽ trả ra các query(truy vấn) trên url mà mình truyền vào

    return objectSearch;
}
