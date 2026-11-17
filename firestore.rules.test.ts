/**
 * Phase 0 Security Rules Test Specification (Dirty Dozen Verification)
 * Verifies that all 12 adversarial payloads result in PERMISSION_DENIED.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated write to CampWorkspace',
    operation: 'create',
    path: '/campWorkspaces/sk_lupak_2026',
    auth: null,
    payload: { campId: 'sk_lupak_2026' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified email spoof attempt',
    operation: 'create',
    path: '/campWorkspaces/sk_lupak_2026',
    auth: { uid: 'u1', email: 'eil040711@gmail.com', email_verified: false },
    payload: { campId: 'sk_lupak_2026', ownerId: 'u1' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Identity spoofing ownerId on create',
    operation: 'create',
    path: '/campWorkspaces/sk_lupak_2026',
    auth: { uid: 'u1', email: 'teacher@sklupak.edu.my', email_verified: true },
    payload: { campId: 'sk_lupak_2026', ownerId: 'u2', updatedByUid: 'u1' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Path variable mismatch on campId',
    operation: 'create',
    path: '/campWorkspaces/sk_lupak_2026',
    auth: { uid: 'u1', email: 'teacher@sklupak.edu.my', email_verified: true },
    payload: { campId: 'wrong_camp_id', ownerId: 'u1', updatedByUid: 'u1' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow field injection on update',
    operation: 'update',
    path: '/campWorkspaces/sk_lupak_2026',
    auth: { uid: 'u1', email: 'teacher@sklupak.edu.my', email_verified: true },
    payload: { isAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Immutable ownerId mutation on update',
    operation: 'update',
    path: '/campWorkspaces/sk_lupak_2026',
    auth: { uid: 'u1', email: 'teacher@sklupak.edu.my', email_verified: true },
    payload: { ownerId: 'hacker_uid' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Forged client timestamp on create',
    operation: 'create',
    path: '/campWorkspaces/sk_lupak_2026',
    auth: { uid: 'u1', email: 'teacher@sklupak.edu.my', email_verified: true },
    payload: { createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Oversized lastAction string (>300 chars)',
    operation: 'update',
    path: '/campWorkspaces/sk_lupak_2026',
    auth: { uid: 'u1', email: 'teacher@sklupak.edu.my', email_verified: true },
    payload: { lastAction: 'X'.repeat(450) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Unbounded stations array (>20 items)',
    operation: 'update',
    path: '/campWorkspaces/sk_lupak_2026',
    auth: { uid: 'u1', email: 'teacher@sklupak.edu.my', email_verified: true },
    payload: { stations: new Array(25).fill({ id: 'st1' }) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Orphaned SyncLogEntry creation without parent CampWorkspace',
    operation: 'create',
    path: '/campWorkspaces/non_existent/syncLogs/log_1',
    auth: { uid: 'u1', email: 'teacher@sklupak.edu.my', email_verified: true },
    payload: { logId: 'log_1', campId: 'non_existent', ownerId: 'u1' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Tampering with immutable SyncLogEntry via update',
    operation: 'update',
    path: '/campWorkspaces/sk_lupak_2026/syncLogs/log_1',
    auth: { uid: 'u1', email: 'teacher@sklupak.edu.my', email_verified: true },
    payload: { description: 'Tampered description' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Invalid document ID characters',
    operation: 'create',
    path: '/campWorkspaces/bad$id!',
    auth: { uid: 'u1', email: 'teacher@sklupak.edu.my', email_verified: true },
    payload: { campId: 'bad$id!' },
    expectedResult: 'PERMISSION_DENIED',
  },
];
