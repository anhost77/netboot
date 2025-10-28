'use client';

import { notificationService } from '@/lib/notification-service';

export function ToastTest() {
  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2">
      <button
        onClick={() => notificationService.success('Test Success', 'Ceci est un test de notification success')}
        className="block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Test Success
      </button>
      <button
        onClick={() => notificationService.error('Test Error', 'Ceci est un test de notification error')}
        className="block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Test Error
      </button>
      <button
        onClick={() => notificationService.warning('Test Warning', 'Ceci est un test de notification warning')}
        className="block px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
      >
        Test Warning
      </button>
      <button
        onClick={() => notificationService.info('Test Info', 'Ceci est un test de notification info')}
        className="block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Test Info
      </button>
    </div>
  );
}
