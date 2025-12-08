// Type definitions for Firebase
declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string
    options: Record<string, any>
    automaticDataCollectionEnabled: boolean
  }
  
  export function initializeApp(options: any, name?: string): FirebaseApp
  export function getApp(name?: string): FirebaseApp
  export function getApps(): FirebaseApp[]
  export function deleteApp(app: FirebaseApp): Promise<void>
}

declare module 'firebase/firestore' {
  export interface Firestore {}
  export interface DocumentData {}
  export interface QueryDocumentSnapshot<T = DocumentData> {
    data(): T
    id: string
  }
  export interface QuerySnapshot {
    forEach(callback: (snapshot: QueryDocumentSnapshot) => void): void
    docs: QueryDocumentSnapshot[]
  }
  export interface DocumentSnapshot<T = DocumentData> {
    data(): T | undefined
    id: string
    exists(): boolean
  }
  export interface DocumentReference<T = DocumentData> {
    id: string
  }
  export interface CollectionReference<T = DocumentData> {}
  export interface Query<T = DocumentData> {}
  export interface QueryConstraint {}
  
  export function getFirestore(app?: any): Firestore
  export function collection(firestore: Firestore, path: string): CollectionReference
  export function addDoc<T>(collection: CollectionReference<T>, data: T): Promise<DocumentReference<T>>
  export function getDocs<T>(query: Query<T>): Promise<QuerySnapshot>
  export function query<T>(collection: CollectionReference<T>, ...queryConstraints: QueryConstraint[]): Query<T>
  export function orderBy(field: string, direction?: 'asc' | 'desc'): QueryConstraint
  export function limit(limit: number): QueryConstraint
  export function deleteDoc(docRef: DocumentReference): Promise<void>
  export function doc(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference
  export function enableIndexedDbPersistence(firestore: Firestore): Promise<void>
}

declare module 'firebase/auth' {
  export interface Auth {}
  export interface User {}
  export interface UserCredential {
    user: User
  }
  
  export function getAuth(app?: any): Auth
  export function signInAnonymously(auth: Auth): Promise<UserCredential>
}

// Type definitions for our Firebase service
declare module '../services/firebase' {
  import { FirebaseApp } from 'firebase/app'
  import { Firestore } from 'firebase/firestore'
  import { Auth } from 'firebase/auth'

  // Firebase instances
  export function initFirebaseApp(): Promise<boolean>
  export function getFirebaseInstances(): {
    app: FirebaseApp | undefined
    db: Firestore | undefined
    auth: Auth | undefined
    isInitialized: boolean
  }

  // Device ID
  export function getDeviceId(): string

  // Image handling
  export function compressImage(base64Str: string, maxWidth?: number, maxHeight?: number, quality?: number): Promise<string>
  export function isBase64Image(str: string): boolean

  // Job functions
  export function saveJobToFirebase(jobData: any): Promise<{ success: boolean; id?: string; error?: any }>
  export function getJobsFromFirebase(forceRefresh?: boolean): Promise<any[]>
  export function deleteJobFromFirebase(jobId: string): Promise<boolean>
  export function syncLocalJobsToFirebase(): Promise<{ success: number; failed: number }>
  export function clearFirebaseJobCache(): void

  // Drive functions
  export function saveDriveToFirebase(driveData: any): Promise<{ success: boolean; id?: string; error?: any }>
  export function getDrivesFromFirebase(forceRefresh?: boolean): Promise<any[]>
  export function deleteDriveFromFirebase(driveId: string): Promise<boolean>
  export function syncLocalDrivesToFirebase(): Promise<{ success: number; failed: number }>
  export function clearFirebaseDriveCache(): void
  export function cleanupOldDrives(): Promise<{ removed: number; total: number }>

  // General functions
  export function checkFirebaseConnection(): Promise<boolean>
  export function clearFirebaseCache(): void
  export function resetFirebase(): void

  // Default export
  const firebaseService: {
    app: FirebaseApp | undefined
    db: Firestore | undefined
    auth: Auth | undefined
    isInitialized: boolean
    getFirebaseInstances: () => ReturnType<typeof getFirebaseInstances>
    saveJobToFirebase: typeof saveJobToFirebase
    getJobsFromFirebase: typeof getJobsFromFirebase
    deleteJobFromFirebase: typeof deleteJobFromFirebase
    syncLocalJobsToFirebase: typeof syncLocalJobsToFirebase
    clearFirebaseJobCache: typeof clearFirebaseJobCache
    saveDriveToFirebase: typeof saveDriveToFirebase
    getDrivesFromFirebase: typeof getDrivesFromFirebase
    deleteDriveFromFirebase: typeof deleteDriveFromFirebase
    syncLocalDrivesToFirebase: typeof syncLocalDrivesToFirebase
    clearFirebaseDriveCache: typeof clearFirebaseDriveCache
    cleanupOldDrives: typeof cleanupOldDrives
    compressImage: typeof compressImage
    isBase64Image: typeof isBase64Image
    initFirebaseApp: typeof initFirebaseApp
    checkFirebaseConnection: typeof checkFirebaseConnection
    getDeviceId: typeof getDeviceId
    clearFirebaseCache: typeof clearFirebaseCache
    resetFirebase: typeof resetFirebase
  }
  
  export default firebaseService
}

// Type definitions for Firebase configuration
interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}

// Job data interface
interface JobData {
  id: string
  title: string
  company: string
  location: string
  type: string
  sector: string
  salary: string
  description: string
  requirements: string[]
  postedDate: string
  applyLink: string
  featured?: boolean
  isReal?: boolean
  addedTimestamp?: number
  page?: number
  deviceId?: string
  firebaseCreated?: string
  isSynced?: boolean
}

// Drive data interface
interface DriveData {
  id: string
  title: string
  company: string
  location: string
  date: string
  time: string
  image: string
  description: string
  eligibility: string[]
  documents: string[]
  applyLink: string
  contact: string
  featured?: boolean
  addedTimestamp?: number
  expectedCandidates?: number | null
  registrationLink?: string
  driveType?: string
  experience?: string
  salary?: string
  isNew?: boolean
  deviceId?: string
  firebaseCreated?: string
  isSynced?: boolean
}

// Sync result interface
interface SyncResult {
  success: number
  failed: number
}

// Cleanup result interface
interface CleanupResult {
  removed: number
  total: number
}