import React, { useState } from 'react';
import { useTheme } from '../themes/ThemeContext';
import { ThemeConfig, ColorPalette } from '../themes/types';
import BackButton from './BackButton';
import './ThemeSettings.css';

const ThemeSettings: React.FC = () => {
    const { currentTheme, availableThemes, switchTheme, createCustomTheme, deleteCustomTheme } = useTheme();
    const [isCreatingCustom, setIsCreatingCustom] = useState(false);
    const [customThemeData, setCustomThemeData] = useState<Omit<ThemeConfig, 'id' | 'createdAt'>>({
        name: '',
        description: '',
        isCustom: true,
        colors: { ...currentTheme.colors }
    });

    const handleCreateCustomTheme = () => {
        if (customThemeData.name.trim()) {
            const newThemeId = createCustomTheme(customThemeData);
            switchTheme(newThemeId);
            setIsCreatingCustom(false);
            setCustomThemeData({
                name: '',
                description: '',
                isCustom: true,
                colors: { ...currentTheme.colors }
            });
        }
    };

    const handleColorChange = (colorKey: keyof ColorPalette, value: string) => {
        setCustomThemeData(prev => ({
            ...prev,
            colors: {
                ...prev.colors,
                [colorKey]: value
            }
        }));
    };

    const handleDeleteTheme = (themeId: string) => {
        if (window.confirm('Are you sure you want to delete this custom theme?')) {
            deleteCustomTheme(themeId);
        }
    };

    const getColorValue = (color: string): string => {
        // Extract solid color from gradients for color picker
        if (color.includes('linear-gradient')) {
            const match = color.match(/#[0-9a-f]{6}/i);
            return match ? match[0] : '#667eea';
        }
        return color;
    };

    const createGradient = (color1: string, color2: string): string => {
        return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    };

    return (
        <div className="theme-settings">
            <BackButton className="themed" />
            <div className="theme-settings-header">
                <h2>🎨 Theme Settings</h2>
                <p>Customize your productivity app experience with themes</p>
            </div>

            <div className="current-theme-section">
                <h3>Current Theme</h3>
                <div className="current-theme-card">
                    <div className="theme-preview" style={{ background: currentTheme.colors.background }}>
                        <div className="preview-surface" style={{ background: currentTheme.colors.surface }}>
                            <div className="preview-text" style={{ color: currentTheme.colors.text }}>
                                {currentTheme.name}
                            </div>
                            <div className="preview-badge" style={{
                                background: currentTheme.colors.primary,
                                color: 'white'
                            }}>
                                Sample
                            </div>
                        </div>
                    </div>
                    <div className="theme-info">
                        <h4>{currentTheme.name}</h4>
                        <p>{currentTheme.description}</p>
                        {currentTheme.isCustom && (
                            <button
                                className="delete-theme-btn"
                                onClick={() => handleDeleteTheme(currentTheme.id)}
                            >
                                🗑️ Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="theme-selection-section">
                <h3>Available Themes</h3>
                <div className="themes-grid">
                    {availableThemes.map(theme => (
                        <div
                            key={theme.id}
                            className={`theme-option ${currentTheme.id === theme.id ? 'active' : ''}`}
                            onClick={() => switchTheme(theme.id)}
                        >
                            <div className="theme-preview-small" style={{ background: theme.colors.background }}>
                                <div className="preview-surface-small" style={{ background: theme.colors.surface }}>
                                    <div className="preview-dot" style={{ background: theme.colors.primary }}></div>
                                </div>
                            </div>
                            <div className="theme-option-info">
                                <h5>{theme.name}</h5>
                                <p>{theme.description}</p>
                                {!theme.isCustom && (
                                    <div className="theme-details">
                                        <div className="color-chips">
                                            <div
                                                className="color-chip"
                                                style={{ background: theme.colors.primary }}
                                                title="Primary Color"
                                            ></div>
                                            <div
                                                className="color-chip"
                                                style={{ background: theme.colors.secondary }}
                                                title="Secondary Color"
                                            ></div>
                                            <div
                                                className="color-chip"
                                                style={{ background: theme.colors.success }}
                                                title="Success Color"
                                            ></div>
                                        </div>
                                    </div>
                                )}
                                {theme.isCustom && (
                                    <span className="custom-badge">Custom</span>
                                )}
                            </div>
                            {theme.isCustom && (
                                <button
                                    className="delete-theme-small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTheme(theme.id);
                                    }}
                                >
                                    ❌
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="custom-theme-section">
                <div className="section-header">
                    <h3>Create Custom Theme</h3>
                    <button
                        className="toggle-custom-btn"
                        onClick={() => setIsCreatingCustom(!isCreatingCustom)}
                    >
                        {isCreatingCustom ? '❌ Cancel' : '➕ New Theme'}
                    </button>
                </div>

                {isCreatingCustom && (
                    <div className="custom-theme-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Theme Name *</label>
                                <input
                                    type="text"
                                    value={customThemeData.name}
                                    onChange={(e) => setCustomThemeData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., My Awesome Theme"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={customThemeData.description}
                                    onChange={(e) => setCustomThemeData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Brief description of your theme"
                                />
                            </div>
                        </div>

                        <div className="color-customization">
                            <h4>🎨 Color Customization</h4>
                            <div className="color-grid">
                                <div className="color-group">
                                    <label>Primary Color</label>
                                    <input
                                        type="color"
                                        value={getColorValue(customThemeData.colors.primary)}
                                        onChange={(e) => {
                                            const newColor = e.target.value;
                                            handleColorChange('primary', newColor);
                                            // Auto-update background gradient
                                            handleColorChange('background', createGradient(newColor, customThemeData.colors.primaryDark));
                                        }}
                                    />
                                    <span>{customThemeData.colors.primary}</span>
                                </div>

                                <div className="color-group">
                                    <label>Primary Dark</label>
                                    <input
                                        type="color"
                                        value={getColorValue(customThemeData.colors.primaryDark)}
                                        onChange={(e) => {
                                            const newColor = e.target.value;
                                            handleColorChange('primaryDark', newColor);
                                            // Auto-update background gradient
                                            handleColorChange('background', createGradient(customThemeData.colors.primary, newColor));
                                        }}
                                    />
                                    <span>{customThemeData.colors.primaryDark}</span>
                                </div>

                                <div className="color-group">
                                    <label>Secondary</label>
                                    <input
                                        type="color"
                                        value={getColorValue(customThemeData.colors.secondary)}
                                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                                    />
                                    <span>{customThemeData.colors.secondary}</span>
                                </div>

                                <div className="color-group">
                                    <label>Surface (Cards)</label>
                                    <input
                                        type="color"
                                        value={getColorValue(customThemeData.colors.surface)}
                                        onChange={(e) => handleColorChange('surface', e.target.value)}
                                    />
                                    <span>{customThemeData.colors.surface}</span>
                                </div>

                                <div className="color-group">
                                    <label>Text</label>
                                    <input
                                        type="color"
                                        value={getColorValue(customThemeData.colors.text)}
                                        onChange={(e) => handleColorChange('text', e.target.value)}
                                    />
                                    <span>{customThemeData.colors.text}</span>
                                </div>

                                <div className="color-group">
                                    <label>Text Secondary</label>
                                    <input
                                        type="color"
                                        value={getColorValue(customThemeData.colors.textSecondary)}
                                        onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                                    />
                                    <span>{customThemeData.colors.textSecondary}</span>
                                </div>

                                <div className="color-group">
                                    <label>Border</label>
                                    <input
                                        type="color"
                                        value={getColorValue(customThemeData.colors.border)}
                                        onChange={(e) => handleColorChange('border', e.target.value)}
                                    />
                                    <span>{customThemeData.colors.border}</span>
                                </div>

                                <div className="color-group">
                                    <label>Success</label>
                                    <input
                                        type="color"
                                        value={getColorValue(customThemeData.colors.success)}
                                        onChange={(e) => handleColorChange('success', e.target.value)}
                                    />
                                    <span>{customThemeData.colors.success}</span>
                                </div>
                            </div>
                        </div>

                        <div className="preview-section">
                            <h4>🔍 Preview</h4>
                            <div className="custom-theme-preview">
                                <div className="preview-bg" style={{ background: customThemeData.colors.background }}>
                                    <div className="preview-card" style={{
                                        background: customThemeData.colors.surface,
                                        border: `2px solid ${customThemeData.colors.border}`
                                    }}>
                                        <h5 style={{ color: customThemeData.colors.text }}>Sample Card</h5>
                                        <p style={{ color: customThemeData.colors.textSecondary }}>
                                            This is how your theme will look
                                        </p>
                                        <div className="preview-badges">
                                            <span className="badge" style={{
                                                background: customThemeData.colors.primary,
                                                color: 'white'
                                            }}>
                                                Primary
                                            </span>
                                            <span className="badge" style={{
                                                background: customThemeData.colors.success,
                                                color: 'white'
                                            }}>
                                                Success
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => setIsCreatingCustom(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="create-btn"
                                onClick={handleCreateCustomTheme}
                                disabled={!customThemeData.name.trim()}
                            >
                                🎨 Create Theme
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThemeSettings;
