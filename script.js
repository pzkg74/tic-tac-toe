const Gameboard = (() => {
	let rows = 3;
	// must be square board
	let board = [];
	let markersPlaced = 0;

	const setGridRows = (userRows) => {
		rows = userRows;
		document.documentElement.style.setProperty("--grid-width", userRows);
	};

	const createBoard = () => {
		for (let i = 0; i < rows; i++) {
			const currentRow = [];
			for (let j = 0; j < rows; j++) {
				currentRow.push("");
			}
			board.push(currentRow);
		}
	};
	createBoard();

	const getBoard = () => board;

	const resetBoard = () => {
		Game.setGameOver(false);
		try {
			document
				.querySelector('p[data-highlight="true"]')
				.setAttribute("data-highlight", false);
		} catch {}
		document.querySelector("main").dataset.isGameOver = false;

		board = [];
		markersPlaced = 0;
		createBoard();
		Display.drawGrid();
	};

	const getRow = (rowIndex) => board[rowIndex];

	const getColumn = (columnIndex) => board.map((row) => row[columnIndex]);

	// top left - bottom right
	const getLeadDiagonal = () => {
		const resultArray = [];
		for (let i = 0; i < rows; i++) {
			resultArray.push(board[i][i]);
		}
		return resultArray;
	};

	// bottom left - top right
	const getReverseDiagonal = () => {
		const resultArray = [];
		for (let i = 0; i < rows; i++) {
			resultArray.push(board[rows - 1 - i][i]);
		}
		return resultArray;
	};

	const printBoard = () => {
		console.clear();
		console.table(board);
	};

	const placeMarker = (playerMarker, row, column) => {
		if (row > rows - 1) {
			throw Error("Position out of range.");
		}
		if (board[row][column] !== "") {
			throw Error("Marker already exists in that position.");
		}

		board[row][column] = playerMarker;
		markersPlaced++;
	};

	const checkForWin = () => {
		function arrayWin(array) {
			if (array.some((value) => value === "")) {
				return null;
			}
			const firstMarker = array[0];
			if (array.every((value) => value === firstMarker)) {
				return firstMarker;
			}

			return null;
		}

		const gameWin = { marker: null, info: {} };

		// Rows
		for (let i = 0; i < rows; i++) {
			const rowWin = arrayWin(board[i]);
			if (rowWin !== null) {
				return { marker: rowWin, info: { type: "row", index: i } };
			}
		}

		// Columns
		for (let i = 0; i < rows; i++) {
			const colWin = arrayWin(getColumn(i));
			if (colWin !== null) {
				return { marker: colWin, info: { type: "column", index: i } };
			}
		}

		// Diagonals
		gameWin.marker = arrayWin(getLeadDiagonal());
		if (gameWin.marker !== null) {
			gameWin.info = { type: "leadDiagonal" };
			return gameWin;
		}
		gameWin.marker = arrayWin(getReverseDiagonal());
		if (gameWin.marker !== null) {
			gameWin.info = { type: "reverseDiagonal" };
			return gameWin;
		}

		// Tie
		if (markersPlaced === rows * rows) {
			gameWin.marker = "Tie";
			return gameWin;
		}

		return gameWin;
	};

	return {
		printBoard,
		placeMarker,
		getBoard,
		getRow,
		getColumn,
		getLeadDiagonal,
		getReverseDiagonal,
		checkForWin,
		resetBoard,
		setGridRows,
	};
})();

const Game = (() => {
	const player1 = { marker: "X", score: 0 };
	const player2 = { marker: "O", score: 0 };

	let currentPlayer = player1;
	let isGameOver = false;

	const getCurrentPlayer = () => currentPlayer;

	// const resetCurrentPlayer = ()

	const setGameOver = (value) => {
		isGameOver = value;
		if (isGameOver) {
			document.getElementById("current-player-hint").textContent = "​"; // hacky way to stop layout shifting
			document.getElementById("new-round").disabled = false;
		} else {
			document.getElementById("new-round").disabled = true;
		}
	};

	const swapCurrentPlayer = () => {
		currentPlayer = currentPlayer === player1 ? player2 : player1;
		document.documentElement.style.setProperty(
			"--current-player-marker",
			`"${currentPlayer.marker}"`,
		);
		if (!isGameOver) {
			if (currentPlayer.marker === "X") {
				document.getElementById("current-player-hint").textContent =
					`Player 1's turn (${currentPlayer.marker})`;
			} else {
				document.getElementById("current-player-hint").textContent =
					`Player 2's turn (${currentPlayer.marker})`;
			}
		}
	};

	const playTurn = (playRow, playColumn) => {
		if (isGameOver) {
			console.log("Game is over.");
			return false;
		}

		Gameboard.placeMarker(currentPlayer.marker, playRow, playColumn);
		Gameboard.printBoard();

		const winInfo = Gameboard.checkForWin();
		if (winInfo.marker !== null) {
			switch (winInfo.marker) {
				case player1.marker:
					player1.score++;
					document.getElementById("player1-score").textContent = player1.score;
					document.getElementById("player1-score").dataset.highlight = true;
					console.log(`Player 1 (${winInfo.marker}) wins!`);
					Display.highlightWin(winInfo.info);
					break;
				case player2.marker:
					player2.score++;
					document.getElementById("player2-score").textContent = player2.score;
					document.getElementById("player2-score").dataset.highlight = true;
					console.log(`Player 2 (${winInfo.marker}) wins!`);
					Display.highlightWin(winInfo.info);
					break;
				case "Tie":
					console.log("Tie! No one wins");
					break;
			}

			console.log(`Player 1: ${player1.score} | Player 2: ${player2.score}`);
			setGameOver(true);
			document.querySelector("main").dataset.isGameOver = isGameOver;

			// Gameboard.resetBoard();
		}
		swapCurrentPlayer();
	};

	return { playTurn, getCurrentPlayer, setGameOver };
})();

const Display = (() => {
	const drawGrid = () => {
		const mainContainer = document.querySelector("main");
		mainContainer.innerHTML = "";

		if (Game.getCurrentPlayer().marker === "X") {
			document.getElementById("current-player-hint").textContent =
				"Player 1's turn (X)";
		} else {
			document.getElementById("current-player-hint").textContent =
				"Player 2's turn (O)";
		}

		const board = Gameboard.getBoard();
		for (let i = 0; i < board.length; i++) {
			for (let j = 0; j < board.length; j++) {
				const cell = document.createElement("div");
				cell.dataset.rowIndex = i;
				cell.dataset.columnIndex = j;
				const currentCell = board[i][j];
				if (currentCell !== "") {
					cell.dataset.contains = currentCell;
					cell.innerHTML = `<span>${currentCell}</span>`;
				}

				cell.addEventListener("click", (event) => {
					if (!cell.dataset.contains) {
						const playerMarker = Game.getCurrentPlayer().marker;
						if (
							Game.playTurn(
								event.target.dataset.rowIndex,
								event.target.dataset.columnIndex,
							) !== false
						) {
							cell.dataset.contains = playerMarker;
							cell.innerHTML = `<span>${playerMarker}</span>`;
						}
					}
				});

				mainContainer.append(cell);
			}
		}
	};

	const highlightWin = (winInformation) => {
		let toHighlight = [];
		switch (winInformation.type) {
			case "row":
				toHighlight = [
					...document.querySelectorAll(
						`div[data-row-index="${winInformation.index}"]`,
					),
				];
				toHighlight.forEach((div) => {
					div.dataset.highlight = true;
				});
				break;
			case "column":
				toHighlight = [
					...document.querySelectorAll(
						`div[data-column-index="${winInformation.index}"]`,
					),
				];
				toHighlight.forEach((div) => {
					div.dataset.highlight = true;
				});
				break;
			case "leadDiagonal": {
				const boardWidth = Gameboard.getBoard().length;

				for (let i = 0; i < boardWidth; i++) {
					toHighlight.push(
						document.querySelector(
							`div[data-row-index="${i}"][data-column-index="${i}"]`,
						),
					);
				}
				toHighlight.forEach((div) => {
					div.dataset.highlight = true;
				});
				break;
			}
			case "reverseDiagonal": {
				const boardWidth = Gameboard.getBoard().length;

				for (let i = 0; i < boardWidth; i++) {
					toHighlight.push(
						document.querySelector(
							`div[data-row-index="${i}"][data-column-index="${boardWidth - 1 - i}"]`,
						),
					);
				}
				toHighlight.forEach((div) => {
					div.dataset.highlight = true;
				});
				break;
			}
		}
	};

	return { drawGrid, highlightWin };
})();

Display.drawGrid();

document.getElementById("new-round").addEventListener("click", () => {
	Gameboard.resetBoard();
});

document.getElementById("grid-width").addEventListener("input", (event) => {
	if (event.target.value >= 1 && event.target.value <= 16) {
		Gameboard.setGridRows(event.target.value);
		Gameboard.resetBoard();
	}
});
