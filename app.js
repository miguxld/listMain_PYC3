document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector("form");
  const input = document.querySelector("#cosa");
  const deleteAll = document.querySelector('#removeAll');
  const lista = document.querySelector("ul");

  function loadList() {
    const savedList = localStorage.getItem('lista');
    if (savedList) {
      JSON.parse(savedList).forEach(item => {
        addItemToDOM(item.text, item.completed);
      });
    }
  }

  function saveList() {
    const items = [];
    document.querySelectorAll('li').forEach(li => {
      items.push({
        text: li.childNodes[0].nodeValue,
        completed: li.querySelector('input').checked
      });
    });
    localStorage.setItem('lista', JSON.stringify(items));
  }

  function addItemToDOM(text, completed = false) {
    const newCosa = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed;
    const borrar = document.createElement("button");

    newCosa.innerHTML = text;
    newCosa.appendChild(checkbox);
    newCosa.appendChild(borrar);
    borrar.innerText = "X";

    lista.appendChild(newCosa);

    if (completed) {
      newCosa.style.color = "green";
      newCosa.style.backgroundColor = 'rgb(217, 248, 171)';
      newCosa.style.textDecoration = "line-through";
    }

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        newCosa.style.color = "green";
        newCosa.style.backgroundColor = 'rgb(217, 248, 171)';
        newCosa.style.textDecoration = "line-through";
      } else {
        newCosa.style.color = "";
        newCosa.style.backgroundColor = '';
        newCosa.style.textDecoration = "";
      }
      saveList();
    });

    borrar.addEventListener('click', () => {
      newCosa.remove();
      saveList();
    });
  }

  loadList();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addItemToDOM(input.value);
    saveList();
    input.value = "";
  });

  deleteAll.addEventListener('click', () => {
    document.querySelectorAll('li').forEach(li => li.remove());
    localStorage.removeItem('lista');
  });
});
