import React from 'react';

interface PersonalDocType {
	id: string;
	label: string;
}

interface AddPersonalDocumentModalProps {
	isOpen: boolean;
	onClose: () => void;
	docTypes: PersonalDocType[];
	selectedDocType: string;
	onSelectDocType: (type: string) => void;
	docDesc: string;
	onDescChange: (desc: string) => void;
	onFileChange: (file: File | null) => void;
	onSubmit: (e: React.FormEvent) => void;
	uploading: boolean;
	hasFile: boolean;
}

export const AddPersonalDocumentModal: React.FC<AddPersonalDocumentModalProps> = ({
	isOpen,
	onClose,
	docTypes,
	selectedDocType,
	onSelectDocType,
	docDesc,
	onDescChange,
	onFileChange,
	onSubmit,
	uploading,
	hasFile,
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
				<div className="flex items-center justify-between border-b border-slate-100 pb-3">
					<h3 className="text-sm font-bold text-slate-900">Прикрепить документ заявителя</h3>
					<button
						type="button"
						onClick={onClose}
						className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
					>
						✕
					</button>
				</div>

				<form onSubmit={onSubmit} className="space-y-3.5 text-xs">
					<div>
						<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
							Тип документа *
						</label>
						<select
							value={selectedDocType}
							onChange={(e) => onSelectDocType(e.target.value)}
							className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800"
						>
							{docTypes.map((t) => (
								<option key={t.id} value={t.id}>
									{t.label}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
							Описание / Примечание
						</label>
						<input
							type="text"
							value={docDesc}
							onChange={(e) => onDescChange(e.target.value)}
							placeholder="Например: Квитанция РСК Банк № 10248"
							className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
						>
						</input>
					</div>

					<div>
						<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
							Файл документа (PDF, JPG, PNG) *
						</label>
						<input
							type="file"
							required
							accept=".pdf,.jpg,.jpeg,.png,.webp"
							onChange={(e) => onFileChange(e.target.files?.[0] || null)}
							className="w-full file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#283375] file:text-white file:font-semibold text-xs cursor-pointer"
						/>
					</div>

					<div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
						>
							Отмена
						</button>
						<button
							type="submit"
							disabled={uploading || !hasFile}
							className="px-5 py-2 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white font-bold disabled:opacity-50 cursor-pointer"
						>
							{uploading ? 'Загрузка...' : 'Прикрепить документ'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
