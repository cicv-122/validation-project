#!/usr/bin/env python3
"""
scripts/refactor_staff_dashboard.py
Декомпозиция StaffDashboard.tsx: замена громоздких монолитных блоков
на FSD-виджеты и фичи с помощью точных строковых маркеров.
"""

from pathlib import Path

FILE_PATH = Path(__file__).resolve().parent.parent / "frontend/src/pages/staff/StaffDashboard.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# --- 1. Applications section ---
start_marker_1 = "{/* ---------------- РЕЖИМ 1: ЗАЯВКИ КАНДИДАТОВ ---------------- */}"
end_marker_1 = "{/* ---------------- РЕЖИМ 2: АРХИВ ВЫДАННЫХ СЕРТИФИКАТОВ (759) ---------------- */}"

idx_s1 = content.find(start_marker_1)
idx_e1 = content.find(end_marker_1)

assert idx_s1 != -1 and idx_e1 != -1, "Could not find markers for Section 1"

apps_replacement = """{/* ---------------- РЕЖИМ 1: ЗАЯВКИ КАНДИДАТОВ ---------------- */}
				{activeMainTab === 'applications' && (
					<div className="space-y-6">
						<ApplicationsStatsBar
							profile={profile}
							onOpenMinistryReport={() => setShowMinistryReportModal(true)}
						/>
						<ApplicationsStatusCards
							profile={profile}
							activeStatus={activeAppStatus}
							onStatusChange={(status) => setActiveAppStatus(status)}
						/>
						<ApplicationsQueueTable
							loading={loadingApps}
							applications={applications}
							profile={profile}
							activeAppStatus={activeAppStatus}
							appSearchQuery={appSearchQuery}
							onOpenApplication={(id) => openApplication(id)}
							onResetFilters={() => {
								setActiveAppStatus('');
								setAppSearchQuery('');
							}}
							onStatusChange={(status) => setActiveAppStatus(status)}
							onSearchChange={(query) => setAppSearchQuery(query)}
							onSearchSubmit={handleAppSearch}
						/>
					</div>
				)}

				"""

content = content[:idx_s1] + apps_replacement + content[idx_e1:]
print("✓ Section 1 (Applications) successfully replaced")

# --- 2. Registry section ---
start_marker_2 = "{/* ---------------- РЕЖИМ 2: АРХИВ ВЫДАННЫХ СЕРТИФИКАТОВ (759) ---------------- */}"
end_marker_2 = "</main>"

idx_s2 = content.find(start_marker_2)
idx_e2 = content.find(end_marker_2, idx_s2)

assert idx_s2 != -1 and idx_e2 != -1, "Could not find markers for Section 2"

registry_replacement = """{/* ---------------- РЕЖИМ 2: АРХИВ ВЫДАННЫХ СЕРТИФИКАТОВ (759) ---------------- */}
				{activeMainTab === 'certified_registry' && (
					<div className="space-y-6">
						<DigitizationArchiveHero
							profile={profile}
							certifiedTotal={certifiedTotal}
						/>
						<CertifiedClustersBar
							totalRegistryCount={profile?.stats?.registry_total || 827}
							withInnCount={profile?.stats?.registry_with_inn || 0}
							withoutInnCount={
								profile?.stats?.registry_without_inn ??
								((profile?.stats?.registry_total || 827) - (profile?.stats?.registry_with_inn || 0))
							}
							hasInnFilter={certifiedHasInn}
							onHasInnFilterChange={(val) => {
								setCertifiedHasInn(val);
								loadCertifiedList(1, undefined, val);
							}}
							searchQuery={certifiedSearch}
							onSearchQueryChange={(val) => setCertifiedSearch(val)}
							onSearchSubmit={handleCertifiedSearch}
							clusters={certifiedClustersList}
							activeCluster={certifiedCluster}
							onClusterChange={(nextKey) => {
								setCertifiedCluster(nextKey);
								let nextInn = certifiedHasInn;
								if (nextKey && certifiedHasInn === 'true') {
									nextInn = '';
									setCertifiedHasInn('');
								}
								loadCertifiedList(1, nextKey, nextInn);
							}}
						/>
						<CertifiedSpecialistsTable
							loading={loadingCertified}
							certifiedList={certifiedList}
							certifiedTotal={certifiedTotal}
							certifiedPage={certifiedPage}
							onPageChange={(page) => loadCertifiedList(page)}
							onDeleteSpecialist={(item) => setDeletingSpecialist(item)}
							candidateDossierState={candidateDossierState}
							certifiedCluster={certifiedCluster}
							certifiedClustersList={certifiedClustersList}
							certifiedHasInn={certifiedHasInn}
							certifiedSearch={certifiedSearch}
							onResetCluster={() => {
								setCertifiedCluster('');
								loadCertifiedList(1, '');
							}}
							onResetHasInn={() => {
								setCertifiedHasInn('');
								loadCertifiedList(1, undefined, '');
							}}
							onResetSearch={() => {
								setCertifiedSearch('');
								loadCertifiedList(1, undefined, undefined, '');
							}}
						/>
					</div>
				)}
			"""

content = content[:idx_s2] + registry_replacement + content[idx_e2:]
print("✓ Section 2 (Registry) successfully replaced")

# --- 3. Dossier Document Slots in Modal ---
start_marker_3 = "{/* БЛОК 4: ОФИЦИАЛЬНЫЕ ДОКУМЕНТЫ ДЕЛА КАНДИДАТА (КОМПАКТНЫЙ РЕЖИМ) */}"
end_marker_3 = "{/* БЛОК 5: ВЫПУСК ГОСУДАРСТВЕННОГО СЕРТИФИКАТА В РЕЕСТР */}"

idx_s3 = content.find(start_marker_3)
idx_e3 = content.find(end_marker_3, idx_s3)

assert idx_s3 != -1 and idx_e3 != -1, "Could not find markers for Section 3"

docs_replacement = """{/* БЛОК 4: ОФИЦИАЛЬНЫЕ ДОКУМЕНТЫ ДЕЛА КАНДИДАТА */}
									{appDetail && (
										<DossierDocumentSlots
											documents={appDetail.documents}
											uploadingDoc={uploadingDoc}
											onUploadFiles={uploadFilesDirectly}
											onDeleteDoc={handleDeleteDoc}
										/>
									)}

									"""

content = content[:idx_s3] + docs_replacement + content[idx_e3:]
print("✓ Section 3 (Document slots) successfully replaced")

# --- 4. Bottom Modals ---
start_marker_4 = "{/* МОДАЛЬНОЕ ОКНО ПОДКЛЮЧЕНИЯ TELEGRAM"
end_marker_4 = "</div>\n\t);\n}"

idx_s4 = content.find(start_marker_4)
idx_e4 = content.rfind(end_marker_4)

assert idx_s4 != -1 and idx_e4 != -1, "Could not find markers for Section 4"

modals_replacement = """{/* МОДАЛЬНОЕ ОКНО ПОДКЛЮЧЕНИЯ TELEGRAM */}
			<TelegramConnectModal
				isOpen={showTelegramModal}
				onClose={() => setShowTelegramModal(false)}
				profile={profile}
				onCheckStatus={async () => {
					await loadProfile();
					if (profile?.is_telegram_connected) {
						setShowTelegramModal(false);
					}
				}}
			/>

			{/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ ЗАЯВКИ */}
			<ConfirmDeleteDialog
				isOpen={showDeleteConfirm}
				title="Удалить заявку кандидата?"
				description={
					<span>
						Заявка кандидата <b>«{appDetail?.full_name}»</b> (№ {appDetail?.short_registration_number}) будет перемещена в архив ЦНСВ и исключена из активных списков.
					</span>
				}
				isDeleting={isDeletingApp}
				onCancel={() => setShowDeleteConfirm(false)}
				onConfirm={handleDeleteApplication}
			/>

			{/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ СПЕЦИАЛИСТА ИЗ РЕЕСТРА */}
			<ConfirmDeleteDialog
				isOpen={Boolean(deletingSpecialist)}
				title="Удалить специалиста из реестра?"
				description={
					<span>
						Вы уверены, что хотите удалить <b>«{deletingSpecialist?.full_name}»</b> ({deletingSpecialist?.registration_number}) из государственного реестра? Это действие нельзя отменить.
					</span>
				}
				isDeleting={isDeletingSpecialist}
				onCancel={() => setDeletingSpecialist(null)}
				onConfirm={handleDeleteSpecialist}
			/>

			{/* МОДАЛЬНОЕ ОКНО: ОФИЦИАЛЬНАЯ СВОДКА ДЛЯ МИНИСТЕРСТВА ПРОСВЕЩЕНИЯ КР */}
			<MinistryReportModal
				isOpen={showMinistryReportModal}
				onClose={() => setShowMinistryReportModal(false)}
				profile={profile}
				applications={applications}
			/>
		"""

content = content[:idx_s4] + modals_replacement + content[idx_e4:]
print("✓ Section 4 (Modals) successfully replaced")

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("StaffDashboard.tsx successfully refactored and updated!")
