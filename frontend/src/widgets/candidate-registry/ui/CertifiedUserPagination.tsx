// frontend/src/widgets/candidate-registry/ui/CertifiedUserPagination.tsx
import { Pagination } from '../../../shared/ui';

interface CertifiedUserPaginationProps {
	page: number;
	totalPages: number;
	isFetching: boolean;
	onPageChange: (newPage: number) => void;
}

export default function CertifiedUserPagination({
	page,
	totalPages,
	isFetching,
	onPageChange,
}: CertifiedUserPaginationProps) {
	return (
		<Pagination
			page={page}
			totalPages={totalPages}
			isFetching={isFetching}
			onPageChange={onPageChange}
			className="mt-10"
		/>
	);
}
