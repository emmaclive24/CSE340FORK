const form = document.querySelector("#edit-inventory")
    form.addEventListener("change", function () {
        const updateBtn = document.querySelector("button")
        updateBtn.removeAttribute("disabled")
    })