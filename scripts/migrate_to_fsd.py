#!/usr/bin/env python3
"""
scripts/migrate_to_fsd.py
Скрипт поэтапной безопасной миграции фронтенда на Feature-Sliced Design (FSD).

Функционал:
0. Проверяет и настраивает path aliases в frontend/tsconfig.app.json и frontend/vite.config.ts
1. Создаёт целевую структуру директорий FSD: app, pages, widgets, features, entities, shared
2. Анализирует существующие файлы в frontend/src (строки, импорты, сложность, предлагаемый слой FSD)
3. Генерирует audit-отчёт: migration-audit.json
4. Генерирует приоритезированный todo-список: migration-todo.md
5. Создаёт barrel exports в frontend/src/legacy/index.ts для сохранения обратной совместимости
"""

import json
import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend"
SRC_DIR = FRONTEND_DIR / "src"

FSD_DIRS = [
    # app
    "app/providers",
    "app/router",
    "app/styles",
    "app/stores",
    # pages
    "pages/home",
    "pages/apply",
    "pages/news",
    "pages/news-detail",
    "pages/contacts",
    "pages/assessment-centers",
    "pages/certified-users",
    "pages/video-gallery",
    "pages/verify-certificate",
    "pages/staff-login",
    "pages/staff-dashboard",
    "pages/staff-candidate-dossier",
    # widgets
    "widgets/candidate-registry/ui",
    "widgets/assessment-queue/ui",
    "widgets/dossier-viewer/ui",
    "widgets/digitization-stats/ui",
    "widgets/apply-wizard/ui",
    "widgets/navbar/ui",
    "widgets/footer/ui",
    "widgets/staff-header/ui",
    # features
    "features/auth-staff/ui",
    "features/candidate-filter/ui",
    "features/status-change/ui",
    "features/dossier-approve/ui",
    "features/upload-documents/ui",
    "features/apply-form/ui",
    "features/pin-search/ui",
    # entities
    "entities/candidate/ui",
    "entities/candidate/model",
    "entities/candidate/api",
    "entities/assessment/ui",
    "entities/assessment/model",
    "entities/assessment/api",
    "entities/certificate/ui",
    "entities/certificate/model",
    "entities/certificate/api",
    "entities/profession/ui",
    "entities/profession/model",
    "entities/profession/api",
    "entities/staff-profile/ui",
    "entities/staff-profile/model",
    "entities/staff-profile/api",
    # shared
    "shared/ui",
    "shared/api",
    "shared/lib",
    "shared/hooks",
    "shared/config",
    "legacy",
]


def setup_path_aliases():
    """Настройка path aliases в tsconfig.app.json и vite.config.ts."""
    tsconfig_path = FRONTEND_DIR / "tsconfig.app.json"
    if tsconfig_path.exists():
        with open(tsconfig_path, "r", encoding="utf-8") as f:
            raw = f.read()

        try:
            data = json.loads(raw)
            compiler_options = data.setdefault("compilerOptions", {})
            compiler_options["baseUrl"] = "."
            paths = compiler_options.setdefault("paths", {})
            aliases = {
                "@/*": ["src/*"],
                "@app/*": ["src/app/*"],
                "@pages/*": ["src/pages/*"],
                "@widgets/*": ["src/widgets/*"],
                "@features/*": ["src/features/*"],
                "@entities/*": ["src/entities/*"],
                "@shared/*": ["src/shared/*"],
            }
            updated = False
            for alias, target in aliases.items():
                if alias not in paths:
                    paths[alias] = target
                    updated = True
            if updated:
                with open(tsconfig_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                print("  ✓ Обновлён tsconfig.app.json (добавлены path aliases)")
        except Exception as e:
            print(f"  ⚠ Не удалось распарсить tsconfig.app.json как JSON: {e}")

    vite_config_path = FRONTEND_DIR / "vite.config.ts"
    if vite_config_path.exists():
        with open(vite_config_path, "r", encoding="utf-8") as f:
            content = f.read()

        if "path.resolve" not in content and "@app" not in content:
            # Добавим импорт path и resolve alias
            import_path_stmt = "import path from 'path';\n"
            if "import path" not in content:
                content = import_path_stmt + content

            alias_block = """\n\tresolve: {
\t\talias: {
\t\t\t'@': path.resolve(__dirname, './src'),
\t\t\t'@app': path.resolve(__dirname, './src/app'),
\t\t\t'@pages': path.resolve(__dirname, './src/pages'),
\t\t\t'@widgets': path.resolve(__dirname, './src/widgets'),
\t\t\t'@features': path.resolve(__dirname, './src/features'),
\t\t\t'@entities': path.resolve(__dirname, './src/entities'),
\t\t\t'@shared': path.resolve(__dirname, './src/shared'),
\t\t},
\t},"""
            # Вставляем resolve перед server или build
            if "server: {" in content:
                content = content.replace("server: {", alias_block + "\n\tserver: {")
            elif "plugins: [" in content:
                content = re.sub(r"(plugins:\s*\[[^\]]*\],)", r"\1" + alias_block, content)

            with open(vite_config_path, "w", encoding="utf-8") as f:
                f.write(content)
            print("  ✓ Обновлён vite.config.ts (добавлен resolve.alias)")


def scaffold_fsd_structure():
    """Создаёт целевую структуру FSD директорий и начальные index.ts."""
    created_count = 0
    for rel_dir in FSD_DIRS:
        target_dir = SRC_DIR / rel_dir
        if not target_dir.exists():
            target_dir.mkdir(parents=True, exist_ok=True)
            created_count += 1

    # Создаём шаблонные index.ts для ключевых слайсов если их нет
    template_slices = [
        ("widgets/candidate-registry", "// Candidate registry widget\nexport {};\n"),
        ("widgets/assessment-queue", "// Assessment queue widget\nexport {};\n"),
        ("widgets/dossier-viewer", "// Dossier viewer widget\nexport {};\n"),
        ("widgets/digitization-stats", "// Digitization stats widget\nexport {};\n"),
        ("features/candidate-filter", "// Candidate filter feature\nexport {};\n"),
        ("features/status-change", "// Status change feature\nexport {};\n"),
        ("features/dossier-approve", "// Dossier approve feature\nexport {};\n"),
        ("features/upload-documents", "// Upload documents feature\nexport {};\n"),
        ("entities/candidate", "// Candidate entity\nexport {};\n"),
        ("entities/assessment", "// Assessment entity\nexport {};\n"),
        ("entities/certificate", "// Certificate entity\nexport {};\n"),
        ("entities/profession", "// Profession entity\nexport {};\n"),
        ("entities/staff-profile", "// Staff profile entity\nexport {};\n"),
        ("shared/ui", "// Shared UI components barrel\nexport {};\n"),
        ("shared/lib", "// Shared utility functions\nexport {};\n"),
        ("shared/api", "// Shared api client\nexport {};\n"),
        ("shared/hooks", "// Shared hooks\nexport {};\n"),
        ("shared/config", "// Shared configuration\nexport {};\n"),
    ]

    for slice_path, content in template_slices:
        idx_file = SRC_DIR / slice_path / "index.ts"
        if not idx_file.exists():
            idx_file.parent.mkdir(parents=True, exist_ok=True)
            with open(idx_file, "w", encoding="utf-8") as f:
                f.write(content)
            created_count += 1

    print(f"  ✓ Создано/проверено {created_count} FSD директорий и точек входа")


def analyze_existing_files():
    """Анализирует все .ts/.tsx файлы и формирует migration-audit.json и migration-todo.md."""
    audit_results = []
    
    # Исключаем целевые FSD папки и legacy из сканирования существующих компонентов
    scan_dirs = [SRC_DIR / "components", SRC_DIR / "pages", SRC_DIR / "api", SRC_DIR / "hooks", SRC_DIR / "utils"]

    all_files = []
    for d in scan_dirs:
        if d.exists():
            all_files.extend(list(d.rglob("*.tsx")) + list(d.rglob("*.ts")))

    import_regex = re.compile(r"import\s+.*?from\s+['\"](.*?)['\"];?")

    for file_path in sorted(all_files):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
        except Exception:
            continue

        line_count = len(lines)
        imports = []
        for line in lines:
            m = import_regex.search(line)
            if m:
                imports.append(m.group(1))

        rel_path = str(file_path.relative_to(SRC_DIR))

        # Определение предложенного слоя FSD
        suggested_layer = "shared"
        if "pages/staff/StaffDashboard" in rel_path or "pages/staff/StaffCandidateDossier" in rel_path or "pages/Apply" in rel_path:
            suggested_layer = "widgets/features/entities"
        elif "pages/" in rel_path:
            suggested_layer = "pages"
        elif "components/apply/" in rel_path:
            suggested_layer = "features/apply-form"
        elif "components/staff/" in rel_path:
            suggested_layer = "widgets/staff-header"
        elif "components/ui/" in rel_path:
            suggested_layer = "shared/ui"
        elif "components/" in rel_path:
            suggested_layer = "widgets"
        elif "api/" in rel_path:
            suggested_layer = "entities/api"
        elif "hooks/" in rel_path:
            suggested_layer = "shared/hooks"
        elif "utils/" in rel_path:
            suggested_layer = "shared/lib"

        if line_count > 500:
            priority = "high"
        elif line_count >= 200:
            priority = "medium"
        else:
            priority = "low"

        audit_results.append({
            "file": rel_path,
            "lines": line_count,
            "imports_count": len(imports),
            "suggested_layer": suggested_layer,
            "priority": priority,
        })

    # Сортируем: сначала high priority по убыванию строк
    audit_results.sort(key=lambda x: (0 if x["priority"] == "high" else 1 if x["priority"] == "medium" else 2, -x["lines"]))

    # Сохраняем migration-audit.json
    audit_file = ROOT_DIR / "migration-audit.json"
    with open(audit_file, "w", encoding="utf-8") as f:
        json.dump(audit_results, f, indent=2, ensure_ascii=False)
    print(f"  ✓ Сгенерирован аудит файлов: {audit_file.name} ({len(audit_results)} файлов проанализировано)")

    # Сохраняем migration-todo.md
    todo_file = ROOT_DIR / "migration-todo.md"
    high_count = sum(1 for a in audit_results if a["priority"] == "high")
    med_count = sum(1 for a in audit_results if a["priority"] == "medium")
    low_count = sum(1 for a in audit_results if a["priority"] == "low")

    lines = [
        "# Migration TODO: Feature-Sliced Design (FSD)",
        "",
        f"**Общий аудит**: {len(audit_results)} файлов | 🔴 Высокий (>500 строк): {high_count} | 🟡 Средний (200-500): {med_count} | 🟢 Низкий (<200): {low_count}",
        "",
        "## 🔴 Фаза 1: Декомпозиция монолитов (Priority High)",
    ]

    for item in audit_results:
        if item["priority"] == "high":
            lines.append(f"- [ ] `{item['file']}` ({item['lines']} строк) → `{item['suggested_layer']}`")

    lines.append("")
    lines.append("## 🟡 Фаза 2: Компоненты средней сложности (Priority Medium)")
    for item in audit_results:
        if item["priority"] == "medium":
            lines.append(f"- [ ] `{item['file']}` ({item['lines']} строк) → `{item['suggested_layer']}`")

    lines.append("")
    lines.append("## 🟢 Фаза 3: Мелкие компоненты и утилиты (Priority Low)")
    for item in audit_results:
        if item["priority"] == "low":
            lines.append(f"- [ ] `{item['file']}` ({item['lines']} строк) → `{item['suggested_layer']}`")

    with open(todo_file, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"  ✓ Сгенерирован план миграции: {todo_file.name} (найдено {high_count} монолитов)")


def create_legacy_barrel():
    """Создаёт временный frontend/src/legacy/index.ts с re-exports для обратной совместимости."""
    legacy_file = SRC_DIR / "legacy" / "index.ts"
    content = """// Legacy barrel exports to maintain backwards compatibility during FSD migration
export * from '../components/Navbar';
export * from '../components/Footer';
export * from '../components/ui';
export * from '../utils/kyrgyzPinValidator';
"""
    with open(legacy_file, "w", encoding="utf-8") as f:
        f.write(content)
    print("  ✓ Создан legacy barrel export: frontend/src/legacy/index.ts")


def main():
    print("🚀 [FSD Migration] Старт поэтапной миграции фронтенда...")
    setup_path_aliases()
    scaffold_fsd_structure()
    analyze_existing_files()
    create_legacy_barrel()
    print("✅ [FSD Migration] Базовая структура FSD успешно развернута без повреждения существующих файлов!")


if __name__ == "__main__":
    main()
