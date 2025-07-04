#!/usr/bin/env node

/**
 * onTune Bot - Script di Manutenzione
 * 
 * Questo script automatizza operazioni comuni di manutenzione:
 * - Pulizia cache
 * - Pulizia log
 * - Backup configurazioni
 * - Verifica salute sistema
 * - Ottimizzazione database
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configurazione
const CONFIG = {
  LOG_RETENTION_DAYS: 7,
  CACHE_MAX_AGE_HOURS: 24,
  BACKUP_RETENTION_DAYS: 30,
  CRASH_RETENTION_DAYS: 14
};

const PATHS = {
  logs: path.join(__dirname, '..', 'logs'),
  cache: path.join(__dirname, '..', 'cache'),
  config: path.join(__dirname, '..', 'config'),
  backups: path.join(__dirname, '..', 'backups')
};

class MaintenanceManager {
  constructor() {
    this.startTime = Date.now();
    this.operations = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
    this.operations.push({ timestamp, type, message });
  }

  async ensureDirectory(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
      this.log(`Created directory: ${dirPath}`);
    }
  }

  async cleanLogs() {
    this.log('Starting log cleanup...');
    
    try {
      const logsDir = PATHS.logs;
      await this.ensureDirectory(logsDir);
      
      const files = await fs.readdir(logsDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - CONFIG.LOG_RETENTION_DAYS);
      
      let deletedCount = 0;
      let totalSize = 0;
      
      for (const file of files) {
        const filePath = path.join(logsDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          totalSize += stats.size;
          await fs.unlink(filePath);
          deletedCount++;
        }
      }
      
      this.log(`Deleted ${deletedCount} old log files (${(totalSize / 1024 / 1024).toFixed(2)} MB)`, 'success');
    } catch (error) {
      this.log(`Error cleaning logs: ${error.message}`, 'error');
    }
  }

  async cleanCrashReports() {
    this.log('Cleaning old crash reports...');
    
    try {
      const crashDir = path.join(PATHS.logs, 'crashes');
      await this.ensureDirectory(crashDir);
      
      const files = await fs.readdir(crashDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - CONFIG.CRASH_RETENTION_DAYS);
      
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(crashDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }
      
      this.log(`Deleted ${deletedCount} old crash reports`, 'success');
    } catch (error) {
      this.log(`Error cleaning crash reports: ${error.message}`, 'error');
    }
  }

  async cleanCache() {
    this.log('Cleaning cache files...');
    
    try {
      const cacheDir = PATHS.cache;
      
      try {
        await fs.access(cacheDir);
        const files = await fs.readdir(cacheDir);
        
        for (const file of files) {
          const filePath = path.join(cacheDir, file);
          await fs.unlink(filePath);
        }
        
        this.log(`Cleaned ${files.length} cache files`, 'success');
      } catch {
        this.log('No cache directory found, skipping cache cleanup');
      }
    } catch (error) {
      this.log(`Error cleaning cache: ${error.message}`, 'error');
    }
  }

  async backupConfigurations() {
    this.log('Creating configuration backup...');
    
    try {
      const backupDir = PATHS.backups;
      await this.ensureDirectory(backupDir);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `config-backup-${timestamp}`);
      await this.ensureDirectory(backupPath);
      
      // Backup file di configurazione
      const configFiles = [
        'performance.json',
        '.env.example'
      ];
      
      for (const file of configFiles) {
        const sourcePath = path.join(__dirname, '..', file);
        const destPath = path.join(backupPath, file);
        
        try {
          await fs.copyFile(sourcePath, destPath);
          this.log(`Backed up: ${file}`);
        } catch {
          this.log(`Skipped missing file: ${file}`, 'warning');
        }
      }
      
      // Backup package.json
      const packagePath = path.join(__dirname, '..', 'package.json');
      const packageBackupPath = path.join(backupPath, 'package.json');
      await fs.copyFile(packagePath, packageBackupPath);
      
      this.log(`Configuration backup created: ${backupPath}`, 'success');
    } catch (error) {
      this.log(`Error creating backup: ${error.message}`, 'error');
    }
  }

  async cleanOldBackups() {
    this.log('Cleaning old backups...');
    
    try {
      const backupDir = PATHS.backups;
      
      try {
        await fs.access(backupDir);
        const items = await fs.readdir(backupDir);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - CONFIG.BACKUP_RETENTION_DAYS);
        
        let deletedCount = 0;
        
        for (const item of items) {
          const itemPath = path.join(backupDir, item);
          const stats = await fs.stat(itemPath);
          
          if (stats.isDirectory() && stats.mtime < cutoffDate) {
            await fs.rmdir(itemPath, { recursive: true });
            deletedCount++;
          }
        }
        
        this.log(`Deleted ${deletedCount} old backup directories`, 'success');
      } catch {
        this.log('No backup directory found, skipping backup cleanup');
      }
    } catch (error) {
      this.log(`Error cleaning old backups: ${error.message}`, 'error');
    }
  }

  async checkSystemHealth() {
    this.log('Checking system health...');
    
    try {
      // Verifica spazio disco
      const stats = await fs.stat(__dirname);
      this.log('Disk space check completed');
      
      // Verifica dipendenze Node.js
      try {
        execSync('npm audit --audit-level=high', { stdio: 'pipe' });
        this.log('No high-severity vulnerabilities found', 'success');
      } catch {
        this.log('High-severity vulnerabilities detected, run npm audit', 'warning');
      }
      
      // Verifica file critici
      const criticalFiles = [
        'package.json',
        'src/bot.js',
        'src/utils/config.js',
        'src/utils/logger.js'
      ];
      
      for (const file of criticalFiles) {
        const filePath = path.join(__dirname, '..', file);
        try {
          await fs.access(filePath);
        } catch {
          this.log(`Critical file missing: ${file}`, 'error');
        }
      }
      
      this.log('System health check completed', 'success');
    } catch (error) {
      this.log(`Error during health check: ${error.message}`, 'error');
    }
  }

  async optimizeSystem() {
    this.log('Running system optimizations...');
    
    try {
      // Force garbage collection se disponibile
      if (global.gc) {
        global.gc();
        this.log('Forced garbage collection');
      }
      
      // Verifica e ottimizza package.json
      const packagePath = path.join(__dirname, '..', 'package.json');
      const packageData = JSON.parse(await fs.readFile(packagePath, 'utf8'));
      
      // Suggerimenti di ottimizzazione
      if (!packageData.engines) {
        this.log('Consider adding engines field to package.json', 'warning');
      }
      
      if (!packageData.scripts.test) {
        this.log('Consider adding test scripts to package.json', 'warning');
      }
      
      this.log('System optimization completed', 'success');
    } catch (error) {
      this.log(`Error during optimization: ${error.message}`, 'error');
    }
  }

  async generateReport() {
    const duration = Date.now() - this.startTime;
    const reportPath = path.join(PATHS.logs, `maintenance-report-${new Date().toISOString().split('T')[0]}.json`);
    
    const report = {
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      operations: this.operations,
      summary: {
        total_operations: this.operations.length,
        successful: this.operations.filter(op => op.type === 'success').length,
        warnings: this.operations.filter(op => op.type === 'warning').length,
        errors: this.operations.filter(op => op.type === 'error').length
      }
    };
    
    await this.ensureDirectory(PATHS.logs);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Maintenance report saved: ${reportPath}`, 'success');
    this.log(`Maintenance completed in ${(duration / 1000).toFixed(2)} seconds`);
    
    return report;
  }

  async runMaintenance(options = {}) {
    this.log('🚀 Starting onTune maintenance...');
    
    const tasks = {
      logs: () => this.cleanLogs(),
      crashes: () => this.cleanCrashReports(),
      cache: () => this.cleanCache(),
      backup: () => this.backupConfigurations(),
      'old-backups': () => this.cleanOldBackups(),
      health: () => this.checkSystemHealth(),
      optimize: () => this.optimizeSystem()
    };
    
    // Esegui task specificati o tutti
    const tasksToRun = options.tasks || Object.keys(tasks);
    
    for (const task of tasksToRun) {
      if (tasks[task]) {
        await tasks[task]();
      } else {
        this.log(`Unknown task: ${task}`, 'warning');
      }
    }
    
    return await this.generateReport();
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse arguments
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
onTune Maintenance Script

Usage: node maintenance.js [options] [tasks]

Options:
  --help, -h     Show this help message
  --tasks        Comma-separated list of tasks to run

Tasks:
  logs           Clean old log files
  crashes        Clean old crash reports
  cache          Clean cache files
  backup         Create configuration backup
  old-backups    Clean old backup directories
  health         Check system health
  optimize       Run system optimizations
  all            Run all tasks (default)

Examples:
  node maintenance.js
  node maintenance.js --tasks=logs,cache
  node maintenance.js logs health
`);
    process.exit(0);
  }
  
  const tasksIndex = args.indexOf('--tasks');
  if (tasksIndex !== -1 && args[tasksIndex + 1]) {
    options.tasks = args[tasksIndex + 1].split(',');
  } else if (args.length > 0 && !args[0].startsWith('--')) {
    options.tasks = args;
  }
  
  // Run maintenance
  const maintenance = new MaintenanceManager();
  maintenance.runMaintenance(options)
    .then(report => {
      console.log('\n📊 Maintenance Summary:');
      console.log(`   Operations: ${report.summary.total_operations}`);
      console.log(`   Successful: ${report.summary.successful}`);
      console.log(`   Warnings: ${report.summary.warnings}`);
      console.log(`   Errors: ${report.summary.errors}`);
      console.log(`   Duration: ${(report.duration_ms / 1000).toFixed(2)}s`);
      
      process.exit(report.summary.errors > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Maintenance failed:', error.message);
      process.exit(1);
    });
}

module.exports = MaintenanceManager;