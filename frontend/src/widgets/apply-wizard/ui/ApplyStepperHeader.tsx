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
				const isCurrent = i === currentStep;

				return (
					<button
						key={i}
						type='button'
						onClick={() => onSelectStep(i)}
						className='flex-1 flex flex-col items-center group cursor-pointer focus:outline-none'
					>
						<div
							className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
								isCurrent
									? 'bg-blue-600 border-blue-600 text-white shadow-md scale-105'
									: 'bg-white border-gray-300 text-gray-600 group-hover:border-blue-400 group-hover:text-blue-600'
							}`}
						>
							{i + 1}
						</div>
						<span
							className={`text-xs mt-1 text-center transition-colors ${
								isCurrent
									? 'text-blue-600 font-semibold'
									: 'text-gray-500 group-hover:text-blue-600'
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
