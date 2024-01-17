/* eslint-disable no-mixed-spaces-and-tabs */
import { useCallback, useEffect, useRef, useState } from 'react';
import style from './select.module.css';

export type SelectOption = {
	label: string;
	value: string | number;
};

type MultipleSelectProps = {
	multiple: true;
	value: SelectOption[];
	onChange: (value: SelectOption[]) => void;
};

type SingleSelectProps = {
	multiple?: false;
	value?: SelectOption;
	onChange: (value: SelectOption | undefined) => void;
};

type SelectProps = {
	options: SelectOption[];
} & (SingleSelectProps | MultipleSelectProps);

export default function Select({
	multiple,
	value,
	onChange,
	options,
}: SelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isOpen) setHighlightedIndex(0);
	}, [isOpen]);

	const clearOptions = () => {
		multiple ? onChange([]) : onChange(undefined);
	};

	const selectOption = useCallback(
		(option: SelectOption) => {
			if (multiple) {
				if (value.includes(option)) {
					onChange(value.filter((o) => o !== option));
				} else {
					onChange([...value, option]);
				}
			} else {
				if (option !== value) onChange(option);
			}
		},
		[multiple, onChange, value]
	);

	function isOptionSelected(option: SelectOption): boolean {
		return multiple ? value.includes(option) : option === value;
	}
	useEffect(() => {
		if (isOpen) setHighlightedIndex(0);
	}, [isOpen]);
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.target != containerRef.current) return;
			switch (e.code) {
				case 'Enter':
				case 'Space':
					setIsOpen((prev) => !prev);
					if (isOpen) selectOption(options[highlightedIndex]);
					break;
				case 'ArrowUp':
				case 'ArrowDown': {
					if (!isOpen) {
						setIsOpen(true);
						break;
					}

					const newValue = highlightedIndex + (e.code === 'ArrowDown' ? 1 : -1);
					if (newValue >= 0 && newValue < options.length) {
						setHighlightedIndex(newValue);
					}
					break;
				}
				case 'Escape':
					setIsOpen(false);
					break;
			}
		};
		containerRef.current?.addEventListener('keydown', handler);

		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			containerRef.current?.removeEventListener('keydown', handler);
		};
	}, [isOpen, highlightedIndex, options, selectOption]);

	return (
		<div
			ref={containerRef}
			onBlur={() => setIsOpen(false)}
			onClick={() => setIsOpen((prev) => !prev)}
			tabIndex={0}
			className={style.container}
		>
			<div className={style.value}>
				{value ? (
					<span className={style.value}>
						{multiple
							? value.map((v) => (
									<button
										key={v.value}
										onClick={(e) => {
											e.stopPropagation();
											selectOption(v);
										}}
										className={style['option-badge']}
									>
										{v.label}
										<span className={style['remove-btn']}>&times;</span>
									</button>
							  ))
							: value?.label}
					</span>
				) : (
					<span className={style.placeholder}>Choose an Option</span>
				)}
			</div>
			<span>
				{value ? (
					<button
						className={style['clear-btn']}
						onClick={(e) => {
							e.stopPropagation();
							clearOptions();
						}}
					>
						&times;
					</button>
				) : null}
			</span>
			<div className={style.divider} />
			<div className={style.caret} />
			<ul className={`${style.options} ${isOpen ? style.show : ''}`}>
				{options.map((option, index) => (
					<li
						key={option.label}
						onClick={(e) => {
							e.stopPropagation();
							selectOption(option);
							setIsOpen(false);
						}}
						onMouseEnter={() => setHighlightedIndex(index)}
						className={`${style.option} ${
							isOptionSelected(option) ? style.selected : ''
						} ${index === highlightedIndex ? style.highlighted : ''}`}
					>
						{option.label}
					</li>
				))}
			</ul>
		</div>
	);
}
