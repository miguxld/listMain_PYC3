// Elementos del DOM
const form = document.querySelector("#form")
const input = document.querySelector("#cosa")
const categorySelect = document.querySelector("#category")
const lista = document.querySelector("#lista")
const searchInput = document.querySelector("#searchInput")
const filterButtons = document.querySelectorAll(".filter-btn")
const removeAllBtn = document.querySelector("#removeAll")
const clearCompletedBtn = document.querySelector("#clearCompleted")
const themeToggle = document.querySelector("#themeToggle")
const emptyState = document.querySelector("#emptyState")

let currentFilter = "todos"
let searchTerm = ""

// Cargar tema guardado
function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light"
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode")
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
  }
}

// Toggle tema
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode")
  const isDark = document.body.classList.contains("dark-mode")
  localStorage.setItem("theme", isDark ? "dark" : "light")
  themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'
})

// Cargar lista guardada
function loadList() {
  const savedList = localStorage.getItem("lista")
  if (savedList) {
    JSON.parse(savedList).forEach((item) => {
      addItemToDOM(item.text, item.completed, item.category)
    })
  }
  updateStats()
}

// Guardar lista
function saveList() {
  const items = []
  document.querySelectorAll("li").forEach((li) => {
    const textSpan = li.querySelector(".item-name")
    const categorySpan = li.querySelector(".item-category")
    const checkbox = li.querySelector("input")
    items.push({
      text: textSpan.textContent,
      completed: checkbox.checked,
      category: categorySpan.textContent,
    })
  })
  localStorage.setItem("lista", JSON.stringify(items))
  updateStats()
}

// Agregar item al DOM
function addItemToDOM(text, completed = false, category = "Otros") {
  const newLi = document.createElement("li")
  newLi.dataset.text = text.toLowerCase()
  newLi.dataset.category = category
  newLi.dataset.completed = completed

  // Checkbox
  const checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  checkbox.checked = completed
  checkbox.className = "item-checkbox"

  // Contenedor de texto
  const textContainer = document.createElement("span")
  textContainer.className = "item-text"

  const itemName = document.createElement("span")
  itemName.className = "item-name"
  itemName.textContent = text

  const itemCategory = document.createElement("span")
  itemCategory.className = "item-category"
  itemCategory.textContent = category

  textContainer.appendChild(itemName)
  textContainer.appendChild(itemCategory)

  // Botón eliminar
  const deleteBtn = document.createElement("button")
  deleteBtn.type = "button"
  deleteBtn.className = "btn-delete"
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'
  deleteBtn.setAttribute("aria-label", "Eliminar artículo")

  // Contenedor de acciones
  const actionsContainer = document.createElement("div")
  actionsContainer.className = "item-actions"
  actionsContainer.appendChild(deleteBtn)

  // Armar el elemento
  newLi.appendChild(checkbox)
  newLi.appendChild(textContainer)
  newLi.appendChild(actionsContainer)

  if (completed) {
    newLi.classList.add("completed")
  }

  // Event listeners
  checkbox.addEventListener("change", () => {
    newLi.classList.toggle("completed")
    saveList()
    updateStats()
    updateDisplay()
  })

  deleteBtn.addEventListener("click", () => {
    newLi.style.animation = "slideOut 0.3s ease-out"
    setTimeout(() => {
      newLi.remove()
      saveList()
      updateStats()
      updateDisplay()
    }, 300)
  })

  lista.appendChild(newLi)
}

// Agregar CSS para animación de salida
const style = document.createElement("style")
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(20px);
        }
    }
`
document.head.appendChild(style)

// Actualizar estadísticas
function updateStats() {
  const allItems = document.querySelectorAll("li")
  const completedItems = document.querySelectorAll("li.completed")
  const pendingItems = allItems.length - completedItems.length

  const total = allItems.length
  const completed = completedItems.length
  const pending = pendingItems
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

  // Actualizar contadores
  document.getElementById("countAll").textContent = total
  document.getElementById("countPending").textContent = pending
  document.getElementById("countCompleted").textContent = completed

  // Actualizar estadísticas
  document.getElementById("statTotal").textContent = total
  document.getElementById("statCompleted").textContent = completed
  document.getElementById("statPending").textContent = pending
  document.getElementById("statProgress").textContent = progress + "%"

  // Mostrar/ocultar botones de acción
  clearCompletedBtn.style.display = completed > 0 ? "flex" : "none"
  removeAllBtn.style.display = total > 0 ? "flex" : "none"
}

// Actualizar visualización según filtros y búsqueda
function updateDisplay() {
  const items = document.querySelectorAll("li")
  let visibleCount = 0

  items.forEach((item) => {
    let isVisible = true

    // Aplicar filtro
    if (currentFilter === "completados") {
      isVisible = item.classList.contains("completed")
    } else if (currentFilter === "pendientes") {
      isVisible = !item.classList.contains("completed")
    }

    // Aplicar búsqueda
    if (isVisible && searchTerm) {
      const text = item.dataset.text
      const category = item.dataset.category.toLowerCase()
      isVisible = text.includes(searchTerm.toLowerCase()) || category.includes(searchTerm.toLowerCase())
    }

    item.style.display = isVisible ? "" : "none"
    if (isVisible) visibleCount++
  })

  // Mostrar empty state
  if (items.length === 0 || visibleCount === 0) {
    emptyState.style.display = "flex"
  } else {
    emptyState.style.display = "none"
  }
}

// Event listeners de filtros
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"))
    btn.classList.add("active")
    currentFilter = btn.dataset.filter
    updateDisplay()
  })
})

// Event listener de búsqueda
searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value
  updateDisplay()
})

// Agregar item nuevo
form.addEventListener("submit", (e) => {
  e.preventDefault()
  const text = input.value.trim()

  if (text === "") {
    input.focus()
    return
  }

  const category = categorySelect.value
  addItemToDOM(text, false, category)
  saveList()
  updateStats()
  updateDisplay()
  input.value = ""
  categorySelect.value = "Otros"
  input.focus()
})

// Limpiar completados
clearCompletedBtn.addEventListener("click", () => {
  if (confirm("¿Estás seguro de que deseas limpiar los artículos completados?")) {
    document.querySelectorAll("li.completed").forEach((li) => li.remove())
    saveList()
    updateStats()
    updateDisplay()
  }
})

// Eliminar toda la lista
removeAllBtn.addEventListener("click", () => {
  if (confirm("¿Estás seguro de que deseas borrar toda la lista?")) {
    document.querySelectorAll("li").forEach((li) => li.remove())
    localStorage.removeItem("lista")
    updateStats()
    updateDisplay()
  }
})

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  loadTheme()
  loadList()
  updateDisplay()
  input.focus()
})
