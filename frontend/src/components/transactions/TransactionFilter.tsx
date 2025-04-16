import {
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation } from "react-router-dom";
import { Category } from "../../services/categoryService";
import "../../styles/datepicker.css";
import "../../styles/filter-animations.css";
import "../../styles/filter-transitions.css";
import { getUrlParams, updateUrlParams } from "../../utils/urlParams";

export interface TransactionFilterValues {
	startDate?: string;
	endDate?: string;
	type?: "ALL" | "INCOME" | "EXPENSE";
	categoryId?: number;
}

// Helper function to format Date to string (YYYY-MM-DD)
const formatDateToString = (date: Date | null): string | undefined => {
	if (!date) return undefined;
	return date.toISOString().split("T")[0];
};

interface TransactionFilterProps {
	categories?: Category[];
	onFilter: (filters: TransactionFilterValues) => void;
	initialFilters?: TransactionFilterValues;
}

const TransactionFilter = ({
	categories,
	onFilter,
	initialFilters,
}: TransactionFilterProps) => {
	const location = useLocation();

	// Initialize filters from URL params
	const initializeFiltersFromUrl = (): TransactionFilterValues => {
		const params = getUrlParams();
		const urlFilters: TransactionFilterValues = {};

		if (params.startDate) urlFilters.startDate = params.startDate;
		if (params.endDate) urlFilters.endDate = params.endDate;
		if (params.type && ["ALL", "INCOME", "EXPENSE"].includes(params.type)) {
			urlFilters.type = params.type as "ALL" | "INCOME" | "EXPENSE";
		} else {
			urlFilters.type = "ALL";
		}
		if (params.categoryId && !isNaN(Number(params.categoryId))) {
			urlFilters.categoryId = Number(params.categoryId);
		}

		return urlFilters;
	};

	const [isExpanded, setIsExpanded] = useState(false);
	const [filters, setFilters] = useState<TransactionFilterValues>(
		initialFilters || initializeFiltersFromUrl()
	);

	// State for date picker
	const [startDateValue, setStartDateValue] = useState<Date | null>(null);
	const [endDateValue, setEndDateValue] = useState<Date | null>(null);

	// State for showing date pickers
	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);

	// Refs for click outside detection and positioning
	const startDatePickerRef = useRef<HTMLDivElement>(null);
	const endDatePickerRef = useRef<HTMLDivElement>(null);
	const startInputRef = useRef<HTMLInputElement>(null);
	const endInputRef = useRef<HTMLInputElement>(null);

	// State for picker positions
	const [startPickerPosition, setStartPickerPosition] = useState<{ top: number; left: number } | null>(null);
	const [endPickerPosition, setEndPickerPosition] = useState<{ top: number; left: number } | null>(null);

	// Handle click outside to close date pickers
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				startDatePickerRef.current &&
				!startDatePickerRef.current.contains(event.target as Node) &&
				!(event.target as HTMLElement).closest(".react-datepicker")
			) {
				setShowStartDatePicker(false);
			}

			if (
				endDatePickerRef.current &&
				!endDatePickerRef.current.contains(event.target as Node) &&
				!(event.target as HTMLElement).closest(".react-datepicker")
			) {
				setShowEndDatePicker(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Calculate picker position
	const calculatePickerPosition = (inputRef: React.RefObject<HTMLInputElement | null>) => {
		if (!inputRef.current) return null;

		const rect = inputRef.current.getBoundingClientRect();
		return {
			top: rect.bottom + window.scrollY + 4,
			left: rect.left + window.scrollX
		};
	};

	// Update start date picker position before showing it
	const handleShowStartDatePicker = () => {
		const position = calculatePickerPosition(startInputRef);
		if (position) {
			setStartPickerPosition(position);
			setShowStartDatePicker(true);
			setShowEndDatePicker(false);
		}
	};

	// Update end date picker position before showing it
	const handleShowEndDatePicker = () => {
		const position = calculatePickerPosition(endInputRef);
		if (position) {
			setEndPickerPosition(position);
			setShowEndDatePicker(true);
			setShowStartDatePicker(false);
		}
	};

	// Initialize date values from filters when component mounts
	useEffect(() => {
		if (filters.startDate) {
			setStartDateValue(new Date(filters.startDate));
		}
		if (filters.endDate) {
			setEndDateValue(new Date(filters.endDate));
		}
	}, [filters.startDate, filters.endDate]);

	// Use ref to store current filters to avoid dependency array issues
	const filtersRef = useRef(filters);

	// Update ref when filters change
	useEffect(() => {
		filtersRef.current = filters;
	}, [filters]);

	// Listen for URL changes and update filters
	useEffect(() => {
		const urlFilters = initializeFiltersFromUrl();
		const currentFilters = filtersRef.current;

		// Only update if the URL params have changed
		const hasUrlChanged =
			urlFilters.startDate !== currentFilters.startDate ||
			urlFilters.endDate !== currentFilters.endDate ||
			urlFilters.type !== currentFilters.type ||
			urlFilters.categoryId !== currentFilters.categoryId;

		if (hasUrlChanged) {
			setFilters(urlFilters);

			// Update date pickers
			if (urlFilters.startDate) {
				setStartDateValue(new Date(urlFilters.startDate));
			} else {
				setStartDateValue(null);
			}

			if (urlFilters.endDate) {
				setEndDateValue(new Date(urlFilters.endDate));
			} else {
				setEndDateValue(null);
			}

			// Apply the filters
			onFilter(urlFilters);
		}
	}, [location.search, onFilter]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;

		setFilters((prev) => ({
			...prev,
			[name]:
				value === ""
					? undefined
					: name === "categoryId"
					? Number(value)
					: value,
		}));
	};

	// Handle date changes
	const handleStartDateChange = (date: Date | null) => {
		setStartDateValue(date);
		setFilters((prev) => ({
			...prev,
			startDate: formatDateToString(date),
		}));
	};

	const handleEndDateChange = (date: Date | null) => {
		setEndDateValue(date);
		setFilters((prev) => ({
			...prev,
			endDate: formatDateToString(date),
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Create a copy of the filters
		const appliedFilters = { ...filters };

		// Validate filters - we can only apply one type of filter at a time based on backend endpoints
		if (appliedFilters.startDate && appliedFilters.endDate) {
			// If we have date range, remove other filters
			delete appliedFilters.categoryId;
			if (appliedFilters.type === "ALL") {
				delete appliedFilters.type;
			}
		} else if (appliedFilters.type && appliedFilters.type !== "ALL") {
			// If we have type filter, remove other filters
			delete appliedFilters.startDate;
			delete appliedFilters.endDate;
			delete appliedFilters.categoryId;
		} else if (appliedFilters.categoryId) {
			// If we have category filter, remove other filters
			delete appliedFilters.startDate;
			delete appliedFilters.endDate;
			delete appliedFilters.type;
		} else {
			// No filters or only ALL type, which is the same as no filter
			if (appliedFilters.type === "ALL") {
				delete appliedFilters.type;
			}
		}

		// Update URL with the applied filters
		updateUrlParams({
			startDate: appliedFilters.startDate,
			endDate: appliedFilters.endDate,
			type: appliedFilters.type,
			categoryId: appliedFilters.categoryId?.toString(),
		});

		console.log("Applied filters:", appliedFilters);
		onFilter(appliedFilters);
	};

	const handleReset = () => {
		// Reset all form fields
		const resetFilters: TransactionFilterValues = { type: "ALL" };
		setFilters(resetFilters);

		// Reset date pickers
		setStartDateValue(null);
		setEndDateValue(null);
		setShowStartDatePicker(false);
		setShowEndDatePicker(false);
		setStartPickerPosition(null);
		setEndPickerPosition(null);

		// Clear URL params
		updateUrlParams({
			startDate: undefined,
			endDate: undefined,
			type: undefined,
			categoryId: undefined,
		});

		// Apply the reset filters (empty object means no filters)
		console.log("Resetting filters");
		onFilter({});
	};

	// Helper function to get category name by ID
	const getCategoryName = (categoryId?: number) => {
		if (!categoryId || !categories) return "Unknown";
		const category = categories.find((c) => c.id === categoryId);
		return category ? category.name : "Unknown";
	};

	// Check if any filters are active
	const hasActiveFilters =
		filters.startDate ||
		filters.endDate ||
		(filters.type && filters.type !== "ALL") ||
		filters.categoryId;

	return (
		<div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 transition-all duration-200 hover:shadow-lg">
			<div
				className={`px-4 py-3 flex justify-between items-center cursor-pointer transition-colors duration-150 ${
					hasActiveFilters ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"
				}`}
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="flex items-center">
					<div className="flex items-center">
						<AdjustmentsHorizontalIcon
							className={`h-5 w-5 ${
								hasActiveFilters ? "text-blue-500" : "text-gray-500"
							} mr-2`}
						/>
						<h3
							className={`text-sm font-medium ${
								hasActiveFilters ? "text-blue-700" : "text-gray-700"
							}`}
						>
							{hasActiveFilters
								? "Filtered Transactions"
								: "Filter Transactions"}
						</h3>
					</div>

					{/* Show active filter indicators */}
					<div className="flex ml-3 space-x-1 flex-wrap">
						{filters.startDate && filters.endDate && (
							<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1 filter-badge">
								<svg
									className="-ml-0.5 mr-1 h-3 w-3"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
								Date Range
							</span>
						)}

						{filters.type && filters.type !== "ALL" && (
							<span
								className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 filter-badge ${
									filters.type === "INCOME"
										? "bg-green-100 text-green-800"
										: "bg-red-100 text-red-800"
								}`}
							>
								<svg
									className="-ml-0.5 mr-1 h-3 w-3"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									{filters.type === "INCOME" ? (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 6v12m6-6H6"
										/>
									) : (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M18 12H6"
										/>
									)}
								</svg>
								{filters.type === "INCOME" ? "Income" : "Expense"}
							</span>
						)}

						{filters.categoryId && (
							<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1 filter-badge">
								<svg
									className="-ml-0.5 mr-1 h-3 w-3"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
									/>
								</svg>
								{getCategoryName(filters.categoryId)}
							</span>
						)}
					</div>
				</div>

				<div className="flex items-center">
					{hasActiveFilters && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								handleReset();
							}}
							className="mr-2 text-xs text-gray-500 hover:text-gray-700"
						>
							Clear
						</button>
					)}
					<svg
						className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
							isExpanded ? "rotate-180" : ""
						}`}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</div>
			</div>

			<div
				className={`filter-panel border-gray-200 ${
					isExpanded ? "expanded" : ""
				}`}
			>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-4">
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Date Range
							</label>
							<div className="space-y-4">
								<div
									className="date-range-container relative"
									style={{ overflow: "visible" }}
								>
									<div className="relative">
										<input
											ref={startInputRef}
											type="text"
											className="appearance-none block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
											placeholder="Start Date"
											value={
												startDateValue
													? startDateValue.toLocaleDateString("en-US", {
															month: "short",
															day: "numeric",
															year: "numeric",
													  })
													: ""
											}
											onClick={handleShowStartDatePicker}
											readOnly
										/>
										<div
											className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer"
											onClick={handleShowStartDatePicker}
										>
											<CalendarIcon className="h-4 w-4 text-gray-400" />
											<svg
												className="h-4 w-4 text-gray-400 ml-1"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M19 9l-7 7-7-7"
												/>
											</svg>
										</div>
										{startDateValue && (
											<button
												type="button"
												className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
												onClick={() => setStartDateValue(null)}
											>
												<XMarkIcon className="h-4 w-4" />
											</button>
										)}
									</div>

									<span className="date-range-separator">to</span>

									<div className="relative">
										<input
											ref={endInputRef}
											type="text"
											className="appearance-none block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
											placeholder="End Date"
											value={
												endDateValue
													? endDateValue.toLocaleDateString("en-US", {
															month: "short",
															day: "numeric",
															year: "numeric",
													  })
													: ""
											}
											onClick={handleShowEndDatePicker}
											readOnly
										/>
										<div
											className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer"
											onClick={handleShowEndDatePicker}
										>
											<CalendarIcon className="h-4 w-4 text-gray-400" />
											<svg
												className="h-4 w-4 text-gray-400 ml-1"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M19 9l-7 7-7-7"
												/>
											</svg>
										</div>
										{endDateValue && (
											<button
												type="button"
												className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
												onClick={() => setEndDateValue(null)}
											>
												<XMarkIcon className="h-4 w-4" />
											</button>
										)}
									</div>
								</div>

								{showStartDatePicker && startPickerPosition && (
									<div
										ref={startDatePickerRef}
										style={{
											position: "fixed",
											left: startPickerPosition.left,
											top: startPickerPosition.top,
											zIndex: 9999,
										}}
									>
										<div
											className="shadow-lg border border-gray-200 rounded-lg bg-white"
											style={{ minWidth: "250px" }}
										>
											<DatePicker
												selected={startDateValue}
												onChange={(date) => {
													handleStartDateChange(date);
													setShowStartDatePicker(false);
												}}
												selectsStart
												startDate={startDateValue}
												endDate={endDateValue}
												inline
											/>
										</div>
									</div>
								)}

								{showEndDatePicker && endPickerPosition && (
									<div
										ref={endDatePickerRef}
										style={{
											position: "fixed",
											left: endPickerPosition.left,
											top: endPickerPosition.top,
											zIndex: 9999,
										}}
									>
										<div
											className="shadow-lg border border-gray-200 rounded-lg bg-white"
											style={{ minWidth: "250px" }}
										>
											<DatePicker
												selected={endDateValue}
												onChange={(date) => {
													handleEndDateChange(date);
													setShowEndDatePicker(false);
												}}
												selectsEnd
												startDate={startDateValue}
												endDate={endDateValue}
												minDate={startDateValue || undefined}
												inline
											/>
										</div>
									</div>
								)}
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="type"
									className="block text-xs font-medium text-gray-700 mb-1"
								>
									Transaction Type
								</label>
								<div className="relative">
									<select
										name="type"
										id="type"
										value={filters.type || "ALL"}
										onChange={handleChange}
										className="appearance-none block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
									>
										<option value="ALL">All Transactions</option>
										<option value="INCOME">Income Only</option>
										<option value="EXPENSE">Expenses Only</option>
									</select>
									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
										<svg
											className="h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</div>
								</div>
							</div>

							<div>
								<label
									htmlFor="categoryId"
									className="block text-xs font-medium text-gray-700 mb-1"
								>
									Category
								</label>
								<div className="relative">
									<select
										name="categoryId"
										id="categoryId"
										value={filters.categoryId || ""}
										onChange={handleChange}
										className="appearance-none block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
									>
										<option value="">All Categories</option>
										{categories?.map((category) => (
											<option key={category.id} value={category.id}>
												{category.name}
											</option>
										))}
									</select>
									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
										<svg
											className="h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</div>
								</div>
							</div>
						</div>

						<div className="flex justify-end space-x-3 pt-2">
							<button
								type="button"
								onClick={handleReset}
								className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
							>
								<svg
									className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
								Reset
							</button>
							<button
								type="submit"
								className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
							>
								<svg
									className="-ml-0.5 mr-1.5 h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
									/>
								</svg>
								Apply Filters
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default TransactionFilter;
