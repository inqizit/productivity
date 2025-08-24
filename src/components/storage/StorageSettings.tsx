import React, { useState, useEffect } from 'react';
import { storageManager, StorageManager, StorageType } from '../../utils/storage/StorageManager';
import './StorageSettings.css';

interface StorageInfo {
  type: StorageType;
  location: string;
  size: string;
  available: boolean;
}

interface StorageSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const StorageSettings: React.FC<StorageSettingsProps> = ({ isOpen, onClose }) => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [exportData, setExportData] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStorageInfo();
    }
  }, [isOpen]);

  const loadStorageInfo = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const info = await storageManager.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to load storage info:', error);
      setError('Failed to load storage information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDirectory = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError('');
      
      const success = await storageManager.selectStorageDirectory();
      if (success) {
        setSuccess('✅ Storage directory selected! Your data will now be saved to your chosen folder.');
        await loadStorageInfo();
      } else {
        setError('Failed to select storage directory');
      }
    } catch (error: any) {
      console.error('Directory selection failed:', error);
      if (error.message.includes('not supported')) {
        setError('❌ File System Access not supported in this browser. Try Chrome, Edge, or Safari.');
      } else if (error.name === 'AbortError') {
        // User cancelled, not an error
        setError('');
      } else {
        setError('Failed to select directory: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError('');
      
      const exportSQL = await storageManager.exportData();
      setExportData(exportSQL);
      setShowExportModal(true);
    } catch (error: any) {
      console.error('Export failed:', error);
      setError('Failed to export data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadExport = (): void => {
    const blob = new Blob([exportData], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productivity-suite-backup-${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccess('✅ Data exported successfully!');
    setShowExportModal(false);
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError('');

      const text = await file.text();
      await storageManager.importData(text);
      setSuccess('✅ Data imported successfully! Please refresh the page to see changes.');
    } catch (error: any) {
      console.error('Import failed:', error);
      setError('Failed to import data: ' + error.message);
    } finally {
      setIsLoading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const clearMessages = (): void => {
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div className="storage-overlay">
      <div className="storage-modal">
        <div className="storage-header">
          <h2>💾 Storage Settings</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="storage-content">
          {error && (
            <div className="message error">
              {error}
              <button onClick={clearMessages}>✕</button>
            </div>
          )}

          {success && (
            <div className="message success">
              {success}
              <button onClick={clearMessages}>✕</button>
            </div>
          )}

          {isLoading && (
            <div className="loading-indicator">
              <div className="spinner">⏳</div>
              <p>Processing...</p>
            </div>
          )}

          <div className="storage-info-section">
            <h3>📊 Current Storage</h3>
            {storageInfo && (
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Type:</span>
                  <span className="info-value">
                    {storageInfo.type === 'fileSystem' ? '📁 File System' : 
                     storageInfo.type === 'localStorage' ? '🌐 Browser Storage' : 
                     '💾 IndexedDB'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Location:</span>
                  <span className="info-value">{storageInfo.location}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Size:</span>
                  <span className="info-value">{storageInfo.size}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`info-value ${storageInfo.available ? 'available' : 'unavailable'}`}>
                    {storageInfo.available ? '✅ Available' : '❌ Unavailable'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="storage-actions-section">
            <h3>⚙️ Storage Options</h3>

            {StorageManager.isFileSystemAccessSupported() ? (
              <div className="action-group">
                <div className="action-description">
                  <h4>📁 Use Local Folder</h4>
                  <p>
                    Save your data to a folder on your computer for unlimited storage, 
                    better performance, and data you fully control.
                  </p>
                  <div className="benefits">
                    <span className="benefit">✅ Unlimited storage</span>
                    <span className="benefit">✅ Better performance</span>
                    <span className="benefit">✅ Data ownership</span>
                    <span className="benefit">✅ Survives browser cleanup</span>
                  </div>
                </div>
                <button 
                  className="action-button primary"
                  onClick={handleSelectDirectory}
                  disabled={isLoading}
                >
                  📁 Select Storage Folder
                </button>
              </div>
            ) : (
              <div className="action-group disabled">
                <div className="action-description">
                  <h4>📁 File System Storage</h4>
                  <p>
                    File System Access is not supported in this browser. 
                    For unlimited storage, try using Chrome, Edge, or Safari.
                  </p>
                  <p>Currently using browser localStorage (limited to ~5-10MB).</p>
                </div>
                <button className="action-button disabled" disabled>
                  📁 Not Supported
                </button>
              </div>
            )}
          </div>

          <div className="data-management-section">
            <h3>📤 Data Management</h3>
            
            <div className="action-group">
              <div className="action-description">
                <h4>💾 Export Data</h4>
                <p>Download all your data as a SQL file for backup or migration.</p>
              </div>
              <button 
                className="action-button secondary"
                onClick={handleExportData}
                disabled={isLoading}
              >
                📤 Export All Data
              </button>
            </div>

            <div className="action-group">
              <div className="action-description">
                <h4>📥 Import Data</h4>
                <p>Restore data from a previously exported SQL file.</p>
              </div>
              <label className="file-input-label">
                <input
                  type="file"
                  accept=".sql"
                  onChange={handleImportData}
                  disabled={isLoading}
                  className="file-input"
                />
                📥 Import SQL File
              </label>
            </div>
          </div>

          <div className="help-section">
            <h3>❓ Help</h3>
            <div className="help-content">
              <h4>Storage Types Explained:</h4>
              <ul>
                <li><strong>Browser Storage:</strong> Limited (~5-10MB), can be cleared by browser</li>
                <li><strong>File System:</strong> Unlimited, persistent, you control the location</li>
              </ul>
              
              <h4>Recommendations:</h4>
              <ul>
                <li>Use <strong>File System</strong> for heavy usage (lots of todos, chat history)</li>
                <li>Use <strong>Browser Storage</strong> for light usage or unsupported browsers</li>
                <li>Export your data regularly as backup</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showExportModal && (
        <div className="export-overlay">
          <div className="export-modal">
            <div className="export-header">
              <h3>📤 Export Data</h3>
              <button onClick={() => setShowExportModal(false)}>✕</button>
            </div>
            <div className="export-content">
              <p>Your data export is ready! Choose what to do with it:</p>
              <div className="export-actions">
                <button className="export-button download" onClick={handleDownloadExport}>
                  💾 Download File
                </button>
                <button className="export-button copy" onClick={() => {
                  navigator.clipboard.writeText(exportData);
                  setSuccess('✅ Copied to clipboard!');
                  setShowExportModal(false);
                }}>
                  📋 Copy to Clipboard
                </button>
              </div>
              <div className="export-preview">
                <h4>Preview:</h4>
                <pre className="sql-preview">
                  {exportData.substring(0, 500)}
                  {exportData.length > 500 ? '\n... (truncated)' : ''}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageSettings;
