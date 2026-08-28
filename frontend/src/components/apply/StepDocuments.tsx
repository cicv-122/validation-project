import { useTranslation } from 'react-i18next';

interface DocUpload {
	file: File;
	doc_type: string;
	description: string;
}

const DOC_TYPES = [
	{ value: 'resume', label: 'Резюме (ФИО, год рождения, специальность, контакты, email)' },
	{ value: 'passport', label: 'Паспорт (копия)' },
	{ value: 'photo', label: 'Фото 3.5 × 4.5 см' },
	{ value: 'diploma', label: 'Дипломы, сертификаты или свидетельства, грамоты, курсы' },
	{ value: 'work_sample', label: 'Образцы результатов работы или видео/фотографии' },
];

interface StepDocumentsProps {
	documents: DocUpload[];
	onDocAdd: (e: React.ChangeEvent<HTMLInputElement>, doc_type: string) => void;
}

export default function StepDocuments({ documents, onDocAdd }: StepDocumentsProps) {
	const { t } = useTranslation();

	return (
		<div>
			<h2 className='text-xl font-bold text-gray-800 mb-2 flex items-center gap-2'>
				<span className='w-7 h-7 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center'>3</span>
				{t('Документы портфолио')}
			</h2>
			<p className='text-sm text-gray-500 mb-6'>
				{t('Загрузите документы, подтверждающие вашу профессиональную квалификацию. Рекомендуется приложить все доступные документы.')}
			</p>
			<div className='space-y-4'>
				{DOC_TYPES.map(dt => {
					const uploaded = documents.find(d => d.doc_type === dt.value);
					return (
						<div
							key={dt.value}
							className={`rounded-xl border-2 p-4 transition-all ${
								uploaded ? 'border-green-400 bg-green-50' : 'border-gray-200'
							}`}
						>
							<div className='flex items-start justify-between gap-3'>
								<div className='flex-1'>
									<p className='text-sm font-medium text-gray-800'>{dt.label}</p>
									{uploaded && (
										<p className='text-xs text-green-600 mt-1 flex items-center gap-1'>
											<svg className='w-3.5 h-3.5' fill='currentColor' viewBox='0 0 20 20'>
												<path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
											</svg>
											{uploaded.file.name}
										</p>
									)}
								</div>
								<label className='cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap'>
									{uploaded ? 'Заменить' : 'Выбрать файл'}
									<input
										type='file'
										className='sr-only'
										accept='.pdf,.jpg,.jpeg,.png,.doc,.docx,.mp4,.mov'
										onChange={e => onDocAdd(e, dt.value)}
									/>
								</label>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
