import { useTranslation } from 'react-i18next';

interface ApplyStepperHeaderProps {
	steps: string[];
	currentStep: number;
	onSelectStep: (index: number) => void;
}

export default function ApplyStepperHeader({
	steps,
	currentStep,
	onSelectStep,
}: ApplyStepperHeaderProps) {
	const { t } = useTranslation();

	return (
		<div className='flex items-center mb-8 gap-0'>
			{steps.map((label, i) => {
				const isCompleted = i < currentStep;
				const isCurrent = i === currentStep;
				const canClick = i <= currentStep;

				return (
					<button
						key={i}
						type='button'
						disabled={!canClick}
						onClick={() => canClick && onSelectStep(i)}
						className={`flex-1 flex flex-col items-center group focus:outline-none ${
							canClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
						}`}
					>
						<div
							className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
								isCompleted
									? 'bg-blue-600 border-blue-600 text-white group-hover:scale-105'
									: isCurrent
									? 'bg-white border-blue-600 text-blue-600 shadow-md group-hover:scale-105'
									: 'bg-white border-gray-200 text-gray-400'
							}`}
						>
							{isCompleted ? '✓' : i + 1}
						</div>
						<span
							className={`text-xs mt-1 text-center transition-colors ${
								isCurrent
									? 'text-blue-600 font-semibold'
									: isCompleted
									? 'text-gray-600 group-hover:text-blue-600'
									: 'text-gray-400'
							}`}
						>
							{t(label)}
						</span>
					</button>
				);
			})}
		</div>
	);
}
