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
			{steps.map((label, i) => (
				<button
					key={i}
					type='button'
					onClick={() => onSelectStep(i)}
					className='flex-1 flex flex-col items-center group cursor-pointer focus:outline-none'
				>
					<div
						className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
							i < currentStep
								? 'bg-blue-600 border-blue-600 text-white group-hover:scale-105'
								: i === currentStep
								? 'bg-white border-blue-600 text-blue-600 shadow-md group-hover:scale-105'
								: 'bg-white border-gray-200 text-gray-400 group-hover:border-blue-400 group-hover:text-blue-500'
						}`}
					>
						{i < currentStep ? '✓' : i + 1}
					</div>
					<span
						className={`text-xs mt-1 text-center transition-colors ${
							i === currentStep ? 'text-blue-600 font-semibold' : 'text-gray-400 group-hover:text-gray-600'
						}`}
					>
						{t(label)}
					</span>
				</button>
			))}
		</div>
	);
}
