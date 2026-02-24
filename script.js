const Gameboard = (() => {
	const rows = 3;
	// must be square board
	let board = [];
	let markersPlaced = 0;

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
		board = [];
		markersPlaced = 0;
		createBoard();
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
			gameWin.marker = arrayWin(board[i]);
			if (gameWin.marker !== null) {
				gameWin.info = { type: "row", index: i };
				return gameWin;
			}
		}

		// Columns
		for (let i = 0; i < rows; i++) {
			gameWin.marker = arrayWin(getColumn(i));
			if (gameWin.marker !== null) {
				gameWin.info = { type: "column", index: i };
				return gameWin;
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
		getRow,
		getColumn,
		getLeadDiagonal,
		getReverseDiagonal,
		checkForWin,
		resetBoard,
	};
})();

const Game = (() => {
	const player1 = { marker: "X", score: 0 };
	const player2 = { marker: "O", score: 0 };

	let currentPlayer = player1;

	const getCurrentPlayer = () => currentPlayer;

	const swapCurrentPlayer = () => {
		currentPlayer = currentPlayer === player1 ? player2 : player1;
	};

	const playTurn = (playRow, playColumn) => {
		Gameboard.placeMarker(currentPlayer.marker, playRow, playColumn);
		Gameboard.printBoard();

		const winInfo = Gameboard.checkForWin();
		if (winInfo.marker !== null) {
			switch (winInfo.marker) {
				case player1.marker:
					player1.score++;
					console.log(`Player 1 (${winInfo.marker}) wins!`);
					console.log(winInfo.info);
					break;
				case player2.marker:
					player2.score++;
					console.log(`Player 2 (${winInfo.marker}) wins!`);
					console.log(winInfo.info);
					break;
				case "Tie":
					console.log("Tie! No one wins");
					break;
			}

			console.log(`Player 1: ${player1.score} | Player 2: ${player2.score}`);
			Gameboard.resetBoard();
		}
		swapCurrentPlayer();
	};

	return { playTurn };
})();
