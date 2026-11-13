// frontend/src/features/dossier-modals/ui/DeleteDossierModal.tsx
import React from 'react';
import { ConfirmDeleteDialog } from '../../status-change';

interface DeleteDossierModalProps {
	isOpen: boolean;
	onClose: () => void;
	fullName: string;
	registrationNumber: string;
	onConfirm: () => void;
	deleting: boolean;
}

export const DeleteDossierModal: React.FC<DeleteDossierModalProps> = ({
	isOpen,
	onClose,
	fullName,
	registrationNumber,
	onConfirm,
	deleting,
}) => {
	return (
		<ConfirmDeleteDialog
			isOpen={isOpen}
			title="Удалить дело специалиста?"
			description={
				<span>
					Вы действительно хотите удалить дело специалиста <b>«{fullName}»</b> (№ {registrationNumber})?
					Запись будет безвозвратно удалена из государственного реестра.
				</span>
			}
			confirmText="Да, удалить дело"
			cancelText="Отмена"
			isDeleting={deleting}
			onConfirm={onConfirm}
			onCancel={onClose}
		/>
	);
};
