// src/firebase/firebase.d.ts - UPDATED WITH CORRECT MODULE DECLARATIONS
declare module 'firebase/app' {
  export * from '@firebase/app';
}

declare module 'firebase/firestore' {
  export * from '@firebase/firestore';
}

declare module 'firebase/analytics' {
  export * from '@firebase/analytics';
}

declare module 'firebase/auth' {
  export * from '@firebase/auth';
}

declare module 'firebase/performance' {
  export * from '@firebase/performance';
}

// Or if you want specific exports:
declare module 'firebase/firestore' {
  export {
    Firestore,
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    enableIndexedDbPersistence,
    DocumentData,
    QuerySnapshot,
    DocumentSnapshot
  } from '@firebase/firestore';
}

declare module 'firebase/analytics' {
  export {
    Analytics,
    getAnalytics,
    logEvent,
    setUserId,
    setUserProperties,
    isSupported
  } from '@firebase/analytics';
}