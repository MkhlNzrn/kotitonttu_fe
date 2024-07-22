import React from "react";
import styles from "./Series.module.css";
import { makeStyles } from "@mui/styles"; // Correct import for makeStyles
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

// Стили для таблицы
const useStyles = makeStyles({
	table: {
		minWidth: 650,
	},
});

const formatValue = value => {
	if (value === null || value === undefined) {
		return ""; // возвращаем пустую строку для null или undefined
	}
	if (typeof value === "number" && value === 0) {
		return "0"; // специально обрабатываем случай, когда значение 0
	}
	return value;
};

function getMagnitude(value) {
	return value.svalue !== "null"
		? value.svalue
		: value.dvalue !== 0.0
		? String(value.dvalue)
		: `${value.minValue}-${value.maxValue}`;
}

export default function Series({ series }) {
	const classes = useStyles();

	// console.log("Series boilers:", series.boilers);

	// Перебираем все бойлеры и их значения для логирования
	series.boilers.forEach(boiler => {
		boiler.values.forEach(value => {
			// Логируем заголовок характеристики
			// console.log("Value characteristic title:", value.characteristic?.title);
			// Логируем значение характеристики
			// console.log("dvalue:", value.dvalue);
		});
	});

	const columns = [
		{ Header: "Технические характеристики", accessor: "characteristic" }, // Заголовок и аксессор для характеристики
		{ Header: "Единицы измерения", accessor: "unit" }, // Заголовок и аксессор для единицы измерения
		...series.boilers.map(boiler => ({
			Header: boiler.title, // Заголовок для каждого бойлера
			accessor: boiler.title, // Аксессор для каждого бойлера
		})),
	];

	// Создаем карту характеристик для удаления дубликатов
	const characteristicsMap = new Map();
	series.boilers.forEach(boiler => {
		boiler.values.forEach(value => {
			const key = value.characteristic?.title; // Ключ - заголовок характеристики
			// Если ключ существует и не добавлен в карту
			if (key && !characteristicsMap.has(key)) {
				characteristicsMap.set(key, {
					characteristic: value.characteristic?.title, // Добавляем заголовок характеристики
					unit: value.characteristic?.unit?.shortName, // Добавляем единицу измерения
				});
			}
		});
	});

	// Преобразуем карту в массив
	const characteristics = Array.from(characteristicsMap.values());
	// console.log("Characteristics:", characteristics);

	const rows = characteristics.map(charac => ({
		characteristic: charac.characteristic, // Устанавливаем характеристику
		unit: charac.unit, // Устанавливаем единицу измерения
		...series.boilers.reduce((acc, boiler) => {
			const value = boiler.values.find(
				val => val.characteristic?.title === charac.characteristic // Находим значение для данной характеристики
			);

			if (value) {
				acc[boiler.title] = getMagnitude(value);
			} else {
				acc[boiler.title] = ""; // Пустая строка для значений, которые равны null или undefined
			}

			return acc; // Возвращаем накопленный объект
		}, {}),
	}));
	// console.log("Rows:", rows);

	return (
		<div>
			<h3 className={styles.series_title}>{series.title}</h3>
			<p className={styles.series_descr}>{series.description}</p>
			<TableContainer component={Paper}>
				<Table
					className={classes.table}
					size='small'
					aria-label='a dense table'
				>
					<TableHead>
						<TableRow>
							{columns.map(column => (
								<TableCell key={column.accessor}>{column.Header}</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map((row, rowIndex) => (
							<TableRow key={rowIndex}>
								{columns.map(column => (
									<TableCell key={column.accessor}>
										{formatValue(row[column.accessor])}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	);
}
