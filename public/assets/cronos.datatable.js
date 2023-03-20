class DataTable {
	constructor(container, data, headers, cantFiles = [5, 10, 20]) {
		this.container = document.querySelector(container);
		this.data = data;
		this.headers = headers;
		this.page = 1;
		this.rowsPerPage = cantFiles[0];
		this.rowsPerPageOptions = cantFiles;
		this.searchTerm = "";
		this.sortedBy = null;
		this.sortedAsc = true;

		//crear div hijo de container
		const containerTable = document.createElement("div");
		containerTable.classList.add("datatable-container", "flex", "flex-col");
		this.container.append(containerTable);
	}

	init() {
		if (this.container.querySelector(".datatable-header")) {
			this.container.querySelector(".datatable-header").remove();
		}
		if (this.container.querySelector(".datatable-table")) {
			this.container.querySelector(".datatable-table").remove();
		}
		this.renderHeader();
		this.renderTable();
		this.render();
	}

	renderHeader() {
		const headerContainer = document.createElement("div");
		headerContainer.classList.add("datatable-header");

		const searchInput = document.createElement("input");
		searchInput.type = "text";
		searchInput.placeholder = "Buscar...";
		searchInput.classList.add("datatable-header-input");
		searchInput.addEventListener("input", (event) => {
			this.searchTerm = event.target.value;
			this.render();
		});

		const rowsPerPageSelect = document.createElement("select");
		rowsPerPageSelect.addEventListener("change", (event) => {
			this.rowsPerPage = parseInt(event.target.value);
			this.render();
		});

		rowsPerPageSelect.classList.add("datatable-header-input");
		this.rowsPerPageOptions.forEach((option) => {
			const rowsPerPageOption = document.createElement("option");
			rowsPerPageOption.value = option;
			rowsPerPageOption.text = `${option} filas`;
			if (option === this.rowsPerPage) {
				rowsPerPageOption.selected = true;
			}
			rowsPerPageSelect.add(rowsPerPageOption);
		});

		headerContainer.append(rowsPerPageSelect);
		headerContainer.append(searchInput);
		this.container.querySelector(".datatable-container").append(headerContainer);
	}

	renderTable() {
		const table = document.createElement("table");
		table.classList.add("datatable-table");

		//thead
		const thead = document.createElement("thead");
		const tr = document.createElement("tr");
		tr.classList.add("datatable-table-thead-tr");

		for (const key in this.headers) {
			const th = document.createElement("th");
			th.innerText = this.headers[key];
			th.dataset.key = key;
			th.classList.add("datatable-table-thead-th");
			if (key !== "action" && key !== "actions") {
				th.addEventListener("click", () => {
					if (this.sortedBy === key) {
						this.sortedAsc = !this.sortedAsc;
					} else {
						this.sortedBy = key;
						this.sortedAsc = true;
					}
					const table = this.container.querySelector("table");
					for (const header of table.querySelectorAll("th")) {
						header.innerText = this.headers[header.dataset.key];
					}
					const arrow = this.sortedAsc ? "↑" : "↓";
					th.innerText += ` ${arrow}`;
					this.render();
				});
			}
			tr.append(th);
		}

		thead.append(tr);
		table.append(thead);

		const tbody = document.createElement("tbody");
		tbody.classList.add("datatable-table-tbody");
		table.append(tbody);

		const tableResponsive = document.createElement("div");
		tableResponsive.classList.add("table-container-responsive");
		tableResponsive.append(table);

		this.container.querySelector(".datatable-container").append(tableResponsive);
	}

	render() {
		const filteredData = this.filtrarData();

		const sortedData = this.ordenarData(filteredData);

		const totalPages = this.obtenerNumeroPaginas(sortedData);
		const visibleRows = this.obtenerDataPaginaActual(sortedData);

		const table = this.container.querySelector("table");
		const tbody = table.querySelector("tbody");
		tbody.innerHTML = "";
		visibleRows.forEach((row) => {
			const tr = document.createElement("tr");
			//filas
			tr.classList.add("datatable-table-tbody-tr");
			for (const key in this.headers) {
				const td = document.createElement("td");
				td.classList.add("datatable-table-tbody-td");
				td.innerHTML = row[key];
				tr.append(td);
			}
			tbody.append(tr);
		});

		// cambiar paginacion en cada render
		const paginationContainer = this.container.querySelector(".datatable-pagination");
		if (paginationContainer) {
			paginationContainer.remove();
		}
		const pagination = this.renderPagination(totalPages);
		this.container.querySelector(".datatable-container").append(pagination);
	}

	renderPagination(totalPages) {
		const paginationContainer = document.createElement("div");
		paginationContainer.classList.add("datatable-pagination");

		const previousButton = document.createElement("button");
		previousButton.classList.add("table-btn-previous");
		previousButton.innerHTML =
			'<svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>';
		previousButton.disabled = this.page === 1;
		previousButton.addEventListener("click", () => {
			this.page--;
			this.render();
		});
		paginationContainer.append(previousButton);

		if (totalPages <= 5) {
			for (let i = 1; i <= totalPages; i++) {
				const pageButton = this.renderPageButton(i);
				if (i === this.page) {
					pageButton.classList.add("active");
				}
				paginationContainer.append(pageButton);
			}
		} else {
			let startPage, endPage;
			if (this.page <= 3) {
				startPage = 1;
				endPage = 5;
			} else if (this.page + 1 >= totalPages) {
				startPage = totalPages - 4;
				endPage = totalPages;
			} else {
				startPage = this.page - 2;
				endPage = this.page + 2;
			}
			if (startPage > 1) {
				const startButton = this.renderPageButton(1);
				paginationContainer.append(startButton);
				if (startPage > 2) {
					const separator = document.createElement("span");
					separator.classList.add("table-btn-points");
					separator.innerHTML = "...";
					paginationContainer.append(separator);
				}
			}
			for (let i = startPage; i <= endPage; i++) {
				const pageButton = this.renderPageButton(i);
				if (i === this.page) {
					pageButton.classList.add("active");
				}
				paginationContainer.append(pageButton);
			}
			if (endPage < totalPages) {
				if (endPage < totalPages - 1) {
					const separator = document.createElement("span");
					separator.innerHTML = "...";
					separator.classList.add("table-btn-points");
					paginationContainer.append(separator);
				}
				const endButton = this.renderPageButton(totalPages);
				paginationContainer.append(endButton);
			}
		}

		const nextButton = document.createElement("button");
		nextButton.classList.add("table-btn-next");
		nextButton.innerHTML =
			"<svg class='w-4 h-4 fill-current' viewBox='0 0 20 20'><path d='M12.828 10l-4.828-4.828 1.414-1.414L16.656 10l-7.757 7.757-1.414-1.414L12.828 10z'/></svg>";
		nextButton.disabled = this.page === totalPages;
		nextButton.addEventListener("click", () => {
			this.page++;
			this.render();
		});
		paginationContainer.append(nextButton);

		return paginationContainer;
	}

	renderPageButton(pageNumber) {
		const button = document.createElement("button");
		button.classList.add("table-btn-number");
		button.innerHTML = pageNumber;
		button.disabled = pageNumber === this.page;
		button.addEventListener("click", () => {
			this.page = pageNumber;
			this.render();
		});
		return button;
	}

	filtrarData() {
		if (this.searchTerm === "") {
			return this.data;
		} else {
			const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
			return this.data.filter((row) =>
				Object.values(row).some(
					(value) => value.toString().toLowerCase().indexOf(lowerCaseSearchTerm) !== -1
				)
			);
		}
	}

	ordenarData(data) {
		if (this.sortedBy === null) {
			return data;
		} else {
			return data.slice().sort((a, b) => {
				const valueA = a[this.sortedBy];
				const valueB = b[this.sortedBy];
				if (typeof valueA === "string") {
					return this.sortedAsc ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
				} else {
					return this.sortedAsc ? valueA - valueB : valueB - valueA;
				}
			});
		}
	}

	obtenerNumeroPaginas(data) {
		return Math.ceil(data.length / this.rowsPerPage);
	}

	obtenerDataPaginaActual(data) {
		const startIndex = (this.page - 1) * this.rowsPerPage;
		const endIndex = startIndex + this.rowsPerPage;
		return data.slice(startIndex, endIndex);
	}
}
