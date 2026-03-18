import { useTranslation } from 'react-i18next';
import { DarkModeToggle } from '../../../../shared/view/ui';
import type { CodeEditorSettingsState, ProjectSortOrder } from '../../types/types';
import LanguageSelector from '../../../../shared/view/ui/LanguageSelector';
import SettingsCard from '../SettingsCard';
import SettingsRow from '../SettingsRow';
import SettingsSection from '../SettingsSection';
import SettingsToggle from '../SettingsToggle';
import { useInstanceSettings, isValidHexColor } from '../../../../hooks/useInstanceSettings';

const PRESET_COLORS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#22c55e', label: 'Green' },
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#6366f1', label: 'Indigo' },
];

type AppearanceSettingsTabProps = {
  projectSortOrder: ProjectSortOrder;
  onProjectSortOrderChange: (value: ProjectSortOrder) => void;
  codeEditorSettings: CodeEditorSettingsState;
  onCodeEditorThemeChange: (value: 'dark' | 'light') => void;
  onCodeEditorWordWrapChange: (value: boolean) => void;
  onCodeEditorShowMinimapChange: (value: boolean) => void;
  onCodeEditorLineNumbersChange: (value: boolean) => void;
  onCodeEditorFontSizeChange: (value: string) => void;
};

export default function AppearanceSettingsTab({
  projectSortOrder,
  onProjectSortOrderChange,
  codeEditorSettings,
  onCodeEditorThemeChange,
  onCodeEditorWordWrapChange,
  onCodeEditorShowMinimapChange,
  onCodeEditorLineNumbersChange,
  onCodeEditorFontSizeChange,
}: AppearanceSettingsTabProps) {
  const { t } = useTranslation('settings');
  const { instanceName, accentColor, setInstanceName, setAccentColor } = useInstanceSettings();

  // Only use a color in inline styles if it's a validated hex value
  const safeAccentColor = isValidHexColor(accentColor) ? accentColor : '';
  const isCustomColor = safeAccentColor && !PRESET_COLORS.some((c) => c.value === safeAccentColor);

  return (
    <div className="space-y-8">
      <SettingsSection title={t('appearanceSettings.instanceSettings.title')}>
        <SettingsCard divided>
          <SettingsRow
            label={t('appearanceSettings.instanceSettings.instanceName.label')}
            description={t('appearanceSettings.instanceSettings.instanceName.description')}
          >
            <input
              type="text"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              placeholder={t('appearanceSettings.instanceSettings.instanceName.placeholder')}
              className="w-full rounded-lg border border-input bg-card p-2.5 text-sm text-foreground touch-manipulation focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-56"
            />
          </SettingsRow>

          <SettingsRow
            label={t('appearanceSettings.instanceSettings.accentColor.label')}
            description={t('appearanceSettings.instanceSettings.accentColor.description')}
          >
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  title={color.label}
                  aria-label={color.label}
                  aria-pressed={accentColor === color.value}
                  onClick={() => setAccentColor(accentColor === color.value ? '' : color.value)}
                  className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                  style={{
                    backgroundColor: color.value,
                    borderColor: accentColor === color.value ? 'white' : color.value,
                    boxShadow: accentColor === color.value ? `0 0 0 2px ${color.value}` : undefined,
                  }}
                />
              ))}

              {/* Custom color picker */}
              <label
                title="Custom color"
                className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/40 transition-transform hover:scale-110"
                style={isCustomColor ? { borderColor: safeAccentColor, boxShadow: `0 0 0 2px ${safeAccentColor}` } : undefined}
              >
                <input
                  type="color"
                  value={safeAccentColor || '#3b82f6'}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Custom color"
                />
                <span
                  className="flex h-full w-full items-center justify-center text-[10px] font-bold text-muted-foreground/60"
                  style={isCustomColor ? { backgroundColor: safeAccentColor, color: 'white' } : undefined}
                >
                  {isCustomColor ? '' : '+'}
                </span>
              </label>

              {safeAccentColor && (
                <button
                  type="button"
                  onClick={() => setAccentColor('')}
                  className="rounded px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {t('appearanceSettings.instanceSettings.accentColor.reset')}
                </button>
              )}
            </div>
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title={t('appearanceSettings.darkMode.label')}>
        <SettingsCard>
          <SettingsRow
            label={t('appearanceSettings.darkMode.label')}
            description={t('appearanceSettings.darkMode.description')}
          >
            <DarkModeToggle ariaLabel={t('appearanceSettings.darkMode.label')} />
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title={t('mainTabs.appearance')}>
        <SettingsCard>
          <LanguageSelector />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title={t('appearanceSettings.projectSorting.label')}>
        <SettingsCard>
          <SettingsRow
            label={t('appearanceSettings.projectSorting.label')}
            description={t('appearanceSettings.projectSorting.description')}
          >
            <select
              value={projectSortOrder}
              onChange={(event) => onProjectSortOrderChange(event.target.value as ProjectSortOrder)}
              className="w-full rounded-lg border border-input bg-card p-2.5 text-sm text-foreground touch-manipulation focus:border-primary focus:ring-1 focus:ring-primary sm:w-36"
            >
              <option value="name">{t('appearanceSettings.projectSorting.alphabetical')}</option>
              <option value="date">{t('appearanceSettings.projectSorting.recentActivity')}</option>
            </select>
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title={t('appearanceSettings.codeEditor.title')}>
        <SettingsCard divided>
          <SettingsRow
            label={t('appearanceSettings.codeEditor.theme.label')}
            description={t('appearanceSettings.codeEditor.theme.description')}
          >
            <DarkModeToggle
              checked={codeEditorSettings.theme === 'dark'}
              onToggle={(enabled) => onCodeEditorThemeChange(enabled ? 'dark' : 'light')}
              ariaLabel={t('appearanceSettings.codeEditor.theme.label')}
            />
          </SettingsRow>

          <SettingsRow
            label={t('appearanceSettings.codeEditor.wordWrap.label')}
            description={t('appearanceSettings.codeEditor.wordWrap.description')}
          >
            <SettingsToggle
              checked={codeEditorSettings.wordWrap}
              onChange={onCodeEditorWordWrapChange}
              ariaLabel={t('appearanceSettings.codeEditor.wordWrap.label')}
            />
          </SettingsRow>

          <SettingsRow
            label={t('appearanceSettings.codeEditor.showMinimap.label')}
            description={t('appearanceSettings.codeEditor.showMinimap.description')}
          >
            <SettingsToggle
              checked={codeEditorSettings.showMinimap}
              onChange={onCodeEditorShowMinimapChange}
              ariaLabel={t('appearanceSettings.codeEditor.showMinimap.label')}
            />
          </SettingsRow>

          <SettingsRow
            label={t('appearanceSettings.codeEditor.lineNumbers.label')}
            description={t('appearanceSettings.codeEditor.lineNumbers.description')}
          >
            <SettingsToggle
              checked={codeEditorSettings.lineNumbers}
              onChange={onCodeEditorLineNumbersChange}
              ariaLabel={t('appearanceSettings.codeEditor.lineNumbers.label')}
            />
          </SettingsRow>

          <SettingsRow
            label={t('appearanceSettings.codeEditor.fontSize.label')}
            description={t('appearanceSettings.codeEditor.fontSize.description')}
          >
            <select
              value={codeEditorSettings.fontSize}
              onChange={(event) => onCodeEditorFontSizeChange(event.target.value)}
              className="w-full rounded-lg border border-input bg-card p-2.5 text-sm text-foreground touch-manipulation focus:border-primary focus:ring-1 focus:ring-primary sm:w-28"
            >
              <option value="10">10px</option>
              <option value="11">11px</option>
              <option value="12">12px</option>
              <option value="13">13px</option>
              <option value="14">14px</option>
              <option value="15">15px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
            </select>
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>
    </div>
  );
}

