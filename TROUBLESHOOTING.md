# Troubleshooting Guide

## Error: "The requested module '/src/api/types.ts' does not provide an export named 'CreateSessionDto'"

### Problem
Error ini terjadi karena ada masalah dengan module resolution atau cache TypeScript/Vite.

### Solutions

#### 1. Quick Fix (Recommended)
Jalankan script clear cache:

**Windows (PowerShell):**
```powershell
.\clear-cache.ps1
```

**Windows (Command Prompt):**
```cmd
clear-cache.bat
```

**Manual:**
```bash
# Stop development server (Ctrl+C)
# Clear cache
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

#### 2. Alternative Fix
Jika error masih terjadi, gunakan file types terpisah:

1. File `src/api/whatsappTypes.ts` sudah dibuat
2. Import sudah diupdate ke file terpisah
3. Restart development server

#### 3. Check Import Paths
Pastikan import paths benar:

```typescript
// ✅ Correct
import { CreateSessionDto } from '../../api/whatsappTypes';

// ❌ Wrong
import { CreateSessionDto } from '../../api/types';
```

#### 4. TypeScript Cache
Clear TypeScript cache:

```bash
# Clear TypeScript cache
rm -rf .tsbuildinfo
rm -rf dist
npm run build
```

#### 5. Vite Cache
Clear Vite cache:

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Prevention
- Selalu restart development server setelah menambah export baru
- Gunakan `type` import untuk types: `import type { ... }`
- Pisahkan types ke file terpisah untuk module yang kompleks

### Files Modified
- `src/api/whatsappTypes.ts` - New file with WhatsApp types
- `src/store/whatsappSessions.ts` - Updated imports
- `src/components/whatsapp/WhatsAppManager.tsx` - Updated imports
- `src/components/whatsapp/SessionForm.tsx` - Updated imports
- `src/components/whatsapp/SessionCard.tsx` - Updated imports
