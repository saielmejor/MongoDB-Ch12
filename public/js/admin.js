// a function to delete product asynchronous

const deleteProduct = (button) => {
  const prodId = button.parentNode.querySelector("[name=productId]").value;
  const csrf = button.parentNode.querySelector("[name=_csrf]").value;

  const productElement=button.closest('article')// deletes the element 

  fetch("/admin/product/" + prodId, {
    headers: {
      "csrf-token": csrf,
    },
    method: "DELETE",
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      productElement.parentNode.removeChild(productElement)
    })
    .catch((err) => {
      console.log(err);
    });
};
